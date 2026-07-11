import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { addPodcastFromUrl } from '../../domain/podcast/repository.ts';

const bodySchema = v.object({
  rssFeedUrl: v.pipe(v.string(), v.url()),
});
const bodyJsonSchema = toJsonSchema(bodySchema);
const response201JsonSchema = toJsonSchema(
  v.object({
    id: v.pipe(v.string(), v.uuid()),
  }),
);
const response400JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
    code: v.optional(v.number()),
  }),
);
type BodyJsonSchema = v.InferOutput<typeof bodySchema>;

export function addPodcastRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: BodyJsonSchema }>(
    '/podcast',
    {
      schema: {
        body: bodyJsonSchema,
        response: {
          201: response201JsonSchema,
          400: response400JsonSchema,
        },
        tags: ['podcast'],
      },
    },
    async (request, reply) => {
      const result = await addPodcastFromUrl(request.body.rssFeedUrl);

      if (!result.isSuccess) {
        return reply.status(400).send({
          error: result.error.message,
          code: result.error.code,
        });
      }

      return reply.status(201).header('location', `/podcast/${result.data.id}`).send({
        id: result.data.id,
      });
    },
  );
}
