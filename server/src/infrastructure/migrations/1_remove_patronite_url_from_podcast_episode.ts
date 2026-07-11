import { migrateDown, migrateUp } from '../migration.ts';

export const up = migrateUp((db) => {
  db.exec(`ALTER TABLE podcast DROP COLUMN patronite_url;`);
});

export const down = migrateDown((db) => {
  db.exec(`ALTER TABLE podcast ADD COLUMN patronite_url TEXT;`);
});
