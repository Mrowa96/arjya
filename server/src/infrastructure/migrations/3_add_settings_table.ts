import { migrate } from '../migration.ts';

await migrate('3_add_settings_table', (db) => {
  db.transaction(() => {
    db.exec(`CREATE TABLE IF NOT EXISTS settings (
       search_enabled INTEGER DEFAULT FALSE,
       search_user_id INTEGER DEFAULT NULL,       
       search_api_key TEXT DEFAULT NULL,
       podcast_update_job_enabled INTEGER DEFAULT TRUE
     );
   `);

    db.exec(`INSERT INTO settings VALUES (FALSE, NULL, NULL, TRUE);`);
  })();
});
