import { randomUUID } from 'crypto';
import RssParser from 'rss-parser';

import {
  MAX_LIMIT,
  createEmptyCollection,
  totalSchema,
  useLimitGuard,
} from '../../infrastructure/collection.ts';
import { getDbInstance } from '../../infrastructure/db.ts';
import { parseData } from '../../infrastructure/parser.ts';
import { type Result, ResultError, resultErrorConst } from '../../infrastructure/result.ts';
import { tryCatch, tryCatchSync } from '../../infrastructure/tryCatch.ts';
import { createPodcast, createPodcastCollection, createPodcastEpisode } from './factory.ts';
import {
  rawPodcastCollectionSchema,
  rawPodcastEpisodeSchema,
  rawPodcastEpisodesSchema,
  rawPodcastSchema,
  rssFeedSchema,
} from './schema.ts';
import { PodcastDeleteDataService } from './services/PodcastDeleteDataService.ts';
import { PodcastThumbnailService } from './services/PodcastThumbnailService.ts';
import type { RssFeed, RssFeedItem, StandalonePodcastEpisode } from './types.ts';

async function parseRssFeed(rssFeedUrl: string) {
  const rssParser = new RssParser();

  const [rssFeed, rssParseError] = await tryCatch(() => rssParser.parseURL(rssFeedUrl));

  if (rssParseError) {
    throw new Error('Cannot parse provided rss feed.', { cause: rssParseError });
  }

  const parsedRssFeed = parseData(rssFeed, rssFeedSchema);

  if (!parsedRssFeed) {
    throw new Error('Cannot stricly parse provided rss feed.');
  }

  return parsedRssFeed;
}

