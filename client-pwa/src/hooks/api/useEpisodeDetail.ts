import { useCallback } from 'react';

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { type ApiEpisodeDetailData, ApiError, getApiClient } from '../../utils/api';

function getQueryKey(podcastId: string, episodeId: string) {
  return ['podcast', podcastId, 'episode', episodeId];
}

type Options = {
  podcastId: string;
  episodeId: string;
};

export function useEpisodeDetail({ podcastId, episodeId }: Options) {
  return useQuery<ApiEpisodeDetailData, ApiError, ApiEpisodeDetailData, string[]>(
    queryOptions({
      queryKey: getQueryKey(podcastId, episodeId),
      queryFn: async () => {
        try {
          const response = await getApiClient().podcast.episodeDetail(podcastId, episodeId);

          return response.data;
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
    ({ podcastId, episodeId }: Options) => {
      return queryClient.invalidateQueries({
        queryKey: getQueryKey(podcastId, episodeId),
      });
    },
    [queryClient],
  );
}
