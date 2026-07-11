import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import * as v from 'valibot';

import { getEnv } from '../../../infrastructure/env.ts';
import { type Result, ResultError } from '../../../infrastructure/result.ts';
import { tryCatch } from '../../../infrastructure/tryCatch.ts';

const podcastsThumbnailDataSchema = v.array(
  v.object({
    id: v.string(),
    imageUrl: v.string(),
  }),
);

type PodcastsThumbnailData = v.InferOutput<typeof podcastsThumbnailDataSchema>;

type PodcastThumbnailData = PodcastsThumbnailData[number];

type SuccessfulItem = {
  id: string;
  thumbnailUrl: string;
};

type FailedItem = {
  id: string;
};

class PodcastThumbnailError extends Error {
  #podcastId: string;

  constructor(message: string, podcastId: string, options?: ErrorOptions) {
    super(message, options);

    this.#podcastId = podcastId;
  }

  get podcastId() {
    return this.#podcastId;
  }
}

type Options = {
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  overrideExistingThumbnail?: boolean;
  enableDebugLogs?: boolean;
};

export class PodcastThumbnailService {
  #assetsPath = path.join(process.cwd(), '/assets');
  #thumbnailWidth: number;
  #thumbnailHeight: number;
  #overrideExistingThumbnail: boolean;
  #enableDebugLogs: boolean;

  constructor(options?: Options) {
    this.#thumbnailWidth = options?.thumbnailWidth || 512;
    this.#thumbnailHeight = options?.thumbnailHeight || 512;
    this.#overrideExistingThumbnail = options?.overrideExistingThumbnail || false;
    this.#enableDebugLogs = options?.enableDebugLogs || false;
  }

  async #processAndSaveImage(image: ArrayBuffer, path: string) {
    return sharp(image)
      .resize(this.#thumbnailWidth, this.#thumbnailHeight)
      .webp({ quality: 80 })
      .toFile(path);
  }

  async #verifyAssetsDirectoryExistance() {
    try {
      const [assetsStats] = await tryCatch(() => fs.stat(this.#assetsPath), false);

      if (!assetsStats) {
        this.#enableDebugLogs && console.log(`Assets directory doesn't exist, creating...`);

        await fs.mkdir(this.#assetsPath, { recursive: true });
      }
    } catch (error) {
      throw new Error('Problem with creating assets directory.', { cause: error });
    }
  }

  async #fetchAndSavePodcastThumbnail(
    item: PodcastThumbnailData,
    meta?: { index: number; total: number },
  ): Promise<SuccessfulItem> {
    try {
      const imageUrlResponse = await fetch(item.imageUrl);
      const image = await imageUrlResponse.arrayBuffer();
      const thumbnailPath = path.join(process.cwd(), `/assets/${item.id}.webp`);
      const [stats] = await tryCatch(() => fs.stat(thumbnailPath), false);

      if (!stats || !stats.isFile() || (this.#overrideExistingThumbnail && stats.isFile())) {
        this.#enableDebugLogs &&
          console.info(
            meta
              ? `Creating podcast thumbnail ${meta.index + 1} of ${meta.total}...`
              : 'Creating podcast thumbnail...',
          );

        await this.#processAndSaveImage(image, thumbnailPath);
      } else {
        this.#enableDebugLogs &&
          console.info(
            meta
              ? `Thumbnail ${meta.index + 1} of ${meta.total} already exists. Skipping...`
              : 'Thumbnail already exists. Skipping...',
          );
      }

      return {
        id: item.id,
        thumbnailUrl: getEnv('APP_PUBLIC_URL') + `/assets/${item.id}.webp`,
      };
    } catch (error) {
      throw new PodcastThumbnailError(`Unable to save thumbnail for podcast: ${item.id}`, item.id, {
        cause: error,
      });
    }
  }

  async savePodcastsThumbnail(
    data: PodcastsThumbnailData,
  ): Promise<Result<{ successfulItems: SuccessfulItem[]; failedItems: FailedItem[] }>> {
    try {
      await this.#verifyAssetsDirectoryExistance();

      this.#enableDebugLogs && console.table(data);

      const settledPromises = await Promise.allSettled(
        data.map((item, index) =>
          this.#fetchAndSavePodcastThumbnail(item, {
            index,
            total: data.length,
          }),
        ),
      );

      const successfulItems: SuccessfulItem[] = [];
      const failedItems: FailedItem[] = [];

      for (const settledPromise of settledPromises) {
        if (settledPromise.status === 'rejected') {
          if (!(settledPromise.reason instanceof PodcastThumbnailError)) {
            throw new Error('Edge case found, some error is not handled properly!', {
              cause: settledPromise.reason,
            });
          }

          failedItems.push({
            id: settledPromise.reason.podcastId,
          });
        } else {
          successfulItems.push(settledPromise.value);
        }
      }

      if (!successfulItems.length) {
        throw new Error('No thumbnails could have been saved.');
      }

      return {
        isSuccess: true,
        data: {
          successfulItems,
          failedItems,
        },
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: new ResultError('Unable to save podcasts thumbnails.', { cause: error }),
      };
    }
  }

  async savePodcastThumbnail(item: PodcastThumbnailData): Promise<Result<SuccessfulItem>> {
    try {
      await this.#verifyAssetsDirectoryExistance();

      const data = await this.#fetchAndSavePodcastThumbnail(item);

      return {
        isSuccess: true,
        data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: new ResultError('Unable to save podcast thumbnails.', { cause: error }),
      };
    }
  }

  getThumbnailPathFromUrl(thumbnailUrl: string) {
    return path.join(process.cwd(), thumbnailUrl.replace(getEnv('APP_PUBLIC_URL'), ''));
  }

  getThumbnailDirectory(podcastId: string) {
    return path.join(this.#assetsPath, podcastId);
  }
}
