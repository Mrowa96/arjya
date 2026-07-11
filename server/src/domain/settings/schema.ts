import * as v from 'valibot';

export const rawSettingsSchema = v.pipe(
  v.object({
    search_enabled: v.number(),
    search_user_id: v.nullable(v.number()),
    search_api_key: v.nullable(v.string()),
    podcast_update_job_enabled: v.number(),
    restore_last_played_source_enabled: v.number(),
  }),
  v.transform((input) => {
    return {
      ...input,
      search_enabled: input.search_enabled === 1,
      podcast_update_job_enabled: input.podcast_update_job_enabled === 1,
      restore_last_played_source_enabled: input.restore_last_played_source_enabled === 1,
    };
  }),
);

export const settingsSchema = v.object({
  search: v.object({
    enabled: v.boolean(),
    userId: v.nullable(v.number()),
    apiKey: v.nullable(v.string()),
  }),
  podcastUpdateJob: v.object({
    enabled: v.boolean(),
  }),
  restoreLastPlayedSource: v.object({
    enabled: v.boolean(),
  }),
});
