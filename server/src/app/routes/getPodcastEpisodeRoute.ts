import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import {
  getPodcastEpisode,
  updatePodcastEpisodeThumbnail,
} from '../../domain/podcast/repository.ts';
import { podcastEpisodeSchema } from '../../domain/podcast/schema.ts';
import { EpisodeThumbnailService } from '../../domain/podcast/services/EpisodeThumbnailService.ts';

const paramsSchema = v.object({
  podcastId: v.pipe(v.string(), v.uuid()),
  episodeId: v.pipe(v.string(), v.uuid()),
});
const paramsJsonSchema = toJsonSchema(paramsSchema);
const response200JsonSchema = toJsonSchema(podcastEpisodeSchema);
const response404JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
  }),
);

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;

export function getPodcastEpisodeRoute(fastify: FastifyInstance) {
  fastify.get<{ Params: ParamsJsonSchema }>(
    '/podcast/:podcastId/episode/:episodeId',
    {
      schema: {
        params: paramsJsonSchema,
        response: {
          200: response200JsonSchema,
          404: response404JsonSchema,
        },
        tags: ['podcast'],
      },
    },
    async (request, reply) => {
      let podcastEpisode = getPodcastEpisode(request.params.episodeId);

      if (!podcastEpisode) {
        return reply.status(404).send({
          error: 'Not found',
        });
      }

      // TODO Think if it won't be better to rely on fs check
      if (!podcastEpisode.wasThumbnailDownloadTriggered && !!podcastEpisode.imageUrl) {
        const episodeThumbnailService = new EpisodeThumbnailService();

        const result = await episodeThumbnailService.saveEpisodeThumbnail({
          id: podcastEpisode.id,
          podcastId: podcastEpisode.podcast.id,
          imageUrl: podcastEpisode.imageUrl,
        });

        if (result.isSuccess) {
          updatePodcastEpisodeThumbnail(podcastEpisode.id, result.data);

          podcastEpisode = getPodcastEpisode(request.params.episodeId);

          if (!podcastEpisode) {
            return reply.status(404).send({
              error: 'Not found',
            });
          }
        } else {
          fastify.log.error(result.error);
        }
      }

      return reply.status(200).send(podcastEpisode);
    },
  );
}
