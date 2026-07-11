import { migrate } from '../migration.ts';

await migrate('5_add_thumbnail_to_episode', async (db) => {
  const transaction = db.transaction(() => {
    db.exec(
      `
      ALTER TABLE podcast_episode 
      ADD COLUMN thumbnail_url TEXT DEFAULT NULL;`,
    );

    db.exec(
      `
      ALTER TABLE podcast_episode 
      ADD COLUMN was_thumbnail_download_triggered INT DEFAULT FALSE;`,
    );
  });

  transaction();
});
