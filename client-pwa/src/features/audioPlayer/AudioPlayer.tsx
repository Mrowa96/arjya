import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import { toTimeLabel } from '../../utils/time';
import { tryCatch, tryCatchSync } from '../../utils/tryCatch';
import type {
  AudioPlayerActionsContextType,
  AudioPlayerDataContextType,
  Source,
  TrackElapsedTimeFn,
  UpdateSourceConfig,
  UpdateSourcePayload,
} from './types';

type Options = {
  restoreLastPlayedSource?:
    | false
    | {
        /**
         * It will be passed to `JSON.stringify` when saving last played source to storage.
         */
        onSourceStore: (id: string, data: unknown) => Promise<unknown>;

        /**
         * It will be used to parse stored data to enable restore functionality.
         */
        onStoredSourceParse: (data: unknown) => Promise<{ id: string; data?: unknown } | null>;
      };
};

type Props = {
  children: ReactNode;

  /**
   * Remember to memoize passed value!
   * If you won't you might see infinite rendering loop.
   */
  options?: Options;

  /**
   * Function is used to provide all needed source details for audio player.
   * You can use your own fetch logic from wherever place you want.
   * This function will be called internally after you call `updateSource()`.
   */
  onSourceUpdate: (id: string, data?: unknown) => Promise<UpdateSourcePayload>;
};

const AudioPlayerDataContext = createContext<AudioPlayerDataContextType<boolean>>({
  source: undefined,
  isLoading: false,
  isPlaying: false,
  isPaused: false,
  isFailed: false,
});

const AudioPlayerActionsContext = createContext<AudioPlayerActionsContextType>({
  play: () => Promise.resolve(undefined),
  seek: () => undefined,
  pause: () => undefined,
  updateSource: () => Promise.resolve(undefined),
  clearSource: () => undefined,
  setProgress: () => undefined,
});

const LAST_PLAYED_SOURCE_KEY = 'last_played_source';

const defaultOptions: Options = {
  restoreLastPlayedSource: false,
};

const updateSourceDefaultConfig = {
  autoPlay: true,
};

