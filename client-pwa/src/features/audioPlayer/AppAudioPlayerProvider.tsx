import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';

import * as v from 'valibot';

import { usePrepareEpisode } from '../../hooks/api/usePrepareEpisode';
import { useUpdateEpisodeElapsedTime } from '../../hooks/api/useUpdateEpisodeElapsedTime';
import { createApiEndpointUrl } from '../../utils/api';
import { tryCatchSync } from '../../utils/tryCatch';
import { useLocalEpisodes } from '../localEpisodes/LocalEpisodesProvider';
import { useNetworkState } from '../networkState/NetworkStateProvider';
import { useSettings } from '../settings/SettingsProvider';
import { AudioPlayerProvider } from './AudioPlayer';

const updateSourceDataSchema = v.variant('type', [
  v.object({
    type: v.literal('cloud'),
    podcastId: v.pipe(v.string(), v.uuid()),
  }),
  v.object({
    type: v.literal('local'),
    episode: v.object({
      title: v.string(),
      podcast: v.object({
        id: v.pipe(v.string(), v.uuid()),
        name: v.string(),
      }),
      source: v.object({
        duration: v.number(),
      }),
      elapsedStreamTime: v.nullable(v.number()),
      thumbnailUrl: v.nullable(v.pipe(v.string(), v.url())),
      thumbnail: v.nullable(v.blob()),
      blob: v.blob(),
    }),
  }),
]);

const storedSourceDataSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  data: v.variant('type', [
    v.object({
      type: v.literal('cloud'),
      podcastId: v.pipe(v.string(), v.uuid()),
    }),
    v.object({
      type: v.literal('local'),
    }),
  ]),
});

export function AppAudioPlayerProvider({ children }: PropsWithChildren) {
  const { settings } = useSettings();
  const { mutateAsync: prepareEpisode } = usePrepareEpisode();
  // TODO Work on naming
  const { mutateAsync: trackElapsedTimeMutation } = useUpdateEpisodeElapsedTime();
  const { isOffline } = useNetworkState();
  const { getStoredEpisode } = useLocalEpisodes();
  const isOfflineRef = useRef(isOffline);

  useEffect(() => {
    isOfflineRef.current = isOffline;
  }, [isOffline]);

  const onSourceUpdate = useCallback(
    async (id: string, data: unknown) => {
      const parsedData = v.parse(updateSourceDataSchema, data);

      const trackElapsedTime = async (elapsedTime: number) => {
        if (isOfflineRef.current) {
          return;
        }

        return trackElapsedTimeMutation({
          podcastId:
            parsedData.type === 'cloud' ? parsedData.podcastId : parsedData.episode.podcast.id,
          episodeId: id,
          elapsedTime,
        });
      };

      if (parsedData.type === 'cloud') {
        const { podcastId } = parsedData;

        const episode = await prepareEpisode({
          podcastId,
          episodeId: id,
        });

        return {
          id,
          url: createApiEndpointUrl(`/podcast/${podcastId}/episode/${episode.id}/stream`),
          title: {
            label: episode.title,
            url: `/podcast/${podcastId}/episode/${episode.id}`,
          },
          subtitle: {
            label: episode.podcast.name,
            url: `/podcast/${podcastId}`,
          },
          duration: episode.source.duration,
          elapsedStreamTime: episode.elapsedStreamTime || 0,
          thumbnailUrl: episode.thumbnailUrl,
          trackElapsedTimeFn: trackElapsedTime,
        };
      } else {
        const { episode } = parsedData;

        return {
          id,
          url: URL.createObjectURL(episode.blob),
          title: {
            label: episode.title,
            url: `/podcast/${episode.podcast.id}/episode/${id}`,
          },
          subtitle: {
            label: episode.podcast.name,
            url: `/podcast/${episode.podcast.id}`,
          },
          duration: episode.source.duration,
          elapsedStreamTime: episode.elapsedStreamTime || 0,
          thumbnailUrl: episode.thumbnail
            ? URL.createObjectURL(episode.thumbnail)
            : episode.thumbnailUrl,
          trackElapsedTimeFn: trackElapsedTime,
        };
      }
    },
    [prepareEpisode, trackElapsedTimeMutation],
  );

  const onSourceStore = useCallback(async (id: string, data: unknown) => {
    const parsedData = v.parse(updateSourceDataSchema, data);

    if (parsedData.type === 'cloud') {
      return { id, data };
    }

    return {
      id,
      data: {
        type: 'local',
      },
    };
  }, []);

  const onStoredSourceParse = useCallback(
    async (data: unknown) => {
      const [parsedData, parseError] = tryCatchSync(
        () => v.parse(storedSourceDataSchema, data),
        false,
      );

      if (parseError) {
        console.error(parseError);

        return null;
      }

      if (parsedData.data.type === 'cloud') {
        return parsedData;
      }

      const localEpisode = await getStoredEpisode(parsedData.id);

      if (!localEpisode) {
        console.warn(
          'Last played episode data was stored, but episode cannot be found in local storage.',
        );

        return null;
      }

      return {
        ...parsedData,
        data: {
          ...parsedData.data,
          episode: localEpisode,
        },
      };
    },
    [getStoredEpisode],
  );

  const options = useMemo(
    () => ({
      restoreLastPlayedSource: settings?.restoreLastPlayedSource.enabled
        ? {
            onSourceStore,
            onStoredSourceParse,
          }
        : (false as const),
    }),
    [settings?.restoreLastPlayedSource.enabled, onSourceStore, onStoredSourceParse],
  );

  return (
    <AudioPlayerProvider options={options} onSourceUpdate={onSourceUpdate}>
      {children}
    </AudioPlayerProvider>
  );
}
