import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const response200JsonSchema = toJsonSchema(
  v.object({
    ok: v.boolean(),
  }),
);

export function getStatusRoute(fastify: FastifyInstance) {
  fastify.get(
    '/status',
    {
      schema: {
        response: {
          200: response200JsonSchema,
        },
        tags: ['status'],
      },
    },
    (_request, reply) => {
      return reply.status(200).send({
        ok: true,
      });
    },
  );
}
