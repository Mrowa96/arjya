import { useMutation } from '@tanstack/react-query';

import { ApiError, getApiClient } from '../../utils/api';
import { useInvalidatePodcastList } from './usePodcastList';

export function useAddPodcast() {
  const invalidatePodcastList = useInvalidatePodcastList();

  return useMutation<boolean, ApiError, string>({
    mutationFn: async (rssFeedUrl: string) => {
      try {
        await getApiClient().podcast.podcastCreate({ rssFeedUrl });

        return true;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
    onSuccess() {
      invalidatePodcastList();
    },
  });
}
