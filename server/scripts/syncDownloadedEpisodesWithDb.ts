import fs from 'fs/promises';
import path from 'path';

import { backupDb, getDbInstance } from '../src/infrastructure/db.ts';
import { tryCatch, tryCatchSync } from '../src/infrastructure/tryCatch.ts';

console.info('Syncing files on disk with is_downloaded column in db');

process.loadEnvFile();

const [files, filesError] = await tryCatch(() =>
  fs.readdir(path.join(process.cwd(), './data'), {
    recursive: true,
  }),
);

if (filesError) {
  console.error('Unable to read files from data dir.', filesError);

  process.exit(1);
}

const [episodesIds, episodesIdsError] = tryCatchSync(
  () =>
    files.map((file) => {
      const [episodeId] = file.split('.');

      if (typeof episodeId !== 'string') {
        throw new Error(`Invalid file name found: ${file}`);
      }

      return episodeId;
    }),
  false,
);

if (episodesIdsError) {
  console.error('Issue with converting file name to episode id.', episodesIdsError);

  process.exit(2);
}

const db = getDbInstance();

const [, dbBackupError] = await tryCatch(backupDb);

if (dbBackupError) {
  console.error('Unable to create db backup..', dbBackupError);

  process.exit(3);
}

const transaction = db.transaction(() => {
  db.prepare(`UPDATE podcast_episode SET is_downloaded=FALSE`).run();

  const updateIsDownloadedStmt = db.prepare(
    `UPDATE podcast_episode SET is_downloaded=TRUE WHERE id=@id`,
  );

  episodesIds.forEach((episodeId) => {
    updateIsDownloadedStmt.run({
      id: episodeId,
    });
  });
});

transaction();

console.info('Sync completed');
