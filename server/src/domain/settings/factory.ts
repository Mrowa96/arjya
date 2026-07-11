import type { RawSettings, Settings } from './types.ts';

export function createSettings(rawSettings: RawSettings): Settings {
  return {
    search: {
      enabled: rawSettings.search_enabled,
      userId: rawSettings.search_user_id,
      apiKey: rawSettings.search_api_key,
    },
    podcastUpdateJob: {
      enabled: rawSettings.podcast_update_job_enabled,
    },
    restoreLastPlayedSource: {
      enabled: rawSettings.restore_last_played_source_enabled,
    },
  };
}
