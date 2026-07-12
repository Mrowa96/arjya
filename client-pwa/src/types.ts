import type { ApiPodcastDetailData, ApiPodcastListData } from './utils/api';

export type Podcast = ApiPodcastListData['items'][number];

export type CloudEpisode = ApiPodcastDetailData['episodes'][number] & { type: 'cloud' };

export type LocalEpisode = ApiPodcastDetailData['episodes'][number] & {
  type: 'local';
  blob: Blob;
  thumbnail: Blob | null;
};

export type Episode = CloudEpisode | LocalEpisode;
