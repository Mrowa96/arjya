import { getDbInstance } from '../db.ts';

const db = getDbInstance();

const migrate = db.transaction(() => {
  db.exec(`CREATE TABLE IF NOT EXISTS migration (
      name TEXT NOT NULL PRIMARY KEY,
      created_at INTEGER NOT NULL
    );
  `);

  db.exec(`INSERT INTO migration VALUES (
      '0_add_on_delete_cascade_to_podcast',
      UNIXEPOCH()
    );
  `);

  db.exec(`INSERT INTO migration VALUES (
      '1_add_is_downloaded_to_episode',
      UNIXEPOCH()
    );
  `);
  db.exec(`INSERT INTO migration VALUES (
      '2_add_migration_table',
      UNIXEPOCH()
    );
  `);
});

migrate();
