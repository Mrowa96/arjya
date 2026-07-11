import * as v from 'valibot';

import { PodcastThumbnailService } from '../../domain/podcast/services/PodcastThumbnailService.ts';
import { migrate } from '../migration.ts';

const doesColumnExistSchema = v.object({
  column_exists: v.number(),
});

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

await migrate(
  '4_migrate_podcasts_thumbnails',
  async (db) => {
    const rawPodcasts = db.prepare(`SELECT DISTINCT id, image_url FROM podcast`).all();
    const podcasts = v.parse(podcastsSchema, rawPodcasts);

    const podcastThumbnailService = new PodcastThumbnailService();

    const result = await podcastThumbnailService.savePodcastsThumbnail(podcasts);

    if (result.isSuccess) {
      const data = db
        .prepare(
          `SELECT COUNT(*) AS column_exists FROM pragma_table_info('podcast') WHERE name='thumbnail_url'`,
        )
        .get();

      const { column_exists } = v.parse(doesColumnExistSchema, data);

      if (!column_exists) {
        db.exec(`ALTER TABLE podcast ADD COLUMN thumbnail_url TEXT`);
      }

      const updateStatement = db.prepare(
        `
        UPDATE podcast
        SET thumbnail_url = @thumbnailUrl
        WHERE id = @id;`,
      );

      const updateAllEligible = db.transaction((items) => {
        for (const item of items) {
          updateStatement.run({
            id: item.id,
            thumbnailUrl: item.thumbnailUrl,
          });
        }
      });

      updateAllEligible(result.data.successfulItems);
    }
  },
  {
    throwOnRepeat: false,
  },
);
