import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';

import { getSettings } from '../../domain/settings/repository.ts';
import { settingsSchema } from '../../domain/settings/schema.ts';

const response200JsonSchema = toJsonSchema(settingsSchema);

export function getSettingsRoute(fastify: FastifyInstance) {
  fastify.get(
    '/settings',
    {
      schema: {
        response: {
          200: response200JsonSchema,
        },
        tags: ['settings'],
      },
    },
    (_request, reply) => {
      const settings = getSettings();

      return reply.status(200).send(settings);
    },
  );
}
