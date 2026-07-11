import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import { createReadStream } from 'fs';
import * as v from 'valibot';

import { getPodcast, getPodcastEpisode } from '../../domain/podcast/repository.ts';
import { EpisodeDownloaderService } from '../../domain/podcast/services/EpisodeDownloaderService.ts';
import { tryCatchSync } from '../../infrastructure/tryCatch.ts';

const paramsSchema = v.object({
  podcastId: v.pipe(v.string(), v.uuid()),
  episodeId: v.pipe(v.string(), v.uuid()),
});
const paramsJsonSchema = toJsonSchema(paramsSchema);

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;

export function downloadPodcastEpisodeRoute(fastify: FastifyInstance) {
  // TODO Add error codes
  fastify.get<{ Params: ParamsJsonSchema }>(
    '/podcast/:podcastId/episode/:episodeId/download',
    {
      schema: {
        params: paramsJsonSchema,
        tags: ['podcast'],
      },
    },
    async (request, reply) => {
      const { podcastId, episodeId } = request.params;

      const podcast = getPodcast(podcastId);
      const episode = getPodcastEpisode(episodeId);

      if (!podcast || !episode) {
        return reply.status(404).send();
      }

      const [episodeDownloaderService, episodeDownloaderServiceError] = tryCatchSync(
        () => new EpisodeDownloaderService(episode),
      );

      if (!episodeDownloaderService) {
        console.error(episodeDownloaderServiceError);

        return reply.status(400).send({
          error: `Unable to initialise EpisodeDownloaderService`,
        });
      }

      let downloadedEpisode = await episodeDownloaderService.getDownloadedEpisode(false);

      if (!downloadedEpisode) {
        const episodeDownloadResult = await episodeDownloaderService.downloadEpisode();

        if (!episodeDownloadResult.isSuccess) {
          return reply.status(400).send({
            error: episodeDownloadResult.error.message,
          });
        }

        downloadedEpisode = episodeDownloadResult.data;
      }

      const { filePath: episodeFilePath, fileExtension: episodeFileExtenstion } = downloadedEpisode;

      const readStream = createReadStream(episodeFilePath);

      readStream.on('error', (readStreamError) => {
        reply.status(400).send({
          message: `Unable to read episode from file because of error: ${readStreamError.message}`,
        });
      });

      const episodeFileName = encodeURIComponent(
        `${podcast.name} - ${episode.title}.${episodeFileExtenstion}`,
      );

      return reply
        .status(200)
        .headers({
          'content-disposition': `attachment; filename*=UTF-8''${episodeFileName}`,
          'content-type': episode.source.type,
        })
        .send(readStream);
    },
  );
}
