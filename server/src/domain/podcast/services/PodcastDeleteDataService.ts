import fs from 'fs/promises';

import { type Result, ResultError } from '../../../infrastructure/result.ts';
import { tryCatch } from '../../../infrastructure/tryCatch.ts';
import type { Podcast } from '../types.ts';
import { EpisodeDownloaderService } from './EpisodeDownloaderService.ts';
import { PodcastThumbnailService } from './PodcastThumbnailService.ts';

export class PodcastDeleteDataService {
  #podcast;
  #enableDebugLogs: boolean;

  constructor(podcast: Podcast, enableDebugLogs = false) {
    this.#podcast = podcast;
    this.#enableDebugLogs = enableDebugLogs;
  }

  async #deleteEpisodes() {
    const deleteEpisodesPromises = [];
    let status = true;

    for (const episode of this.#podcast.episodes) {
      const episodeDownloaderService = new EpisodeDownloaderService(episode);

      deleteEpisodesPromises.push(fs.rm(episodeDownloaderService.episodeFilePath, { force: true }));
    }

    const deleteEpisodesResults = await Promise.allSettled(deleteEpisodesPromises);

    for (const deleteEpisodeResult of deleteEpisodesResults) {
      if (deleteEpisodeResult.status === 'rejected') {
        status = false;

        this.#enableDebugLogs &&
          console.log(`Unable to delete episode`, deleteEpisodeResult.reason);
      }
    }

    return status;
  }

  async #deleteThumbnails() {
    const podcastThumbnailService = new PodcastThumbnailService();
    let status = true;

    if (this.#podcast.thumbnailUrl) {
      const [, deletePodcastThumbnailError] = await tryCatch(() =>
        fs.rm(podcastThumbnailService.getThumbnailPathFromUrl(this.#podcast.thumbnailUrl!), {
          force: true,
        }),
      );

      if (deletePodcastThumbnailError) {
        status = false;

        this.#enableDebugLogs &&
          console.log('Unable to delete podcast thumbnail', deletePodcastThumbnailError);
      }
    }

    const [, deleteEpisodesThumbnailError] = await tryCatch(() =>
      fs.rm(podcastThumbnailService.getThumbnailDirectory(this.#podcast.id), {
        force: true,
        recursive: true,
      }),
    );

    if (deleteEpisodesThumbnailError) {
      status = false;

      this.#enableDebugLogs &&
        console.log('Unable to delete episodes thumbnails', deleteEpisodesThumbnailError);
    }

    return status;
  }

  async deleteData(): Promise<Result<void>> {
    const deleteEpisodesStatus = await this.#deleteEpisodes();
    const deleteThumbnailsStatus = await this.#deleteThumbnails();

    if (!deleteEpisodesStatus || !deleteThumbnailsStatus) {
      return {
        isSuccess: false,
        error: new ResultError(
          `Some data couldn't be deleted. Delete episodes status: ${deleteEpisodesStatus}, delete thumbnails status: ${deleteThumbnailsStatus}`,
        ),
      };
    }

    return {
      isSuccess: true,
      data: undefined,
    };
  }
}
