import { getDbInstance } from '../../infrastructure/db.ts';
import { parseData } from '../../infrastructure/parser.ts';
import { type Result, ResultError } from '../../infrastructure/result.ts';
import { tryCatchSync } from '../../infrastructure/tryCatch.ts';
import { createSettings } from './factory.ts';
import { rawSettingsSchema } from './schema.ts';
import type { Settings } from './types.ts';

export function getSettings() {
  const db = getDbInstance();

  const [rawSettingsData, settingsError] = tryCatchSync(() =>
    db.prepare(`SELECT * FROM settings LIMIT 1`).get(),
  );

  if (settingsError) {
    throw new Error('Settings are not exisiting in database.');
  }

  const settings = parseData(rawSettingsData, rawSettingsSchema);

  if (!settings) {
    throw new Error('Issue while parsing settings data.');
  }

  return createSettings(settings);
}

export function updateSettings(settingsDTO: Settings): Result<void> {
  const db = getDbInstance();

  const [, updateError] = tryCatchSync(() =>
    db
      .prepare(
        `UPDATE settings SET 
          search_enabled = @searchEnabled,
          search_user_id = @searchUserId,
          search_api_key = @searchApiKey,
          podcast_update_job_enabled = @podcastUpdateJobEnabled,
          restore_last_played_source_enabled = @restoreLastPlayedSourceEnabled
        `,
      )
      .run({
        searchEnabled: settingsDTO.search.enabled ? 1 : 0,
        searchUserId: settingsDTO.search.userId,
        searchApiKey: settingsDTO.search.apiKey,
        podcastUpdateJobEnabled: settingsDTO.podcastUpdateJob.enabled ? 1 : 0,
        restoreLastPlayedSourceEnabled: settingsDTO.restoreLastPlayedSource.enabled ? 1 : 0,
      }),
  );

  if (updateError) {
    return {
      isSuccess: false,
      error: new ResultError(`Unable to update settings.`, {
        cause: updateError,
      }),
    };
  }

  return {
    isSuccess: true,
    data: undefined,
  };
}
