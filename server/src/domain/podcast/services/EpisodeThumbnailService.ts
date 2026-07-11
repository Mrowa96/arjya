import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

import { getEnv } from '../../../infrastructure/env.ts';
import { type Result, ResultError } from '../../../infrastructure/result.ts';
import { tryCatch } from '../../../infrastructure/tryCatch.ts';

type EpisodeThumbnailData = {
  id: string;
  podcastId: string;
  imageUrl: string;
};

class EpisodeThumbnailError extends Error {
  #id: string;
  #podcastId: string;

  constructor(message: string, data: { id: string; podcastId: string }, options?: ErrorOptions) {
    super(message, options);

    this.#id = data.id;
    this.#podcastId = data.podcastId;
  }

  get id() {
    return this.#id;
  }

  get podcastId() {
    return this.#podcastId;
  }
}

export class EpisodeThumbnailService {
  #assetsPath = path.join(process.cwd(), '/assets');
  #enableDebugLogs: boolean;

  constructor(enableDebugLogs = false) {
    this.#enableDebugLogs = enableDebugLogs;
  }

  async #processAndSaveImage(image: ArrayBuffer, path: string) {
    return sharp(image).resize(512, 512).webp({ quality: 80 }).toFile(path);
  }

  async #verifyPodcastAssetsDirectoryExistance(podcastId: string) {
    try {
      const podcastAssetsPath = path.join(this.#assetsPath, podcastId);
      const [stats] = await tryCatch(() => fs.stat(podcastAssetsPath), false);

      if (!stats) {
        this.#enableDebugLogs && console.log(`Podcast assets directory doesn't exist, creating...`);

        await fs.mkdir(podcastAssetsPath, { recursive: true });
      }
    } catch (error) {
      throw new Error('Problem with verifying podcast assets directory.', { cause: error });
    }
  }

  async #fetchAndSaveEpisodeThumbnail(
    item: EpisodeThumbnailData,
    meta?: { index: number; total: number },
  ): Promise<string> {
    try {
      const imageUrlResponse = await fetch(item.imageUrl);
      const image = await imageUrlResponse.arrayBuffer();
      const randomThumbnailId = randomUUID();
      const thumbnailPath = path.join(
        process.cwd(),
        `/assets/${item.podcastId}/${randomThumbnailId}.webp`,
      );

      const [stats] = await tryCatch(() => fs.stat(thumbnailPath), false);

      if (!stats || !stats.isFile()) {
        this.#enableDebugLogs &&
          console.log(
            meta
              ? `Creating episode thumbnail ${meta.index + 1} of ${meta.total}...`
              : 'Creating episode thumbnail...',
          );

        await this.#processAndSaveImage(image, thumbnailPath);
      }

      return getEnv('APP_PUBLIC_URL') + `/assets/${item.podcastId}/${randomThumbnailId}.webp`;
    } catch (error) {
      throw new EpisodeThumbnailError(
        `Unable to save thumbnail for some episodes in podcast: ${item.podcastId}`,
        {
          id: item.id,
          podcastId: item.podcastId,
        },
        { cause: error },
      );
    }
  }

  async saveEpisodeThumbnail(item: EpisodeThumbnailData): Promise<Result<string>> {
    try {
      await this.#verifyPodcastAssetsDirectoryExistance(item.podcastId);

      const thumbnailUrl = await this.#fetchAndSaveEpisodeThumbnail(item);

      return {
        isSuccess: true,
        data: thumbnailUrl,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: new ResultError(`Unable to save thumbnail for episode id: ${item.id}.`, {
          cause: error,
        }),
      };
    }
  }
}
