import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { getVersion } from '../../infrastructure/config.ts';

const response200JsonSchema = toJsonSchema(
  v.object({
    name: v.string(),
    version: v.string(),
  }),
);

export function getInfoRoute(fastify: FastifyInstance) {
  fastify.get(
    '/info',
    {
      schema: {
        response: {
          200: response200JsonSchema,
        },
        tags: ['info'],
      },
    },
    (_request, reply) => {
      return reply.status(200).send({
        name: 'arjya-server',
        version: getVersion(),
      });
    },
  );
}
