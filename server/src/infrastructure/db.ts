import Database, { type Database as DbInstance } from 'better-sqlite3';
import path from 'path';

let db: DbInstance | undefined;

export class DatabaseError extends Error {}

function createDbInstance() {
  try {
    db = new Database(path.join(process.cwd(), '/db/data.db'));

    db.pragma('journal_mode = WAL');
    db.prepare(
      `CREATE TABLE IF NOT EXISTS podcast (
          id TEXT NOT NULL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          rss_feed_url TEXT UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          patronite_url TEXT
      )`,
    ).run();
    db.prepare(
      `CREATE TABLE IF NOT EXISTS podcast_episode (
          id TEXT NOT NULL PRIMARY KEY, 
          podcast_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          source_url TEXT NOT NULL,
          source_duration INTEGER NOT NULL,
          source_type TEXT NOT NULL,
          image_url TEXT,
          elapsed_stream_time INTEGER,
          last_played_at INTEGER,
          published_at INTEGER NOT NULL,
          FOREIGN KEY(podcast_id) REFERENCES podcast(id)
      )`,
    ).run();

    return db;
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
