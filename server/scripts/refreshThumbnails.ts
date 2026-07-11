import fs from 'fs/promises';
import path from 'path';
import * as v from 'valibot';

import { PodcastThumbnailService } from '../src/domain/podcast/services/PodcastThumbnailService.ts';
import { getDbInstance } from '../src/infrastructure/db.ts';
import { tryCatch } from '../src/infrastructure/tryCatch.ts';

const podcastsSchema = v.array(
  v.pipe(
    v.object({
      id: v.string(),
      image_url: v.string(),
    }),
    v.transform((input) => ({
      id: input.id,
      imageUrl: input.image_url,
    })),
  ),
);

const [, rmError] = await tryCatch(() =>
  fs.rm(path.join(process.cwd(), './assets/*'), {
    recursive: true,
    force: true,
  }),
);

if (rmError) {
  console.error('Unable to remove assets directory.');

  process.exit(1);
}

const db = getDbInstance();

const rawPodcasts = db.prepare(`SELECT DISTINCT id, image_url FROM podcast;`).all();
const podcasts = v.parse(podcastsSchema, rawPodcasts);

const podcastThumbnailService = new PodcastThumbnailService();

const result = await podcastThumbnailService.savePodcastsThumbnail(podcasts);

if (!result.isSuccess) {
  console.error(result.error);

  process.exit(2);
}

const transaction = db.transaction(() => {
  db.prepare(`UPDATE podcast SET thumbnail_url=NULL;`).run();

  const updateStatement = db.prepare(
    `
      UPDATE podcast
      SET thumbnail_url = @thumbnailUrl
      WHERE id = @id;`,
  );

  for (const item of result.data.successfulItems) {
    updateStatement.run({
      id: item.id,
      thumbnailUrl: item.thumbnailUrl,
    });
  }

  db.prepare(
    `UPDATE podcast_episode SET thumbnail_url=NULL, was_thumbnail_download_triggered=FALSE;`,
  ).run();
});

transaction();
