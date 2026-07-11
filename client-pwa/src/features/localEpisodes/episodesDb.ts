import type { LocalEpisode } from '../../types';
import { ToastManager } from '../../ui/Toast/Toast';

const DB_NAME = 'episodesDb';
const OBJECT_STORE_NAME = 'episodes';

function createErrorHandler(message: string, reject: (error: Error) => void) {
  return (event: Event) => {
    let error: Error | undefined;

    if (event.target && 'error' in event.target && event.target.error instanceof Error) {
      error = event.target.error;
    }

    ToastManager.add({
      title: message,
      description: error?.message,
    });

    reject(new Error(message, { cause: error }));
  };
}

export function openEpisodesDb() {
  return new Promise((resolve: (db: IDBDatabase) => void, reject: (error: Error) => void) => {
    const idbRequest = window.indexedDB.open(DB_NAME, 1);

    idbRequest.addEventListener('success', () => {
      const db = idbRequest.result;

      resolve(db);

      db.addEventListener('error', createErrorHandler(`Generic ${DB_NAME} error.`, reject));
    });

    idbRequest.addEventListener('upgradeneeded', () => {
      const db = idbRequest.result;
      const episodesStore = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });

      episodesStore.createIndex('title', 'title');
      episodesStore.createIndex('podcastName', 'podcastName');

      episodesStore.transaction.addEventListener('complete', () => {
        console.info('Episode store setup complete.');
      });
    });

    idbRequest.addEventListener(
      'error',
      createErrorHandler('IndexedDB request to open db failed.', reject),
    );
  });
}

export function upsertEpisodeToDb(db: IDBDatabase, episode: LocalEpisode) {
  return new Promise((resolve: (value: undefined) => void, reject: (error: Error) => void) => {
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const episodesStore = transaction.objectStore(OBJECT_STORE_NAME);
    const addRequest = episodesStore.put(episode);

    addRequest.addEventListener('success', () => {
      resolve(undefined);
    });

    addRequest.addEventListener(
      'error',
      createErrorHandler('Episode cannot be saved locally.', reject),
    );
  });
}

export function getSavedEpisodesFromDb(db: IDBDatabase) {
  return new Promise((resolve: (value: LocalEpisode[]) => void, reject: (error: Error) => void) => {
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const episodesStore = transaction.objectStore(OBJECT_STORE_NAME);
    const getAllRequest = episodesStore.getAll();

    getAllRequest.addEventListener('success', (event) => {
      if (event.target && 'result' in event.target) {
        resolve(event.target?.result as LocalEpisode[]);
      }
    });

    getAllRequest.addEventListener(
      'error',
      createErrorHandler('Unable to get episodes from db.', reject),
    );
  });
}

export function getLocalEpisodeFromDb(db: IDBDatabase, episodeId: string) {
  return new Promise(
    (resolve: (value: LocalEpisode | null) => void, reject: (error: Error) => void) => {
      const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
      const episodesStore = transaction.objectStore(OBJECT_STORE_NAME);
      const getOneRequest = episodesStore.get(episodeId);

      getOneRequest.addEventListener('success', (event) => {
        if (event.target && 'result' in event.target) {
          resolve(event.target?.result ? (event.target?.result as LocalEpisode) : null);
        }
      });

      getOneRequest.addEventListener(
        'error',
        createErrorHandler('Unable to get episode from db.', reject),
      );
    },
  );
}

export function deleteLocalEpisodeFromDb(db: IDBDatabase, episodeId: string) {
  return new Promise((resolve: (value: undefined) => void, reject: (error: Error) => void) => {
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const episodesStore = transaction.objectStore(OBJECT_STORE_NAME);
    const deleteRequest = episodesStore.delete(episodeId);

    deleteRequest.addEventListener('success', (event) => {
      if (event.target && 'result' in event.target) {
        resolve(undefined);
      }
    });

    deleteRequest.addEventListener(
      'error',
      createErrorHandler('Unable to delete episode from db.', reject),
    );
  });
}
