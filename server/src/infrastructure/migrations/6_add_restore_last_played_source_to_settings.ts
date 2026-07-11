import { migrate } from '../migration.ts';

await migrate('6_add_restore_last_played_source_to_settings', async (db) => {
  db.exec(
    `
    ALTER TABLE settings 
    ADD COLUMN restore_last_played_source_enabled INT DEFAULT TRUE;`,
  );
});
