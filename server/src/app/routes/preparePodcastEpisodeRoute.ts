import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import {
  getPodcastEpisode,
  updatePodcastEpisodeThumbnail,
} from '../../domain/podcast/repository.ts';
import { podcastEpisodeSchema } from '../../domain/podcast/schema.ts';
import { EpisodeDownloaderService } from '../../domain/podcast/services/EpisodeDownloaderService.ts';
import { EpisodeThumbnailService } from '../../domain/podcast/services/EpisodeThumbnailService.ts';
import { tryCatchSync } from '../../infrastructure/tryCatch.ts';

const paramsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  episodeId: v.pipe(v.string(), v.uuid()),
});
const paramsJsonSchema = toJsonSchema(paramsSchema);
const response200JsonSchema = toJsonSchema(podcastEpisodeSchema);
const response400JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
    code: v.optional(v.number()),
  }),
);
const response404JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
  }),
);

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;

export function preparePodcastEpisodeRoute(fastify: FastifyInstance) {
  fastify.post<{ Params: ParamsJsonSchema }>(
    '/podcast/:id/episode/:episodeId/prepare',
    {
      schema: {
        params: paramsJsonSchema,
        response: {
          200: response200JsonSchema,
          400: response400JsonSchema,
          404: response404JsonSchema,
        },
        tags: ['podcast'],
        description: "Prepares epsiode for streaming by downloading it's data.",
      },
    },
    async (request, reply) => {
      const { episodeId } = request.params;

      let episode = getPodcastEpisode(episodeId);

      if (!episode) {
        return reply.status(404).send({
          error: 'Not found',
        });
      }

      // TODO Think if it won't be better to rely on fs check
      if (!episode.wasThumbnailDownloadTriggered && !!episode.imageUrl) {
        const episodeThumbnailService = new EpisodeThumbnailService();

        const result = await episodeThumbnailService.saveEpisodeThumbnail({
          id: episode.id,
          podcastId: episode.podcast.id,
          imageUrl: episode.imageUrl,
        });

        if (result.isSuccess) {
          updatePodcastEpisodeThumbnail(episode.id, result.data);
        }
      }

      const [episodeDownloaderService, episodeDownloaderServiceError] = tryCatchSync(
        () => new EpisodeDownloaderService(episode!),
      );

      if (!episodeDownloaderService) {
        console.error(episodeDownloaderServiceError);

        return reply.status(400).send({
          error: `Unable to initialise EpisodeDownloaderService`,
        });
      }

      if (!(await episodeDownloaderService.isDownloadedAlready())) {
        const episodeDownloadResult = await episodeDownloaderService.downloadEpisode();

        if (!episodeDownloadResult.isSuccess) {
          return reply.status(400).send({
            error: episodeDownloadResult.error.message,
          });
        }

        episode = getPodcastEpisode(episodeId);

        if (!episode) {
          return reply.status(404).send({
            error: 'Not found',
          });
        }
      }

      return reply.status(200).send(episode);
    },
  );
}
