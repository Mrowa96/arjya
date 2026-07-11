import { getDbInstance } from '../db.ts';

const db = getDbInstance();

db.pragma('foreign_keys=off;');

const migrate = db.transaction(() => {
  db.exec('ALTER TABLE podcast_episode RENAME TO _podcast_episode');
  db.exec(`
    CREATE TABLE IF NOT EXISTS podcast_episode (
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
        FOREIGN KEY(podcast_id) REFERENCES podcast(id) ON DELETE CASCADE
    );
`);
  db.exec(`INSERT INTO podcast_episode SELECT * FROM _podcast_episode`);
  db.exec(`DROP TABLE IF EXISTS _podcast_episode`);
});

migrate();

db.pragma('foreign_keys=on;');