async function insertPodcastEpisodes(podcastId: string, items: RssFeedItem[]) {
  const db = getDbInstance();

  const insertPodcastEpisodeStatement = db.prepare(
    `
    INSERT INTO podcast_episode (
        id, podcast_id, title, description, source_url, source_duration, source_type, image_url, published_at
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
  );

  const itemsWithIds = items.map((item) => ({ ...item, id: randomUUID() }));

  const insertEpisodes = db.transaction(
    (episodes: (RssFeed['items'][number] & { id: string })[]) => {
      for (const episode of episodes) {
        insertPodcastEpisodeStatement.run([
          episode.id,
          podcastId,
          episode.title,
          episode.contentSnippet,
          episode.enclosure.url,
          episode.itunes.duration,
          episode.enclosure.type,
          episode.itunes.image,
          new Date(episode.isoDate).getTime(),
        ]);
      }
    },
  );

  return insertEpisodes(itemsWithIds);
}

export async function addPodcastFromUrl(rssFeedUrl: string): Promise<Result<{ id: string }>> {
  const [rssFeed, rssParseError] = await tryCatch(() => parseRssFeed(rssFeedUrl));

  if (rssParseError) {
    return {
      isSuccess: false,
      error: new ResultError('Unable to parse rss.', {
        cause: rssParseError,
        code: resultErrorConst.ADD_PODCAST_INVALID_RSS,
      }),
    };
  }

  const db = getDbInstance();

  const doesPodcastAlreadyExistsStatement = db.prepare(
    `SELECT id FROM podcast WHERE rss_feed_url = ?`,
  );

  const data = doesPodcastAlreadyExistsStatement.get(rssFeedUrl);

  if (data) {
    return {
      isSuccess: false,
      error: new ResultError('Podcast with given rss url already exists.', {
        code: resultErrorConst.ADD_PODCAST_ALREADY_EXISTS,
      }),
    };
  }

  const insertPodcastStatement = db.prepare(
    `
    INSERT INTO podcast (
        id, name, rss_feed_url, description, image_url, thumbnail_url, patronite_url
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
  );

  const podcastThumbnailService = new PodcastThumbnailService();

  const podcastId = randomUUID();
  const podcastImageUrl = rssFeed.image?.url || rssFeed.itunes?.image || null;
  let podcastThumbnailUrl: string | undefined;

  if (podcastImageUrl) {
    const result = await podcastThumbnailService.savePodcastThumbnail({
      id: podcastId,
      imageUrl: podcastImageUrl,
    });

    if (result.isSuccess) {
      podcastThumbnailUrl = result.data.thumbnailUrl;
    }
  }

  const [, insertPodcastError] = tryCatchSync(() =>
    insertPodcastStatement.run([
      podcastId,
      rssFeed.title,
      rssFeedUrl,
      rssFeed.description,
      podcastImageUrl,
      podcastThumbnailUrl,
      null, // TODO Extract patronite url
    ]),
  );

  if (insertPodcastError) {
    return {
      isSuccess: false,
      error: new ResultError('Cannot add new podcast.', {
        cause: insertPodcastError,
        code: resultErrorConst.ADD_PODCAST_DB_INSERT_FAILED,
      }),
    };
  }

  const [, insertPodcastEpisodesError] = await tryCatch(
    async () => await insertPodcastEpisodes(podcastId, rssFeed.items),
  );

  if (insertPodcastEpisodesError) {
    return {
      isSuccess: false,
      error: new ResultError('Cannot add podcast episodes.', {
        cause: insertPodcastEpisodesError,
        code: resultErrorConst.ADD_PODCAST_DB_INSERT_FAILED,
      }),
    };
  }

  return {
    isSuccess: true,
    data: {
      id: podcastId,
    },
  };
}

export async function updatePodcast(id: string): Promise<Result<void>> {
  const podcast = getPodcast(id);

  if (!podcast) {
    return {
      isSuccess: false,
      error: new ResultError(`Cannot get podcast with given id: ${id}`),
    };
  }

  const [rssFeed, rssParseError] = await tryCatch(() => parseRssFeed(podcast.rssFeedUrl));

  if (rssParseError) {
    return {
      isSuccess: false,
      error: new ResultError(rssParseError.message),
    };
  }

  const db = getDbInstance();

  const updatePodcastStatement = db.prepare(
    `
    UPDATE podcast
    SET 
      name = ?,
      description = ?,
      image_url = ?,
      patronite_url = ?
    WHERE id = ?;
    `,
  );

  const [, updatePodcastError] = tryCatchSync(() =>
    updatePodcastStatement.run([
      rssFeed.title,
      rssFeed.description,
      rssFeed.image?.url || rssFeed.itunes?.image || null,
      null, // TODO Extract patronite url,
      id,
    ]),
  );

  if (updatePodcastError) {
    return {
      isSuccess: false,
      error: new ResultError(`Cannot update podcast with id ${id}`, { cause: updatePodcastError }),
    };
  }

  const existingEpisodesTitles = podcast.episodes.map((episode) => episode.title);
  // TODO Use something more reliable than title in the future
  const newEpisodes = rssFeed.items.filter((item) => !existingEpisodesTitles.includes(item.title));

  // TODO Add full update mode where old episodes will be updated as well
  const [, insertPodcastEpisodesError] = tryCatchSync(() => insertPodcastEpisodes(id, newEpisodes));

  if (insertPodcastEpisodesError) {
    return {
      isSuccess: false,
      error: new ResultError('Cannot add podcast episodes.', { cause: insertPodcastEpisodesError }),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}

export async function updatePodcasts(): Promise<Result<void>> {
  // TODO Find more efficient way to handle larger podcast quantity
  const podcastCollection = getPodcastCollection(MAX_LIMIT);

  const updatePromises = await Promise.allSettled(
    podcastCollection.items.map(({ id }) => updatePodcast(id)),
  );

  const errors: Error[] = [];

  for (const result of updatePromises) {
    if (result.status === 'rejected') {
      return {
        isSuccess: false,
        error: new ResultError('Unexpected error when updating one of the podcasts.', {
          cause: result.reason,
        }),
      };
    }

    if (!result.value.isSuccess) {
      errors.push(result.value.error);
    }
  }

  if (errors.length > 0) {
    return {
      isSuccess: false,
      error: new ResultError(errors.map(({ message }) => message).join('/n')),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}

export function getPodcast(id: string) {
  const db = getDbInstance();

  const [podcastData, getPodcastError] = tryCatchSync(() => {
    return db.prepare('SELECT * from podcast WHERE id = ?').get(id);
  });

  if (getPodcastError) {
    console.error(getPodcastError);

    return null;
  }

  if (!podcastData) {
    console.error(`Cannot find podcast with id ${id}.`);

    return null;
  }

  const rawPodcast = parseData(podcastData, rawPodcastSchema);

  if (!rawPodcast) {
    return null;
  }

  const [episodesData, getEpisodesError] = tryCatchSync(() => {
    return db
      .prepare(
        `
        SELECT 
          pe.*, 
          p.name AS podcast_name,
          p.image_url AS podcast_image_url
        FROM podcast_episode pe 
        INNER JOIN podcast p
          ON p.id = pe.podcast_id
        WHERE pe.podcast_id = ? 
        ORDER BY pe.published_at DESC`,
      )
      .all(id);
  });

  if (getEpisodesError) {
    console.error(getEpisodesError);

    return null;
  }

  const rawEpisodes = parseData(episodesData, rawPodcastEpisodesSchema);

  if (!rawEpisodes) {
    return null;
  }

  return createPodcast(rawPodcast, rawEpisodes);
}

export function getPodcastEpisode(id: string): StandalonePodcastEpisode | null {
  const db = getDbInstance();

  const [episodeData, getEpisodeError] = tryCatchSync(() => {
    return db
      .prepare(
        `
      SELECT 
        pe.*, 
        p.name AS podcast_name,
        p.image_url AS podcast_image_url
      FROM podcast_episode pe 
      INNER JOIN podcast p
        ON p.id = pe.podcast_id
      WHERE pe.id = ?;`,
      )
      .get(id);
  });

  if (getEpisodeError) {
    return null;
  }

  if (!episodeData) {
    console.error(`Cannot find episode with id ${id}.`);

    return null;
  }

  const rawEpisode = parseData(episodeData, rawPodcastEpisodeSchema);

  if (!rawEpisode) {
    return null;
  }

  return createPodcastEpisode(rawEpisode, true);
}

export function getPodcastCollection(limit = 25, offset = 0) {
  useLimitGuard(limit);

  const db = getDbInstance();

  const [totalData] = tryCatchSync(() => db.prepare(`SELECT COUNT(*) AS total FROM podcast`).get());

  const rawTotal = parseData(totalData, totalSchema);

  if (!rawTotal) {
    return createEmptyCollection(limit, offset);
  }

  const [data] = tryCatchSync(() => {
    return db.prepare('SELECT * from podcast LIMIT @limit OFFSET @offset').all({ limit, offset });
  });

  if (!data) {
    return createEmptyCollection(limit, offset);
  }

  const rawCollection = parseData(
    {
      items: data,
      meta: {
        total: rawTotal.total,
        limit,
        offset,
      },
    },
    rawPodcastCollectionSchema,
  );

  if (!rawCollection) {
    return createEmptyCollection(limit, offset);
  }

  return createPodcastCollection(rawCollection);
}

export function updatePodcastEpisodeElapsedStreamTime(
  episodeId: string,
  elapsedTime: number,
): Result<void> {
  const db = getDbInstance();

  const [, updateError] = tryCatchSync(() =>
    db
      .prepare(
        `
        UPDATE podcast_episode
        SET 
          elapsed_stream_time = @elapsedTime,
          last_played_at=UNIXEPOCH()
        WHERE id=@episodeId
      `,
      )
      .run({
        elapsedTime,
        episodeId,
      }),
  );

  if (updateError) {
    return {
      isSuccess: false,
      error: new ResultError(
        `Cannot update elapsed stream time for podcast episode id ${episodeId} with value ${elapsedTime}.`,
        { cause: updateError },
      ),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}

export function markPodcastEpisodeAsDownloaded(episodeId: string): Result<void> {
  const db = getDbInstance();

  const [, updateError] = tryCatchSync(() =>
    db
      .prepare(
        `
        UPDATE podcast_episode
        SET is_downloaded = TRUE
        WHERE id=@episodeId
      `,
      )
      .run({
        episodeId,
      }),
  );

  if (updateError) {
    return {
      isSuccess: false,
      error: new ResultError(`Cannot mark podcast episode id ${episodeId} as downloaded.`, {
        cause: updateError,
      }),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}

export function updatePodcastEpisodeThumbnail(
  episodeId: string,
  thumbnailUrl: string,
): Result<void> {
  const db = getDbInstance();

  const [, updateError] = tryCatchSync(() =>
    db
      .prepare(
        `
        UPDATE podcast_episode
        SET 
          thumbnail_url = @thumbnailUrl, 
          was_thumbnail_download_triggered = TRUE
        WHERE id=@episodeId
      `,
      )
      .run({
        episodeId,
        thumbnailUrl,
      }),
  );

  if (updateError) {
    return {
      isSuccess: false,
      error: new ResultError(`Cannot update podcast episode thumbnail for id ${episodeId}.`, {
        cause: updateError,
      }),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}

export async function deletePodcast(id: string): Promise<Result<void>> {
  const db = getDbInstance();
  const podcast = getPodcast(id);

  if (!podcast) {
    return {
      isSuccess: false,
      error: new ResultError(`Cannot find podcast with id: ${id}`),
    };
  }

  const [, deletePodcastError] = tryCatchSync(() => {
    return db.prepare('DELETE FROM podcast WHERE id = ?').run(id);
  });

  if (deletePodcastError) {
    return {
      isSuccess: false,
      error: new ResultError(`Cannot delete podcast with id: ${id}`, { cause: deletePodcastError }),
    };
  }

  const podcastDeleteDataService = new PodcastDeleteDataService(podcast);

  const deleteDataResult = await podcastDeleteDataService.deleteData();

  if (!deleteDataResult.isSuccess) {
    return {
      isSuccess: false,
      error: new ResultError(`Podcast was deleted, but some related data couldn't be deleted.`, {
        cause: deleteDataResult.error,
      }),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}
