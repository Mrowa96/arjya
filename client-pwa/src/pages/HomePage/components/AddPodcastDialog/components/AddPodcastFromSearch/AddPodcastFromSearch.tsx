import { useCallback, useRef, useState } from 'react';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { RiAddCircleLine } from '@remixicon/react';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import * as v from 'valibot';

import { useAddPodcast } from '../../../../../../hooks/api/useAddPodcast';
import { useSearchPodcast } from '../../../../../../hooks/api/useSearchPodcast';
import { Button } from '../../../../../../ui/Button/Button';
import { Image } from '../../../../../../ui/Image/Image';
import { Input } from '../../../../../../ui/Input/Input';
import { Loader } from '../../../../../../ui/Loader/Loader';
import { MessageBox } from '../../../../../../ui/MessageBox/MessageBox';
import { Text } from '../../../../../../ui/Text/Text';
import { type ApiSearchListData, getApiErrorMessage } from '../../../../../../utils/api';

import styles from './AddPodcastFromSearch.module.css';

const formSchema = v.object({
  phrase: v.pipe(v.string(), v.minLength(2, 'Podcast name has to be at least 2 characters long')),
});

type FormValues = v.InferOutput<typeof formSchema>;

type Props = {
  setIsOpen: (value: boolean) => void;
};

export function AddPodcastFromSearch({ setIsOpen }: Props) {
  const {
    mutateAsync: addPodcast,
    isPending: isAddPodcastPending,
    variables: addPodcastRssUrl,
  } = useAddPodcast();
  const {
    mutateAsync: searchPodcast,
    isPending: isSearchPodcastPending,
    isSuccess: isSearchPodcastSuccess,
    error: searchPodcastError,
  } = useSearchPodcast();
  const [foundPodcasts, setFoundPodcasts] = useState<ApiSearchListData['items']>([]);
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      phrase: '',
    },
  });
  const phraseRef = useRef('');

  const submitHandler = useCallback(
    async ({ phrase }: FormValues) => {
      // Prevent content from flickering when searching for the same phrase
      if (phraseRef.current === phrase && !searchPodcastError) {
        return;
      }

      phraseRef.current = phrase;

      setFoundPodcasts([]);

      const result = await searchPodcast(phrase);

      setFoundPodcasts(result.items);
    },
    [searchPodcastError, searchPodcast],
  );

  const podcastCardClickHandler = useCallback(
    async (rssUrl: string) => {
      if (await addPodcast(rssUrl)) {
        setIsOpen(false);
      }
    },
    [addPodcast, setIsOpen],
  );

  return (
    <div className={styles.dialogContent}>
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(submitHandler)} className={styles.addPodcastForm} noValidate>
        <Controller
          control={control}
          name="phrase"
          render={({ field, fieldState }) => (
            <>
              <Input
                {...field}
                label="Podcast name"
                type="text"
                error={fieldState.error?.message}
                autoFocus
              />
              <div className={styles.buttonWrapper}>
                <Button
                  type="submit"
                  label="Search"
                  isLoading={isSearchPodcastPending}
                  isDisabled={isAddPodcastPending}
                />
              </div>
            </>
          )}
        />
      </form>

      {isSearchPodcastSuccess && (
        <div className={styles.searchResults}>
          <Text variant="heading-3">Results</Text>

          {foundPodcasts.length > 0 ? (
            <div className={styles.foundPodcasts}>
              {foundPodcasts.map((foundPodcast) => (
                <button
                  key={foundPodcast.rssUrl}
                  type="button"
                  className={clsx(
                    styles.foundPodcast,
                    isAddPodcastPending &&
                      addPodcastRssUrl === foundPodcast.rssUrl &&
                      styles.isAddPodcastPending,
                  )}
                  onClick={() => podcastCardClickHandler(foundPodcast.rssUrl)}
                  disabled={isAddPodcastPending}
                >
                  {foundPodcast.thumbnailUrl ? (
                    <Image
                      src={foundPodcast.thumbnailUrl}
                      width={128}
                      height={128}
                      alt={foundPodcast.name}
                    />
                  ) : (
                    <span className="line-clamp-4">{foundPodcast.name}</span>
                  )}

                  {isAddPodcastPending && addPodcastRssUrl === foundPodcast.rssUrl ? (
                    <div className={styles.loaderWrapper}>
                      <Loader withWrapper size={32} />
                    </div>
                  ) : (
                    <RiAddCircleLine className={styles.addIcon} size={32} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <Text>No podcasts have been found.</Text>
          )}
        </div>
      )}

      {!!searchPodcastError && (
        <MessageBox message={getApiErrorMessage(searchPodcastError.code)} variant="error" />
      )}
    </div>
  );
}
