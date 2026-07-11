import { useMutation } from '@tanstack/react-query';

import { ApiError, getApiClient } from '../../utils/api';
import { useInvalidatePodcastDetail } from './usePodcastDetail';

export function useUpdatePodcast() {
  const invalidatePodcastDetail = useInvalidatePodcastDetail();

  return useMutation({
    mutationFn: async (podcastId: string) => {
      try {
        await getApiClient().podcast.updateCreate(podcastId);

        return true;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
    async onSuccess(_data, podcastId) {
      await invalidatePodcastDetail(podcastId);
    },
  });
}
