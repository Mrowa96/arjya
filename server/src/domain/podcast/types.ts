import type { InferOutput } from 'valibot';

import type {
  addPodcastDTOSchema,
  basePodcastSchema,
  podcastCollectionSchema,
  podcastEpisodeSchema,
  podcastSchema,
  rawPodcastCollectionSchema,
  rawPodcastEpisodeSchema,
  rawPodcastSchema,
  rssFeedSchema,
  standadlonePodcastEpisodeSchema,
} from './schema.ts';

export type RssFeed = InferOutput<typeof rssFeedSchema>;

export type RssFeedItem = RssFeed['items'][number];

export type RawPodcast = InferOutput<typeof rawPodcastSchema>;

export type RawPodcastEpisode = InferOutput<typeof rawPodcastEpisodeSchema>;

export type RawPodcastCollectionSchema = InferOutput<typeof rawPodcastCollectionSchema>;

export type AddPodcastDTO = InferOutput<typeof addPodcastDTOSchema>;

export type BasePodcast = InferOutput<typeof basePodcastSchema>;

export type PodcastEpisode = InferOutput<typeof podcastEpisodeSchema>;

export type StandalonePodcastEpisode = InferOutput<typeof standadlonePodcastEpisodeSchema>;

export type Podcast = InferOutput<typeof podcastSchema>;

export type PodcastCollection = InferOutput<typeof podcastCollectionSchema>;
