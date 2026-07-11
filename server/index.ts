import Fastify from 'fastify';

import corsPlugin from '@fastify/cors';
import staticPlugin from '@fastify/static';
import path from 'path';

import { EXIT_CODE_SERVER_FAIL } from './src/app/consts.ts';
import { updatePodcastsJob } from './src/app/jobs/updatePodcastsJob.ts';
import { addPodcastRoute } from './src/app/routes/addPodcastRoute.ts';
import { deletePodcastRoute } from './src/app/routes/deletePodcastRoute.ts';
import { downloadPodcastEpisodeRoute } from './src/app/routes/downloadPodcastEpisodeRoute.ts';
import { getInfoRoute } from './src/app/routes/getInfoRoute.ts';
import { getPodcastCollectionRoute } from './src/app/routes/getPodcastCollectionRoute.ts';
import { getPodcastEpisodeRoute } from './src/app/routes/getPodcastEpisodeRoute.ts';
import { getPodcastRoute } from './src/app/routes/getPodcastRoute.ts';
import { getSettingsRoute } from './src/app/routes/getSettingsRoute.ts';
import { getStatusRoute } from './src/app/routes/getStatusRoute.ts';
import { preparePodcastEpisodeRoute } from './src/app/routes/preparePodcastEpisodeRoute.ts';
import { searchPodcastRoute } from './src/app/routes/searchPodcastRoute.ts';
import { setPodcastEpisodeElapsedStreamTimeRoute } from './src/app/routes/setPodcastEpisodeElapsedStreamTimeRoute.ts';
import { streamPodcastEpisodeRoute } from './src/app/routes/streamPodcastEpisodeRoute.ts';
import { updatePodcastRoute } from './src/app/routes/updatePodcastRoute.ts';
import { updateSettingsRoute } from './src/app/routes/updateSettingsRoute.ts';
import { getVersion } from './src/infrastructure/config.ts';
import { getEnv } from './src/infrastructure/env.ts';

const fastify = Fastify({
  logger: true,
  disableRequestLogging: true,
});

await fastify.register(corsPlugin, {
  origin: '*',
  methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

fastify.register(staticPlugin, {
  root: path.join(import.meta.dirname, 'assets'),
  prefix: '/assets/',
});

await fastify.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Aryja REST API Docs',
      version: getVersion(),
    },
    servers: [
      {
        url: getEnv('APP_PUBLIC_URL'),
        description: 'Development server',
      },
    ],
  },
});

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  theme: {
    title: 'Aryja REST API Docs',
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

fastify.register(getPodcastRoute);
fastify.register(getPodcastCollectionRoute);
fastify.register(deletePodcastRoute);
fastify.register(updatePodcastRoute);
fastify.register(addPodcastRoute);
fastify.register(getPodcastEpisodeRoute);
fastify.register(preparePodcastEpisodeRoute);
fastify.register(streamPodcastEpisodeRoute);
fastify.register(setPodcastEpisodeElapsedStreamTimeRoute);
fastify.register(downloadPodcastEpisodeRoute);
fastify.register(searchPodcastRoute);
fastify.register(getSettingsRoute);
fastify.register(updateSettingsRoute);
fastify.register(getInfoRoute);
fastify.register(getStatusRoute);
fastify.register(updatePodcastsJob);

try {
  await fastify.listen({ port: getEnv('APP_PORT'), host: getEnv('APP_HOSTNAME') });
} catch (error) {
  fastify.log.error(error);
  process.exit(EXIT_CODE_SERVER_FAIL);
}
