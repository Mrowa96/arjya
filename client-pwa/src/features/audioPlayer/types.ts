export type AudioPlayerDataContextType<T extends boolean> = {
  source: T extends true
    ? Source & {
        durationText: string;
        currentTime: number;
        currentTimeText: string;
        progress: number;
      }
    : undefined;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isFailed: boolean;
};

export type AudioPlayerActionsContextType = {
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  updateSource: (id: string, data?: unknown) => Promise<void>;
  clearSource: () => void;
  setProgress: (value: number) => void;
};

export type TrackElapsedTimeFn = (elapsedTime: number) => Promise<unknown>;

export type SourceTitle =
  | string
  | {
      label: string;
      url: string;
    };

export type SourceSubtitle = SourceTitle | undefined;

export type UpdateSourcePayload = {
  id: string;
  url: string;
  title: SourceTitle;
  subtitle?: SourceSubtitle;
  duration: number;
  elapsedStreamTime: number;
  thumbnailUrl?: string | null;
  data?: unknown;
  trackElapsedTimeFn?: TrackElapsedTimeFn;
};

export type UpdateSourceConfig = {
  autoPlay: boolean;
};

export type Source = {
  id: string;
  url: string;
  title: SourceTitle;
  subtitle: SourceSubtitle;
  duration: number;
  thumbnailUrl?: string | undefined;
  isRestoredFromLastPlayedSource: boolean;
  /** Optional data passed to updateSource */
  data?: unknown;
};
