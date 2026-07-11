import { useCallback } from 'react';

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLocalEpisodes } from '../../features/localEpisodes/LocalEpisodesProvider';
import type { CloudEpisode, LocalEpisode } from '../../types';
import { ApiError, type ApiPodcastDetailData, getApiClient } from '../../utils/api';

function getQueryKey(podcastId: string) {
  return ['podcast', podcastId];
}

type AlteredApiPodcastDetailData = Omit<ApiPodcastDetailData, 'episodes'> & {
  episodes: (CloudEpisode | LocalEpisode)[];
};

export function usePodcastDetail(podcastId: string) {
  const { getAllStoredEpisodes } = useLocalEpisodes();

  return useQuery<AlteredApiPodcastDetailData, ApiError, AlteredApiPodcastDetailData, string[]>(
    queryOptions({
      queryKey: [...getQueryKey(podcastId), getAllStoredEpisodes.toString()],
      queryFn: async () => {
        try {
          const response = await getApiClient().podcast.podcastDetail(podcastId);
          const localEpisodes = (await getAllStoredEpisodes()).reduce<Record<string, LocalEpisode>>(
            (result, localEpisode) => {
              return {
                ...result,
                [localEpisode.id]: localEpisode,
              };
            },
            {},
          );

          return {
            ...response.data,
            episodes: response.data.episodes.map((episode) => {
              const localEpisodeBlob = localEpisodes[episode.id]?.blob;
              const localEpisodeThumbnail = localEpisodes[episode.id]?.thumbnail || null;

              if (localEpisodeBlob) {
                return {
                  type: 'local' as const,
                  blob: localEpisodeBlob,
                  thumbnail: localEpisodeThumbnail,
                  ...episode,
                };
              } else {
                return {
                  type: 'cloud' as const,
                  ...episode,
                };
              }
            }),
          };
        } catch (responseWithError) {
          throw ApiError.fromResponse(responseWithError);
        }
      },
      retry: 1,
    }),
  );
}

export function useInvalidatePodcastDetail() {
  const queryClient = useQueryClient();

  return useCallback(
    (podcastId: string) => {
      return queryClient.invalidateQueries({
        queryKey: getQueryKey(podcastId),
      });
    },
    [queryClient],
  );
}