export function AudioPlayerProvider({ children, options = defaultOptions, onSourceUpdate }: Props) {
  const audioRef = useRef(new Audio());
  const [source, setSource] = useState<Source | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [status, setStatus] = useState<
    'loading' | 'loaded' | 'playing' | 'paused' | 'failed' | undefined
  >();
  const trackElapsedTimeTimer = useRef<number | null>(null);
  const trackElapsedTimeFnRef = useRef<TrackElapsedTimeFn | null>(null);

  const play = useCallback(async () => {
    if (status === 'failed') {
      audioRef.current.load();
    }

    try {
      await audioRef.current.play();

      // We do it here to speed up switch to next status.
      setStatus('playing');
    } catch (error) {
      console.error(error);
    }
  }, [status]);

  const pause = useCallback(() => {
    audioRef.current.pause();

    setStatus('paused');
  }, []);

  const seek = useCallback((seconds: number) => {
    audioRef.current.currentTime += seconds;
  }, []);

  const updateSource = useCallback(
    async (id: string, data?: unknown, config: UpdateSourceConfig = updateSourceDefaultConfig) => {
      const [newSource, newSourceError] = await tryCatch(() => onSourceUpdate(id, data), false);

      if (newSourceError) {
        console.error('Error when calling onSourceUpdate.', newSourceError);

        setStatus('failed');

        return;
      }

      const {
        url,
        title,
        subtitle,
        duration,
        thumbnailUrl,
        elapsedStreamTime,
        trackElapsedTimeFn,
      } = newSource;

      setStatus('loading');
      setSource({
        id,
        url,
        title,
        subtitle,
        duration,
        thumbnailUrl: thumbnailUrl || undefined,
        isRestoredFromLastPlayedSource: config.autoPlay === false,
        data,
      });

      trackElapsedTimeFnRef.current = trackElapsedTimeFn || null;

      audioRef.current.addEventListener('loadstart', () => {
        setStatus('loading');
      });

      audioRef.current.addEventListener('loadeddata', () => {
        setStatus('loaded');
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setStatus('loaded');
      });

      audioRef.current.addEventListener('playing', () => {
        setStatus('playing');
      });

      audioRef.current.addEventListener('pause', () => {
        setStatus('paused');
      });

      audioRef.current.addEventListener('error', (event) => {
        console.error(event);

        setStatus('failed');
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });

      if (options.restoreLastPlayedSource) {
        const { onSourceStore } = options.restoreLastPlayedSource;
        const [, storageError] = await tryCatch(async () =>
          localStorage.setItem(
            LAST_PLAYED_SOURCE_KEY,
            JSON.stringify(await onSourceStore(id, data)),
          ),
        );

        if (storageError) {
          console.error('Unable to save last played source for future restoration', storageError);
        }
      }

      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.currentTime = elapsedStreamTime;
      setCurrentTime(audioRef.current.currentTime);

      if (!config.autoPlay) {
        return;
      }

      // We need to trigger play here because webkit on ios doesn't allow us to do it in any other place
      // Thankfully it seems to work also on other devices
      return play();
    },
    [options.restoreLastPlayedSource, play, onSourceUpdate],
  );

  const clearSource = useCallback(() => {
    setSource(undefined);
    setCurrentTime(0);
    setStatus(undefined);

    audioRef.current.pause();
    audioRef.current.src = '';
    trackElapsedTimeTimer.current = null;
    trackElapsedTimeFnRef.current = null;
  }, []);

  /**
   * @param value Between 0 and 100
   */
  const setProgress = useCallback(
    (value: number) => {
      if (!source?.duration) {
        return;
      }

      let preparedValue = value;

      if (value < 0) {
        preparedValue = 0;
      }

      if (value > 100) {
        preparedValue = 100;
      }

      audioRef.current.currentTime = source?.duration * (preparedValue / 100);
    },
    [source?.duration],
  );

  const isLoading = status === 'loading';
  const isPlaying = status === 'playing';
  const isFailed = status === 'failed';
  const isPaused = !isPlaying;
  const hasSource = !!source?.id && !!source.title && !!source.duration;

  const durationText = useMemo(() => toTimeLabel(source?.duration), [source?.duration]);
  const currentTimeText = useMemo(() => toTimeLabel(currentTime), [currentTime]);
  const progress = !source?.duration ? 0 : (currentTime / source.duration) * 100;

  // TODO Handle error
  const trackElapsedTime = useEffectEvent(async () => {
    if (trackElapsedTimeFnRef.current) {
      await trackElapsedTimeFnRef.current(currentTime);
    }
  });

  useEffect(() => {
    window.clearInterval(trackElapsedTimeTimer.current || undefined);

    if (status === 'playing') {
      trackElapsedTimeTimer.current = window.setInterval(trackElapsedTime, 5000);

      if ('mediaSession' in navigator && source) {
        const title = typeof source.title === 'string' ? source.title : source.title.label;
        const subtitle = source.subtitle
          ? typeof source.subtitle === 'string'
            ? source.subtitle
            : source.subtitle.label
          : undefined;

        navigator.mediaSession.metadata = new MediaMetadata();
        navigator.mediaSession.metadata.title = title;

        if (subtitle) {
          navigator.mediaSession.metadata.artist = subtitle;
        }

        if (source.thumbnailUrl) {
          navigator.mediaSession.metadata.artwork = [
            {
              // TODO Improve image type and size handling
              src: source.thumbnailUrl,
              sizes: '256x256',
              type: 'image/jpg',
            },
          ];
        }

        navigator.mediaSession.setActionHandler('play', () => {
          play();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          pause();
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
          seek(-10);
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
          seek(10);
        });
      }
    }
  }, [status, source, play, pause, seek]);

  useEffect(() => {
    (async () => {
      // Skip if source is already set of feature is not enabled
      if (source?.id || !options.restoreLastPlayedSource) {
        return;
      }

      const [lastPlayedSource, lastPlayedSourceError] = tryCatchSync(() =>
        localStorage.getItem(LAST_PLAYED_SOURCE_KEY),
      );

      if (lastPlayedSourceError) {
        console.error(
          'Unable to access data for last played source from storage',
          lastPlayedSourceError,
        );

        return;
      }

      if (!lastPlayedSource) {
        return;
      }

      const { onStoredSourceParse } = options.restoreLastPlayedSource;

      const storedData = await onStoredSourceParse(JSON.parse(lastPlayedSource));

      if (!storedData) {
        console.error(
          'Data for last played source restoration exists, but onStoredSourceParse function returned null.',
        );

        return;
      }

      const { id, data } = storedData;

      await updateSource(id, data, {
        autoPlay: false,
      });
    })();
  }, [source?.id, options.restoreLastPlayedSource, updateSource]);

  const memoizedActions = useMemo(
    () => ({
      play,
      pause,
      seek,
      updateSource,
      clearSource,
      setProgress,
    }),
    [pause, play, seek, updateSource, clearSource, setProgress],
  );

  const memoizedData: AudioPlayerDataContextType<typeof hasSource> = useMemo(
    () => ({
      source: hasSource
        ? {
            ...source,
            durationText,
            currentTime,
            currentTimeText,
            progress,
          }
        : undefined,
      isLoading,
      isPlaying,
      isPaused,
      isFailed,
    }),
    [
      source,
      isLoading,
      isPlaying,
      isPaused,
      isFailed,
      hasSource,
      durationText,
      currentTime,
      currentTimeText,
      progress,
    ],
  );

  return (
    <AudioPlayerActionsContext.Provider value={memoizedActions}>
      <AudioPlayerDataContext.Provider value={memoizedData}>
        {children}
      </AudioPlayerDataContext.Provider>
    </AudioPlayerActionsContext.Provider>
  );
}

export function useAudioPlayerData() {
  return useContext(AudioPlayerDataContext);
}

export function useAudioPlayerActions() {
  return useContext(AudioPlayerActionsContext);
}
