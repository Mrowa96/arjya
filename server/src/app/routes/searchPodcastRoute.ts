import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { PodcastSearchService } from '../../domain/podcast/services/PodcastSearchService.ts';
import { createCollectionSchema } from '../../infrastructure/collection.ts';

const querystringSchema = v.object({
  phrase: v.string(),
});
const response200JsonSchema = toJsonSchema(
  createCollectionSchema(
    v.object({
      name: v.string(),
      rssUrl: v.pipe(v.string(), v.url()),
      thumbnailUrl: v.nullable(v.pipe(v.string(), v.url())),
    }),
  ),
);
const response400JsonSchema = toJsonSchema(
  v.object({
    error: v.string(),
    code: v.optional(v.number()),
  }),
);

type QuerystringJsonSchema = v.InferOutput<typeof querystringSchema>;

const podcastSearchService = new PodcastSearchService();

export function searchPodcastRoute(fastify: FastifyInstance) {
  fastify.get<{ Querystring: QuerystringJsonSchema }>(
    '/podcast/search',
    {
      schema: {
        querystring: toJsonSchema(querystringSchema),
        response: {
          200: response200JsonSchema,
          400: response400JsonSchema,
        },
        tags: ['podcast'],
      },
    },
    async (request, reply) => {
      const result = await podcastSearchService.search(request.query.phrase);

      if (!result.isSuccess) {
        return reply.status(400).send({
          error: result.error.message,
          code: result.error.code,
        });
      }

      return reply
        .status(200)
        .headers({
          'cache-control': 'public, max-age=86400, must-revalidate',
        })
        .send(result.data);
    },
  );
}
