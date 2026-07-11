import { useMutation } from '@tanstack/react-query';

import { ApiError, getApiClient } from '../../utils/api';

type Data = {
  podcastId: string;
  episodeId: string;
};

export function useDownloadPodcastEpisode() {
  return useMutation({
    mutationFn: async (data: Data) => {
      try {
        const response = await getApiClient().podcast.episodeDownloadList(
          data.podcastId,
          data.episodeId,
        );

        return response.blob();
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
  });
}
