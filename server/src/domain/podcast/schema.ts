import * as v from 'valibot';

import { createCollectionSchema } from '../../infrastructure/collection.ts';

const imageUrlSchema = v.pipe(v.string(), v.url());

const patroniteUrlSchema = v.pipe(v.string(), v.url());

export const rawPodcastSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.string(),
  description: v.nullable(v.string()),
  image_url: v.nullable(imageUrlSchema),
  thumbnail_url: v.nullable(imageUrlSchema),
  rss_feed_url: v.pipe(v.string(), v.url()),
  patronite_url: v.nullable(patroniteUrlSchema),
});

export const rawPodcastEpisodeSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  podcast_id: v.pipe(v.string(), v.uuid()),
  podcast_name: v.string(),
  podcast_image_url: v.nullable(imageUrlSchema),
  title: v.string(),
  description: v.nullable(v.string()),
  source_url: v.pipe(v.string(), v.url()),
  source_duration: v.number(),
  source_type: v.string(),
  image_url: v.nullable(v.pipe(v.string(), v.url())),
  elapsed_stream_time: v.nullable(v.number()),
  last_played_at: v.nullable(v.number()),
  is_downloaded: v.number(),
  published_at: v.number(),
  thumbnail_url: v.nullable(imageUrlSchema),
  was_thumbnail_download_triggered: v.number(),
});

export const rawPodcastEpisodesSchema = v.array(rawPodcastEpisodeSchema);

export const rawPodcastCollectionSchema = createCollectionSchema(rawPodcastSchema);

export const addPodcastDTOSchema = v.object({
  name: v.string(),
  description: v.string(),
  imageUrl: v.optional(imageUrlSchema),
  thumbnailUrl: v.optional(imageUrlSchema),
  patroniteUrl: v.optional(patroniteUrlSchema),
});

const rssFeedItemSchema = v.object({
  title: v.string(),
  contentSnippet: v.optional(v.string()),
  enclosure: v.object({
    url: v.pipe(v.string(), v.url()),
    type: v.string(),
  }),
  itunes: v.object({
    image: v.optional(v.pipe(v.string(), v.url())),
    duration: v.optional(v.union([v.string(), v.number()])),
  }),
  isoDate: v.string(),
});

const rssFeedItemWithDurationSchema = v.object({
  ...rssFeedItemSchema.entries,
  itunes: v.object({
    ...rssFeedItemSchema.entries.itunes.entries,
    duration: v.union([v.string(), v.number()]),
  }),
});

export const rssFeedSchema = v.pipe(
  v.object({
    title: v.string(),
    description: v.optional(v.string()),
    image: v.optional(
      v.object({
        url: v.optional(v.pipe(v.string(), v.url())),
      }),
    ),
    items: v.array(rssFeedItemSchema),
    itunes: v.optional(
      v.object({
        image: v.optional(v.pipe(v.string(), v.url())),
      }),
    ),
  }),
  v.transform((input) => {
    return {
      ...input,
      items: input.items
        .filter(
          (item): item is v.InferOutput<typeof rssFeedItemWithDurationSchema> =>
            !!item.itunes.duration,
        )
        .map((item) => {
          const { duration } = item.itunes;

          if (typeof duration === 'string' && duration.indexOf(':') !== -1) {
            const values = duration.split(':');

            const seconds = values[values.length - 1] || 0;
            const minutes = values[values.length - 2] || 0;
            const hours = values[values.length - 3] || 0;

            const durationInSeconds = +hours * 60 * 60 + +minutes * 60 + +seconds;

            return {
              ...item,
              itunes: {
                ...item.itunes,
                duration: durationInSeconds,
              },
            };
          } else {
            const parsedDuration =
              typeof duration === 'number' ? duration : Number.parseInt(duration);

            if (Number.isInteger(parsedDuration)) {
              return {
                ...item,
                itunes: {
                  ...item.itunes,
                  duration: parsedDuration,
                },
              };
            }
          }

          return item;
        }),
    };
  }),
);

export const basePodcastSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.string(),
  description: v.nullable(v.string()),
  imageUrl: v.nullable(imageUrlSchema),
  thumbnailUrl: v.nullable(imageUrlSchema),
  rssFeedUrl: v.pipe(v.string(), v.url()),
  patroniteUrl: v.nullable(v.pipe(v.string(), v.url())),
});

export const podcastEpisodeSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  title: v.string(),
  description: v.nullable(v.string()),
  imageUrl: v.nullable(imageUrlSchema),
  thumbnailUrl: v.nullable(imageUrlSchema),
  podcast: v.object({
    id: v.pipe(v.string(), v.uuid()),
    name: v.string(),
  }),
  source: v.object({
    url: v.pipe(v.string(), v.url()),
    type: v.string(),
    duration: v.number(),
  }),
  elapsedStreamTime: v.nullable(v.number()),
  streamProgress: v.number(),
  isDownloaded: v.boolean(),
  isStreamCompleted: v.boolean(),
  publishedAt: v.number(),
  lastPlayedAt: v.nullable(v.number()),
});

export const standadlonePodcastEpisodeSchema = v.object({
  ...podcastEpisodeSchema.entries,
  wasThumbnailDownloadTriggered: v.boolean(),
});

export const podcastSchema = v.object({
  ...basePodcastSchema.entries,
  episodes: v.array(podcastEpisodeSchema),
});

export const podcastCollectionSchema = createCollectionSchema(basePodcastSchema);
