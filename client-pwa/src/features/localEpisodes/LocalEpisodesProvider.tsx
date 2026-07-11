import { type PropsWithChildren, createContext, useCallback, useContext, useState } from 'react';

import { useDownloadPodcastEpisode } from '../../hooks/api/useDownloadPodcastEpisode';
import { useInvalidatePodcastEpisodeDetail } from '../../hooks/api/usePodcastEpisodeDetail';
import type { CloudEpisode, LocalEpisode } from '../../types';
import { useToast } from '../../ui/Toast/Toast';
import { tryCatch } from '../../utils/tryCatch';
import {
  deleteLocalEpisodeFromDb,
  getLocalEpisodeFromDb,
  getSavedEpisodesFromDb,
  openEpisodesDb,
  upsertEpisodeToDb,
} from './episodesDb';
import { useInvalidateAllStoredEpisodesGroupedByPodcasts } from './hooks/useAllStoredEpisodesGroupedByPodcasts';

type LocalEpisodesContextType = {
  storeEpisode: (episode: CloudEpisode) => Promise<boolean>;
  isEpisodeStorePending: (episodeId: string) => boolean;
  updateStoredEpisode: (episode: CloudEpisode) => Promise<boolean>;
  deleteStoredEpisode: (episodeId: string, podcastId: string) => Promise<boolean>;
  getStoredEpisode: (episodeId: string) => Promise<LocalEpisode | null>;
  getAllStoredEpisodes: () => Promise<LocalEpisode[]>;
};

const LocalEpisodesContext = createContext<LocalEpisodesContextType>({
  storeEpisode: () => Promise.resolve(false),
  isEpisodeStorePending: () => false,
  updateStoredEpisode: () => Promise.resolve(false),
  deleteStoredEpisode: () => Promise.resolve(false),
  getStoredEpisode: () => Promise.resolve(null),
  getAllStoredEpisodes: () => Promise.resolve([]),
});

export function LocalEpisodesProvider({ children }: PropsWithChildren) {
  const [pendingEpisodesStoring, setPendingEpisodesStoring] = useState<Set<string>>(new Set());
  const { mutateAsync: downloadEpisode } = useDownloadPodcastEpisode();
  const invalidatePodcastEpisodeDetail = useInvalidatePodcastEpisodeDetail();
  const invalidateAllStoredEpisodesGroupedByPodcasts =
    useInvalidateAllStoredEpisodesGroupedByPodcasts();
  const { addToast } = useToast();

  const storeEpisode = useCallback(
    async (episode: CloudEpisode) => {
      setPendingEpisodesStoring((previousSet) => new Set(previousSet).add(episode.id));

      const removeEpisodeIdFromSet = (previousSet: Set<string>) => {
        const newSet = new Set(previousSet);

        newSet.delete(episode.id);

        return newSet;
      };

      const [episodeBlob, episodeBlobError] = await tryCatch(() =>
        downloadEpisode({
          episodeId: episode.id,
          podcastId: episode.podcast.id,
        }),
      );

      if (episodeBlobError) {
        console.error('Unable to download episode to save it locally.', episodeBlobError);

        setPendingEpisodesStoring(removeEpisodeIdFromSet);

        addToast({
          message: 'Unable to download episode.',
          type: 'error',
        });

        return false;
      }

      const [episodeThumbnailBlob] = await tryCatch(async () => {
        if (!episode.thumbnailUrl) {
          return null;
        }

        const thumbnailResponse = await fetch(episode.thumbnailUrl);

        return thumbnailResponse.blob();
      });

      const [, upsertEpisodeToDbError] = await tryCatch(async () => {
        const episodesDb = await openEpisodesDb();

        return upsertEpisodeToDb(episodesDb, {
          ...episode,
          type: 'local',
          blob: episodeBlob,
          thumbnail: episodeThumbnailBlob,
        });
      });

      if (upsertEpisodeToDbError) {
        console.error('Unable to save episode locally.', upsertEpisodeToDbError);

        setPendingEpisodesStoring(removeEpisodeIdFromSet);

        addToast({
          message: 'Unable to store downloaded episode.',
          type: 'error',
        });

        return false;
      }

      await invalidatePodcastEpisodeDetail(episode.podcast.id, episode.id);
      await invalidateAllStoredEpisodesGroupedByPodcasts();

      setPendingEpisodesStoring(removeEpisodeIdFromSet);

      return true;
    },
    [
      downloadEpisode,
      invalidatePodcastEpisodeDetail,
      invalidateAllStoredEpisodesGroupedByPodcasts,
      addToast,
    ],
  );

  const isEpisodeStorePending = useCallback(
    (episodeId: string) => {
      return pendingEpisodesStoring.has(episodeId);
    },
    [pendingEpisodesStoring],
  );

  const updateStoredEpisode = useCallback(
    async (episode: CloudEpisode) => {
      const [, upsertEpisodeToDbError] = await tryCatch(async () => {
        const episodesDb = await openEpisodesDb();
        const localEpisode = await getLocalEpisodeFromDb(episodesDb, episode.id);

        if (!localEpisode) {
          throw new Error('Unable to find stored episode to update.');
        }

        return upsertEpisodeToDb(episodesDb, {
          ...episode,
          type: 'local',
          blob: localEpisode.blob,
          thumbnail: localEpisode.thumbnail || null,
        });
      }, false);

      if (upsertEpisodeToDbError) {
        console.error('Unable to update episode locally.', upsertEpisodeToDbError);

        addToast({
          id: 'update-stored-episode-error',
          message: 'Unable to update stored downloaded episode.',
          type: 'error',
        });

        return false;
      }

      return true;
    },
    [addToast],
  );

  const deleteStoredEpisode = useCallback(
    async (episodeId: string, podcastId: string) => {
      const [, deleteEpisodeFromDbError] = await tryCatch(async () => {
        const episodesDb = await openEpisodesDb();

        await deleteLocalEpisodeFromDb(episodesDb, episodeId);
      });

      if (deleteEpisodeFromDbError) {
        console.error('Unable to delete episode from local db.', deleteEpisodeFromDbError);

        addToast({
          message: 'Unable to delete stored episode.',
          type: 'error',
        });

        return false;
      }

      await invalidatePodcastEpisodeDetail(podcastId, episodeId);
      await invalidateAllStoredEpisodesGroupedByPodcasts();

      return true;
    },
    [invalidatePodcastEpisodeDetail, invalidateAllStoredEpisodesGroupedByPodcasts, addToast],
  );

  const getStoredEpisode = useCallback(async (episodeId: string) => {
    const [localEpisodeFromDb, localEpisodeFromDbError] = await tryCatch(async () => {
      const episodesDb = await openEpisodesDb();

      return getLocalEpisodeFromDb(episodesDb, episodeId);
    }, true);

    if (localEpisodeFromDbError) {
      return null;
    }

    return localEpisodeFromDb;
  }, []);

  const getAllStoredEpisodes = useCallback(async () => {
    const episodesDb = await openEpisodesDb();
    const localEpisodes = await getSavedEpisodesFromDb(episodesDb);

    return localEpisodes;
  }, []);

  return (
    <LocalEpisodesContext.Provider
      value={{
        storeEpisode,
        isEpisodeStorePending,
        updateStoredEpisode,
        deleteStoredEpisode,
        getStoredEpisode,
        getAllStoredEpisodes,
      }}
    >
      {children}
    </LocalEpisodesContext.Provider>
  );
}

export function useLocalEpisodes() {
  return useContext(LocalEpisodesContext);
}
