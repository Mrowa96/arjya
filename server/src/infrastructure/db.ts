import Database, { type Database as DbInstance } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

import { tryCatchSync } from './tryCatch.ts';

let db: DbInstance | undefined;

export class DatabaseError extends Error {}

function createDbInstance() {
  try {
    const dbDirPath = path.join(process.cwd(), './db');
    const [, dbDirStatsError] = tryCatchSync(() => fs.statSync(dbDirPath));

    if (dbDirStatsError) {
      const [, dbMkdirError] = tryCatchSync(() => fs.mkdirSync(dbDirPath));

      if (dbMkdirError) {
        throw new Error('Unable to create db directory.');
      }
    }

    const newDb = new Database(path.join(process.cwd(), '/db/data.db'));

    newDb.pragma('journal_mode = WAL');

    newDb.transaction(() => {
      newDb.exec(
        `CREATE TABLE IF NOT EXISTS podcast (
          id TEXT NOT NULL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          rss_feed_url TEXT UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          thumbnail_url TEXT,
          patronite_url TEXT
        );`,
      );

      newDb.exec(
        `CREATE TABLE IF NOT EXISTS podcast_episode (
          id TEXT NOT NULL PRIMARY KEY, 
          podcast_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          source_url TEXT NOT NULL,
          source_duration INTEGER NOT NULL,
          source_type TEXT NOT NULL,
          image_url TEXT,
          thumbnail_url TEXT DEFAULT NULL,
          elapsed_stream_time INTEGER,
          last_played_at INTEGER,
          is_downloaded INTEGER DEFAULT FALSE,
          was_thumbnail_download_triggered INT DEFAULT FALSE,
          published_at INTEGER NOT NULL,
          FOREIGN KEY(podcast_id) REFERENCES podcast(id) ON DELETE CASCADE
        );`,
      );

      newDb.exec(
        `CREATE TABLE IF NOT EXISTS migration (
          name TEXT NOT NULL PRIMARY KEY,
          created_at INTEGER NOT NULL
        );`,
      );

      newDb.exec(
        `CREATE TABLE IF NOT EXISTS settings (
          search_enabled INTEGER DEFAULT FALSE,
          search_user_id INTEGER DEFAULT NULL,       
          search_api_key TEXT DEFAULT NULL,
          podcast_update_job_enabled INTEGER DEFAULT TRUE,
          restore_last_played_source_enabled INT DEFAULT TRUE
        );`,
      );

      newDb.exec(`INSERT INTO settings VALUES (FALSE, NULL, NULL, TRUE, TRUE);`);
    })();

    return newDb;
  } catch (error) {
    throw new DatabaseError('Cannot create db instance', { cause: error });
  }
}

/**
 * @throws {DatabaseError}
 */
export function getDbInstance(): DbInstance {
  if (!db) {
    return createDbInstance();
  }

  return db;
}

export { type DbInstance };

export async function backupDb() {
  return getDbInstance().backup(path.join(process.cwd(), `./db/db-backup-${Date.now()}.db`));
}
