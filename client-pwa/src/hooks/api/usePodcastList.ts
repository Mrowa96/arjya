import { useCallback } from 'react';

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiClient } from '../../utils/api';

const queryKey = ['podcast'];

export function usePodcastList() {
  return useQuery(
    queryOptions({
      queryKey,
      queryFn: async () => {
        const response = await getApiClient().podcast.podcastList({});

        return response.data;
      },
    }),
  );
}

export function useInvalidatePodcastList() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey,
    });
  }, [queryClient]);
}
