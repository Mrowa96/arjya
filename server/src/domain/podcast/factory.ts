import { convertPlainTextToHTML } from '../../infrastructure/text.ts';
import type {
  Podcast,
  PodcastCollection,
  PodcastEpisode,
  RawPodcast,
  RawPodcastCollectionSchema,
  RawPodcastEpisode,
  StandalonePodcastEpisode,
} from './types.ts';

export function createPodcast(
  rawPodcast: RawPodcast,
  rawPodcastEpisodes: RawPodcastEpisode[],
): Podcast {
  return {
    id: rawPodcast.id,
    name: rawPodcast.name,
    description: convertPlainTextToHTML(rawPodcast.description),
    imageUrl: rawPodcast.image_url,
    thumbnailUrl: rawPodcast.thumbnail_url,
    rssFeedUrl: rawPodcast.rss_feed_url,
    patroniteUrl: rawPodcast.patronite_url,
    episodes: rawPodcastEpisodes.map((rawPodcastEpisode) =>
      createPodcastEpisode(rawPodcastEpisode, false),
    ),
  };
}

export function createPodcastCollection(
  rawCollection: RawPodcastCollectionSchema,
): PodcastCollection {
  return {
    ...rawCollection,
    items: rawCollection.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.image_url,
      thumbnailUrl: item.thumbnail_url,
      rssFeedUrl: item.rss_feed_url,
      patroniteUrl: item.patronite_url,
    })),
  };
}

export function createPodcastEpisode(
  rawEpisode: RawPodcastEpisode,
  isStandalone: false,
): PodcastEpisode;

export function createPodcastEpisode(
  rawEpisode: RawPodcastEpisode,
  isStandalone: true,
): StandalonePodcastEpisode;

export function createPodcastEpisode(
  rawEpisode: RawPodcastEpisode,
  isStandalone: boolean,
): PodcastEpisode | StandalonePodcastEpisode {
  const basePodcastEpisode: PodcastEpisode = {
    id: rawEpisode.id,
    title: rawEpisode.title,
    description: convertPlainTextToHTML(rawEpisode.description),
    imageUrl: rawEpisode.image_url || rawEpisode.podcast_image_url,
    thumbnailUrl: rawEpisode.thumbnail_url,
    podcast: {
      id: rawEpisode.podcast_id,
      name: rawEpisode.podcast_name,
    },
    source: {
      url: rawEpisode.source_url,
      type: rawEpisode.source_type,
      duration: rawEpisode.source_duration,
    },
    elapsedStreamTime: rawEpisode.elapsed_stream_time,
    streamProgress: ((rawEpisode.elapsed_stream_time || 0) / rawEpisode.source_duration) * 100,
    isStreamCompleted: (rawEpisode.elapsed_stream_time || 0) / rawEpisode.source_duration > 0.95,
    isDownloaded: rawEpisode.is_downloaded === 1,
    publishedAt: rawEpisode.published_at,
    lastPlayedAt: rawEpisode.last_played_at,
  };

  if (isStandalone) {
    return {
      ...basePodcastEpisode,
      wasThumbnailDownloadTriggered: rawEpisode.was_thumbnail_download_triggered === 1,
    };
  }

  return basePodcastEpisode;
}
