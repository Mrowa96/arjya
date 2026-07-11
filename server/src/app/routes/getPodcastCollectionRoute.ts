import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { getPodcastCollection } from '../../domain/podcast/repository.ts';
import { podcastCollectionSchema } from '../../domain/podcast/schema.ts';
import { MAX_LIMIT, MIN_LIMIT } from '../../infrastructure/collection.ts';

const querySchema = v.object({
  limit: v.optional(v.pipe(v.number(), v.minValue(MIN_LIMIT), v.maxValue(MAX_LIMIT))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
});
const queryJsonSchema = toJsonSchema(querySchema);
const response200JsonSchema = toJsonSchema(podcastCollectionSchema);

type QueryJsonSchema = v.InferOutput<typeof querySchema>;

export function getPodcastCollectionRoute(fastify: FastifyInstance) {
  fastify.get<{ Querystring: QueryJsonSchema }>(
    '/podcast',
    {
      schema: {
        querystring: queryJsonSchema,
        response: {
          200: response200JsonSchema,
        },
        tags: ['podcast'],
      },
    },
    (request, reply) => {
      const collection = getPodcastCollection(request.query.limit, request.query.offset);

      reply.status(200).send(collection);
    },
  );
}
