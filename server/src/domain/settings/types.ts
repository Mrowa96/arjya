import type { InferOutput } from 'valibot';

import type { rawSettingsSchema, settingsSchema } from './schema.ts';

export type RawSettings = InferOutput<typeof rawSettingsSchema>;

export type Settings = InferOutput<typeof settingsSchema>;
