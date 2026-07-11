import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { deletePodcast } from '../../domain/podcast/repository.ts';

const paramsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});
const paramsJsonSchema = toJsonSchema(paramsSchema);
const response204JsonSchema = toJsonSchema(v.null());

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;

export function deletePodcastRoute(fastify: FastifyInstance) {
  fastify.delete<{ Params: ParamsJsonSchema }>(
    '/podcast/:id',
    {
      schema: {
        params: paramsJsonSchema,
        response: {
          204: response204JsonSchema,
        },
        tags: ['podcast'],
      },
    },
    async (request, reply) => {
      const result = await deletePodcast(request.params.id);

      if (!result.isSuccess) {
        return reply.status(400).send({
          error: result.error.message,
        });
      }

      return reply.status(204).send();
    },
  );
}
