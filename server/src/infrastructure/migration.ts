import type { Database } from 'better-sqlite3';

import { getDbInstance } from './db.ts';

type UpOptions = {
  throwOnRepeat?: boolean;
};

const upDefaultOptions: UpOptions = {
  /** Throw if the same migration will be executed again */
  throwOnRepeat: true,
};

export function migrateUp(
  migrationFn: (db: Database) => void | Promise<void>,
  options: UpOptions = upDefaultOptions,
) {
  return (name: string) => {
    const db = getDbInstance();
    const existingMigration = db.prepare(`SELECT * FROM migration WHERE name = ?`).get(name);

    if (options.throwOnRepeat) {
      if (existingMigration) {
        throw new Error(`Migration with name ${name} already has been executed.`);
      }
    }

    db.transaction(() => {
      migrationFn(db);

      if (existingMigration) {
        db.prepare(`UPDATE migration SET created_at = UNIXEPOCH() WHERE name = @name;`).run({
          name,
        });
      } else {
        db.prepare(`INSERT INTO migration VALUES (@name, UNIXEPOCH());`).run({ name });
      }
    })();
  };
}

export function migrateDown(migrationFn: (db: Database) => void | Promise<void>) {
  return (name: string) => {
    const db = getDbInstance();
    const existingMigration = db.prepare(`SELECT * FROM migration WHERE name = ?`).get(name);

    if (!existingMigration) {
      throw new Error(`Migration with name ${name} hasn't been executed yet.`);
    }

    db.transaction(() => {
      migrationFn(db);

      db.prepare(`DELETE FROM migration WHERE name = ?;`).run(name);
    })();
  };
}
