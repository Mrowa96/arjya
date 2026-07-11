import type { FastifyInstance } from 'fastify';

import { toJsonSchema } from '@valibot/to-json-schema';
import { createReadStream } from 'fs';
import * as v from 'valibot';

import { getPodcastEpisode } from '../../domain/podcast/repository.ts';
import { EpisodeDownloaderService } from '../../domain/podcast/services/EpisodeDownloaderService.ts';
import { tryCatchSync } from '../../infrastructure/tryCatch.ts';

const paramsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  episodeId: v.pipe(v.string(), v.uuid()),
});
const paramsJsonSchema = toJsonSchema(paramsSchema);

type ParamsJsonSchema = v.InferOutput<typeof paramsSchema>;

export function streamPodcastEpisodeRoute(fastify: FastifyInstance) {
  // TODO Add error codes
  fastify.get<{ Params: ParamsJsonSchema }>(
    '/podcast/:id/episode/:episodeId/stream',
    {
      schema: {
        params: paramsJsonSchema,
        tags: ['podcast'],
      },
    },
    async (request, reply) => {
      const { episodeId } = request.params;

      // Verify if episode exists
      let episode = getPodcastEpisode(episodeId);

      if (!episode) {
        return reply.status(404).send();
      }

      const [episodeDownloaderService, episodeDownloaderServiceError] = tryCatchSync(
        () => new EpisodeDownloaderService(episode),
      );

      if (!episodeDownloaderService) {
        console.error(episodeDownloaderServiceError);

        return reply.status(400).send({
          error: `Unable to initialise EpisodeDownloaderService`,
        });
      }

      const downloadedEpisode = await episodeDownloaderService.getDownloadedEpisode();

      if (!downloadedEpisode) {
        return reply.status(400).send({
          error: 'Episode is not downloaded. Please first call "prepare" endpoint.',
        });
      }

      const { filePath: episodeFilePath, fileStats: episodeFileStats } = downloadedEpisode;

      const { range } = request.headers;

      if (typeof range === 'string') {
        // Range cannot be empty
        if (!range) {
          return reply.status(416).send();
        }

        const unit = range.slice(0, range.indexOf('='));

        // Only bytes range unit is supported
        if (unit !== 'bytes') {
          return reply.status(416).send();
        }

        const bytesRanges = range.slice(range.indexOf('=') + 1);

        // Multipart ranges are not supported
        if (bytesRanges.indexOf(',') !== -1) {
          return reply.status(400).send({ message: 'Multipart ranges are not supported yet.' });
        }

        const ranges = bytesRanges.split('-');

        // Ranges have to have starting point
        if (!ranges[0]) {
          return reply.status(416).send();
        }

        const total = episodeFileStats.size;
        const startRange = Number.parseInt(ranges[0]);
        const endRange = ranges[1] ? Number.parseInt(ranges[1]) : total - 1;

        if (startRange < 0 || endRange >= total || startRange > endRange) {
          return reply.status(416).send();
        }

        const readStream = createReadStream(episodeFilePath, { start: startRange, end: endRange });

        readStream.on('error', (readStreamError) => {
          reply.status(400).send({
            message: `Unable to read episode from file because fo error: ${readStreamError.message}`,
          });
        });

        return reply
          .status(206)
          .headers({
            'content-length': endRange - startRange + 1,
            'content-range': `bytes ${startRange}-${endRange}/${total}`,
            'content-type': episode.source.type,
          })
          .send(readStream);
      }

      const readStream = createReadStream(episodeFilePath);

      readStream.on('error', (readStreamError) => {
        reply.status(400).send({
          message: `Unable to read episode from file because fo error: ${readStreamError.message}`,
        });
      });

      return reply
        .status(200)
        .headers({
          'accept-ranges': 'bytes',
          'last-modified': episodeFileStats.mtimeMs,
          'content-type': episode.source.type,
          'content-length': episodeFileStats.size,
        })
        .send(readStream);
    },
  );
}
