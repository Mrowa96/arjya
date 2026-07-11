import { useCallback, useEffect } from 'react';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { RiSaveLine } from '@remixicon/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import * as v from 'valibot';

import {
  API_URL_INVALID_MESSAGE,
  API_URL_REGEXP,
  getApiUrl,
  setApiUrl,
} from '../../features/apiUrlManager/ApiUrlManager';
import { useSettings } from '../../features/settings/SettingsProvider';
import { PageLayout } from '../../layouts/PageLayout/PageLayout';
import { Button } from '../../ui/Button/Button';
import { Input } from '../../ui/Input/Input';
import { Switch } from '../../ui/Switch/Switch';
import { Text } from '../../ui/Text/Text';

import styles from './SettingsPage.module.css';

const formSchema = v.object({
  search: v.object({
    enabled: v.boolean(),
    userId: v.nullable(v.string()),
    apiKey: v.nullable(v.string()),
  }),
  podcastUpdateJob: v.object({
    enabled: v.boolean(),
  }),
  restoreLastPlayedSource: v.object({
    enabled: v.boolean(),
  }),
  apiUrl: v.pipe(v.string(), v.regex(API_URL_REGEXP, API_URL_INVALID_MESSAGE)),
});

type FormValues = v.InferOutput<typeof formSchema>;

export default function SettingsPage() {
  const { settings, updateSettings, isUpdateSettingsPending } = useSettings();
  const { control, formState, reset, handleSubmit, setError } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      search: {
        enabled: false,
        userId: null,
        apiKey: null,
      },
      podcastUpdateJob: {
        enabled: false,
      },
      restoreLastPlayedSource: {
        enabled: false,
      },
      apiUrl: getApiUrl(),
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        search: {
          enabled: settings.search.enabled || false,
          userId: `${settings.search.userId}` || null,
          apiKey: settings.search.apiKey || null,
        },
        podcastUpdateJob: {
          enabled: settings.podcastUpdateJob.enabled || false,
        },
        restoreLastPlayedSource: {
          enabled: settings.restoreLastPlayedSource.enabled || false,
        },
        apiUrl: getApiUrl(),
      });
    }
  }, [reset, settings]);

  const submitHandler = useCallback(
    async (values: FormValues) => {
      if (values.apiUrl !== getApiUrl()) {
        const isSuccess = await setApiUrl(values.apiUrl);

        if (!isSuccess) {
          setError('apiUrl', {
            message: "Provided url doesn't point to working Arjya Server instance",
          });
        }
      }

      // TODO handle error
      await updateSettings(values);
    },
    [setError, updateSettings],
  );

  const isSearchEnabled = useWatch({
    control,
    name: 'search.enabled',
  });

  return (
    <PageLayout title="Settings">
      <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
        <div className={styles.section}>
          <Text variant="heading-2">General</Text>

          <Controller
            control={control}
            name="apiUrl"
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="url"
                label="Api url"
                placeholder="https://arjya-server.local:3000"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="podcastUpdateJob.enabled"
            render={({ field, fieldState }) => (
              <Switch {...field} label="Auto update podcasts" error={fieldState.error?.message} />
            )}
          />

          <Controller
            control={control}
            name="restoreLastPlayedSource.enabled"
            render={({ field, fieldState }) => (
              <Switch
                {...field}
                label="Restore last played episode on start"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className={styles.section}>
          <Text variant="heading-2">Search</Text>

          <Controller
            control={control}
            name="search.enabled"
            render={({ field, fieldState }) => (
              <Switch {...field} label="Enable search" error={fieldState.error?.message} />
            )}
          />

          {isSearchEnabled && (
            <div className={styles.searchControls}>
              <Controller
                control={control}
                name="search.userId"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="User Id"
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="search.apiKey"
                render={({ field, fieldState }) => (
                  <Input {...field} type="text" label="Api key" error={fieldState.error?.message} />
                )}
              />
            </div>
          )}
        </div>

        <div className={styles.submitWrapper}>
          <Button
            type="submit"
            label="Save"
            icon={<RiSaveLine />}
            isLoading={isUpdateSettingsPending}
            isDisabled={!formState.isDirty}
          />
        </div>
      </form>
    </PageLayout>
  );
}
