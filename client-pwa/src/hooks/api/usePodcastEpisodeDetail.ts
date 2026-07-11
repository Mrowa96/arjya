import { useCallback } from 'react';

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLocalEpisodes } from '../../features/localEpisodes/LocalEpisodesProvider';
import type { CloudEpisode, LocalEpisode } from '../../types';
import { type ApiEpisodeDetailData, ApiError, getApiClient } from '../../utils/api';

type AlteredApiEpisodeDetailData = CloudEpisode | LocalEpisode;

function getQueryKey(podcastId: string, episodeId: string) {
  return ['podcast', podcastId, 'episode', episodeId];
}

export function usePodcastEpisodeDetail(podcastId: string, episodeId: string) {
  const { getStoredEpisode } = useLocalEpisodes();

  return useQuery<AlteredApiEpisodeDetailData, ApiError, AlteredApiEpisodeDetailData, string[]>(
    queryOptions({
      queryKey: [...getQueryKey(podcastId, episodeId), getStoredEpisode.toString()],
      queryFn: async () => {
        try {
          const response = await getApiClient().podcast.episodeDetail(podcastId, episodeId);
          const localEpisode = await getStoredEpisode(episodeId);

          if (localEpisode) {
            return {
              ...response.data,
              type: 'local',
              blob: localEpisode.blob,
              thumbnail: localEpisode.thumbnail,
            };
          }

          return {
            ...response.data,
            type: 'cloud',
          };
        } catch (responseWithError) {
          throw ApiError.fromResponse(responseWithError);
        }
      },
      retry: 1,
    }),
  );
}

export function useInvalidatePodcastEpisodeDetail() {
  const queryClient = useQueryClient();

  return useCallback(
    (podcastId: string, episodeId: string) => {
      return queryClient.invalidateQueries({
        queryKey: getQueryKey(podcastId, episodeId),
      });
    },
    [queryClient],
  );
}

export function useSetPodcastEpisodeDetailQueryData() {
  const queryClient = useQueryClient();

  return useCallback(
    (podcastId: string, episodeId: string, data: ApiEpisodeDetailData) => {
      return queryClient.setQueryData(getQueryKey(podcastId, episodeId), data);
    },
    [queryClient],
  );
}
