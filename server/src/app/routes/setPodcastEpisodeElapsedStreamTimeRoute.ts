import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import {
  getPodcastEpisode,
  updatePodcastEpisodeElapsedStreamTime,
} from '../../domain/podcast/repository.ts';
import { podcastEpisodeSchema } from '../../domain/podcast/schema.ts';

const paramsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  episodeId: v.pipe(v.string(), v.uuid()),
});
const bodySchema = v.object({
  time: v.number(),
});
const response200JsonSchema = toJsonSchema(podcastEpisodeSchema);
const response400JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
    code: v.optional(v.number()),
  }),
);

const bodyJsonSchema = toJsonSchema(bodySchema);
const paramsJsonSchema = toJsonSchema(paramsSchema);

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;
type BodyJsonSchema = v.InferOutput<typeof bodySchema>;

export function setPodcastEpisodeElapsedStreamTimeRoute(fastify: FastifyInstance) {
  fastify.put<{
    Params: ParamsJsonSchema;
    Body: BodyJsonSchema;
  }>(
    '/podcast/:id/episode/:episodeId/elapsed-stream-time',
    {
      schema: {
        params: paramsJsonSchema,
        body: bodyJsonSchema,
        response: {
          200: response200JsonSchema,
          400: response400JsonSchema,
        },
        tags: ['podcast'],
      },
    },
    (request, reply) => {
      const result = updatePodcastEpisodeElapsedStreamTime(
        request.params.episodeId,
        request.body.time,
      );

      if (!result.isSuccess) {
        return reply.status(400).send({
          error: result.error.message,
        });
      }

      const updatedEpisode = getPodcastEpisode(request.params.episodeId);

      if (!updatedEpisode) {
        return reply.status(400).send({
          error: 'Updated podcast episode cannot be found',
        });
      }

      return reply.status(200).send(updatedEpisode);
    },
  );
}
