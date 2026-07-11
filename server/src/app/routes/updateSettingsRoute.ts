import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import { updateSettings } from '../../domain/settings/repository.ts';
import { settingsSchema } from '../../domain/settings/schema.ts';

const bodySchema = settingsSchema;
const response204JsonSchema = toJsonSchema(v.null());

export function updateSettingsRoute(fastify: FastifyInstance) {
  fastify.put<{ Body: v.InferOutput<typeof bodySchema> }>(
    '/settings',
    {
      schema: {
        body: toJsonSchema(bodySchema),
        response: {
          204: response204JsonSchema,
        },
        tags: ['settings'],
      },
    },
    (request, reply) => {
      const result = updateSettings(request.body);

      if (!result.isSuccess) {
        return reply.status(400).send({
          error: result.error.message,
        });
      }

      return reply.status(204).send();
    },
  );
}
