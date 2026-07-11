import { type PropsWithChildren, useCallback, useState } from 'react';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Controller, useForm } from 'react-hook-form';
import * as v from 'valibot';

import { Button } from '../../ui/Button/Button';
import Dialog from '../../ui/Dialog/Dialog';
import { Input } from '../../ui/Input/Input';

import styles from './ApiUrlManager.module.css';

const API_URL_KEY = 'api_url';

export const API_URL_REGEXP = new RegExp(
  /^https?:\/\/(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(?::\d{1,5})?$/,
);

export const API_URL_INVALID_MESSAGE =
  'Invalid url. It should follow format <scheme>://<host><?:<port>> eg. https://some-domain.com or https://some-domain.com:1234';

export async function setApiUrl(apiUrl: string, onSuccess?: () => void) {
  try {
    const response = await fetch(new URL('/info', apiUrl));
    const data = await response.json();

    if (data.name === 'arjya-server') {
      localStorage.setItem(API_URL_KEY, apiUrl);

      onSuccess?.();

      return true;
    }
  } catch (error) {
    console.error(error);
  }

  return false;
}

const formSchema = v.object({
  apiUrl: v.pipe(v.string(), v.regex(API_URL_REGEXP, API_URL_INVALID_MESSAGE)),
});

type FormValues = v.InferOutput<typeof formSchema>;

export function ApiUrlManager({ children }: PropsWithChildren) {
  const persistedApiUrl = localStorage.getItem(API_URL_KEY);
  const isPersistedApiUrlValid = !!persistedApiUrl && API_URL_REGEXP.test(persistedApiUrl);
  const [, forceRender] = useState<number>();
  const { control, handleSubmit, setError } = useForm<FormValues>({
    defaultValues: {
      apiUrl: persistedApiUrl || '',
    },
    resolver: valibotResolver(formSchema),
  });

  const submitHandler = useCallback(
    async ({ apiUrl }: FormValues) => {
      const isSuccess = await setApiUrl(apiUrl, () => {
        forceRender(Math.random());
      });

      if (!isSuccess) {
        setError('apiUrl', {
          message: "Provided url doesn't point to working Arjya Server instance",
        });
      }
    },
    [setError],
  );

  if (isPersistedApiUrlValid) {
    return children;
  }

  return (
    <Dialog
      title="Configure Api url"
      isOpen={true}
      setIsOpen={() => undefined}
      size="small"
      disableCloseButton
    >
      <form onSubmit={handleSubmit(submitHandler)} className={styles.form} noValidate>
        <Controller
          control={control}
          name="apiUrl"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Api url"
              placeholder="https://arjya-server.local:3000"
              type="url"
              error={fieldState.error?.message}
              autoFocus
            />
          )}
        />

        <div className={styles.buttonWrapper}>
          <Button type="submit" label="Save" />
        </div>
      </form>
    </Dialog>
  );
}

export function getApiUrl() {
  const persistedApiUrl = localStorage.getItem(API_URL_KEY);

  if (!persistedApiUrl) {
    throw new Error('Api url is not defined!');
  }

  return persistedApiUrl;
}
