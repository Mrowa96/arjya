import fs from 'fs/promises';
import path from 'path';

import { backupDb } from '../src/infrastructure/db.ts';
import { tryCatch } from '../src/infrastructure/tryCatch.ts';

process.loadEnvFile();

const migrationsPath = path.join(process.cwd(), './src/infrastructure/migrations');

const [migrationFiles, readMigrationsDirError] = await tryCatch(() => fs.readdir(migrationsPath));

if (readMigrationsDirError) {
  console.error('Unable to read migrations dir.', readMigrationsDirError);

  process.exit(1);
}

if (!migrationFiles.length) {
  console.info('No migrations found');

  process.exit(0);
}

const action = process.argv[2];

if (action !== 'up' && action !== 'down') {
  console.error(
    'Action needs to be either "up" or "down". Example: migrate up 1_remove_patronite_url_from_podcast_episode',
  );

  process.exit(2);
}

const [, dbBackupError] = await tryCatch(backupDb);

if (dbBackupError) {
  console.error('Unable to create db backup.');

  process.exit(3);
}

const migrationName = process.argv[3];

if (!migrationName) {
  console.info('Running all migrations...');

  for (const migrationFile of migrationFiles) {
    const migrationName = migrationFile.split('.')[0];

    if (!migrationName) {
      throw new Error(`Unable to generate migration name for file ${migrationFile}.`);
    }

    console.info(`Executing ${migrationName}...`);

    const module = await import(path.join(migrationsPath, migrationFile));

    module[action](migrationName);

    console.info(`Done`);
  }
} else {
  console.info(`Executing ${migrationName}...`);

  const foundMigration = migrationFiles.find(
    (migrationFile) => migrationFile === `${migrationName}.ts`,
  );

  if (!foundMigration) {
    console.error(`Migration cannot be found.`);

    process.exit(4);
  }

  const module = await import(path.join(migrationsPath, foundMigration));

  module[action](migrationName);

  console.info(`Done`);
}
