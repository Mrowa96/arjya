import fs from 'fs/promises';

import { getDbInstance } from '../db.ts';

const db = getDbInstance();
let downloadedEpisodesIds: string[] = [];

try {
  downloadedEpisodesIds = (await fs.readdir('./data', { encoding: 'utf-8' })).map((file) => {
    const [id] = file.split('.');

    if (typeof id === 'string') {
      return id;
    }

    throw new Error(`${id} should be string`);
  });
} catch (error) {
  console.error('Cannot get list of downloaded episodes.', error);

  process.exit(1);
}

try {
  await db.backup(`./db/db-backup-${Date.now()}.db`);

  console.log('Db backup complete!');
} catch (error) {
  console.log('Db backup failed:', error);
}

const migrate = db.transaction(() => {
  db.exec(`
    ALTER TABLE podcast_episode ADD COLUMN is_downloaded INTEGER DEFAULT FALSE`);

  downloadedEpisodesIds.map((id) =>
    db
      .prepare(
        `
         UPDATE podcast_episode
         SET is_downloaded = TRUE
         WHERE id=@episodeId
       `,
      )
      .run({
        episodeId: id,
      }),
  );
});

migrate();
