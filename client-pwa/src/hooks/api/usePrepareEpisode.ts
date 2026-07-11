import { useMutation } from '@tanstack/react-query';

import { ApiError, getApiClient } from '../../utils/api';

type Data = {
  podcastId: string;
  episodeId: string;
};

export function usePrepareEpisode() {
  return useMutation({
    mutationFn: async (data: Data) => {
      try {
        const response = await getApiClient().podcast.episodePrepareCreate(
          data.podcastId,
          data.episodeId,
        );

        return response.data;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
  });
}
