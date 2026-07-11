import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { getPodcast } from '../../domain/podcast/repository.ts';
import { podcastSchema } from '../../domain/podcast/schema.ts';

const paramsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});
const paramsJsonSchema = toJsonSchema(paramsSchema);
const response200JsonSchema = toJsonSchema(podcastSchema);
const response404JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
  }),
);

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;

export function getPodcastRoute(fastify: FastifyInstance) {
  fastify.get<{ Params: ParamsJsonSchema }>(
    '/podcast/:id',
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
    (request, reply) => {
      const podcast = getPodcast(request.params.id);

      if (!podcast) {
        return reply.status(404).send({
          error: 'Not found',
        });
      }

      return reply.status(200).send(podcast);
    },
  );
}
