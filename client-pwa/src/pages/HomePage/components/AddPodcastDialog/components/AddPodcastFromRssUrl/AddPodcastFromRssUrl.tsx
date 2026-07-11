import { useCallback } from 'react';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Controller, useForm } from 'react-hook-form';
import * as v from 'valibot';

import { useAddPodcast } from '../../../../../../hooks/api/useAddPodcast';
import { Button } from '../../../../../../ui/Button/Button';
import { Input } from '../../../../../../ui/Input/Input';
import { MessageBox } from '../../../../../../ui/MessageBox/MessageBox';
import { getApiErrorMessage } from '../../../../../../utils/api';

import styles from './AddPodcastFromRssUrl.module.css';

const formSchema = v.object({
  rssUrl: v.pipe(v.string(), v.url('Rss url have to be an valid url.')),
});

type FormValues = v.InferOutput<typeof formSchema>;

type Props = {
  setIsOpen: (value: boolean) => void;
};

export function AddPodcastFromRssUrl({ setIsOpen }: Props) {
  const {
    mutateAsync: addPodcast,
    isPending: addPodcastPending,
    error: addPodcastError,
  } = useAddPodcast();
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      rssUrl: '',
    },
  });

  const submitHandler = useCallback(
    async ({ rssUrl }: FormValues) => {
      await addPodcast(rssUrl);

      setIsOpen(false);
    },
    [addPodcast, setIsOpen],
  );

  return (
    <>
      <form onSubmit={handleSubmit(submitHandler)} className={styles.addPodcastForm} noValidate>
        <Controller
          control={control}
          name="rssUrl"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Podcast rss url"
              type="url"
              error={fieldState.error?.message}
              autoFocus
            />
          )}
        />
        <div className={styles.buttonWrapper}>
          <Button type="submit" label="Add podcast" isLoading={addPodcastPending} />
        </div>{' '}
      </form>

      {!!addPodcastError && (
        <MessageBox message={getApiErrorMessage(addPodcastError.code)} variant="error" />
      )}
    </>
  );
}
