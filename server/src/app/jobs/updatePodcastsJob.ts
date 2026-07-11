import type { FastifyInstance } from 'fastify';

import { Cron } from 'croner';

import { updatePodcasts } from '../../domain/podcast/repository.ts';
import { getSettings } from '../../domain/settings/repository.ts';
import { EXIT_CODE_CRON_JOB_FAIL } from '../consts.ts';

export async function updatePodcastsJob(fastify: FastifyInstance) {
  try {
    const settings = getSettings();

    if (!settings.podcastUpdateJob.enabled) {
      return;
    }
  } catch (error) {
    fastify.log.error(
      new Error(
        `Unable to access settings in updatePodcastsJob. Probably settings migration is missing. Job won't be enabled before next restart.`,
        { cause: error },
      ),
    );

    return;
  }

  new Cron(
    '0 */12 * * *',
    async () => {
      console.info(`Starting to update podcasts at ${new Date().toLocaleString()}.`);

      const result = await updatePodcasts();

      if (result.isSuccess) {
        console.info(`Podcasts update succeeded at ${new Date().toLocaleString()}.`);
      } else {
        console.error(result.error.message);
        console.info(`Podcasts update failed at ${new Date().toLocaleString()}.`);
      }
    },
    {
      protect: true,
      catch: (error) => {
        fastify.log.error(error);
        process.exit(EXIT_CODE_CRON_JOB_FAIL);
      },
    },
  );
}
