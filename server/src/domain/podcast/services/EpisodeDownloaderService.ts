import { type Stats, createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import mime from 'mime';
import path from 'path';
import { pipeline } from 'stream/promises';

import { type Result, ResultError } from '../../../infrastructure/result.ts';
import { tryCatch, tryCatchSync } from '../../../infrastructure/tryCatch.ts';
import { markPodcastEpisodeAsDownloaded } from '../repository.ts';
import type { PodcastEpisode } from '../types.ts';

export class EpisodeDownloaderService {
  #episode: Pick<PodcastEpisode, 'id' | 'source'>;
  #episodeFilePath: string;
  #episodeFileExtension: string;
  #downloadDirectoryPath = path.join(process.cwd(), './data/');

  constructor(episode: PodcastEpisode) {
    this.#episode = episode;

    const fileDetails = this.#createEpisodeFileDetails();

    this.#episodeFilePath = fileDetails.filePath;
    this.#episodeFileExtension = fileDetails.fileExtension;
  }

  get episodeFilePath() {
    return this.#episodeFilePath;
  }

  #createEpisodeFileDetails() {
    // Save episode to file for faster later use
    const [fileExtension, mimeParseError] = tryCatchSync(() =>
      mime.getExtension(this.#episode.source.type),
    );

    if (mimeParseError || !fileExtension) {
      throw new Error(`Cannot parse episode source type ${this.#episode.source.type}`);
    }

    const episodeFileName = `${this.#episode.id}.${fileExtension}`;

    return {
      filePath: path.join(this.#downloadDirectoryPath, episodeFileName),
      fileExtension,
    };
  }

  async #getEpisodeFileStats() {
    const [stats] = await tryCatch(() => stat(this.#episodeFilePath));

    return stats;
  }

  async isDownloadedAlready() {
    try {
      const fileStats = await this.#getEpisodeFileStats();

      if (!fileStats) {
        return false;
      }

      return fileStats.isFile();
    } catch (error) {
      console.error(`Unable to check if episode id: ${this.#episode.id} is downloaded.`, error);

      return false;
    }
  }

  async getDownloadedEpisode(throwIfNotExists = true) {
    try {
      const fileStats = await this.#getEpisodeFileStats();

      if (!fileStats) {
        if (throwIfNotExists) {
          throw new Error(`Make sure episode ${this.#episode.id} is downloaded beforehand.`);
        }

        return null;
      }

      return {
        filePath: this.#episodeFilePath,
        fileExtension: this.#episodeFileExtension,
        fileStats,
      };
    } catch (error) {
      console.error(`Unable to access downloaded episode with id: ${this.#episode.id}.`, {
        error,
      });

      return null;
    }
  }

  async downloadEpisode(): Promise<
    Result<{
      filePath: string;
      fileExtension: string;
      fileStats: Stats;
    }>
  > {
    const [episodeSource] = await tryCatch(() => fetch(this.#episode.source.url));

    if (!episodeSource) {
      return {
        error: new ResultError('Unable to fetch episode source.'),
        isSuccess: false,
      };
    }

    if (!episodeSource.body) {
      return {
        error: new ResultError('Body for episode source is empty.'),
        isSuccess: false,
      };
    }

    const episodeFile = createWriteStream(this.#episodeFilePath);

    const [, pipelineEror] = await tryCatch(() => pipeline(episodeSource.body!, episodeFile));

    if (pipelineEror) {
      return {
        error: new ResultError('Unable to save episode source to file.'),
        isSuccess: false,
      };
    }

    const episodeEntryUpdateResult = markPodcastEpisodeAsDownloaded(this.#episode.id);

    if (!episodeEntryUpdateResult.isSuccess) {
      return {
        error: new ResultError('Unable to update episode entry in db after saving it on disk.', {
          cause: episodeEntryUpdateResult.error,
        }),
        isSuccess: false,
      };
    }

    const downloadedEpisode = await this.getDownloadedEpisode();

    if (!downloadedEpisode) {
      return {
        error: new ResultError('Unable to access downloaded episode.'),
        isSuccess: false,
      };
    }

    return {
      isSuccess: true,
      data: downloadedEpisode,
    };
  }
}
