import type { Database } from 'better-sqlite3';

import { getDbInstance } from './db.ts';

type Options = {
  throwOnRepeat?: boolean;
};

const defaultOptions: Options = {
  /** Throw if the same migration will be executed again */
  throwOnRepeat: true,
};

export async function migrate(
  name: string,
  migration: (db: Database) => void | Promise<void>,
  options: Options = defaultOptions,
) {
  const db = getDbInstance();
  const existingMigration = db.prepare(`SELECT * FROM migration WHERE name = ?`).get(name);

  if (options.throwOnRepeat) {
    if (existingMigration) {
      throw new Error(`Migration with name ${name} already has been executed.`);
    }
  }

  await migration(db);

  if (existingMigration) {
    db.prepare(`UPDATE migration SET created_at = UNIXEPOCH() WHERE name = @name;`).run({
      name,
    });
  } else {
    db.prepare(`INSERT INTO migration VALUES (@name, UNIXEPOCH());`).run({ name });
  }
}
