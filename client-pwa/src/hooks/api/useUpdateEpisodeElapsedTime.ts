import { useMutation } from '@tanstack/react-query';

import { useLocalEpisodes } from '../../features/localEpisodes/LocalEpisodesProvider';
import { useInvalidateAllStoredEpisodesGroupedByPodcasts } from '../../features/localEpisodes/hooks/useAllStoredEpisodesGroupedByPodcasts';
import { ApiError, getApiClient } from '../../utils/api';
import { useInvalidatePodcastDetail } from './usePodcastDetail';
import { useSetPodcastEpisodeDetailQueryData } from './usePodcastEpisodeDetail';

type MutationData = {
  podcastId: string;
  episodeId: string;
  elapsedTime: number;
};

export function useUpdateEpisodeElapsedTime() {
  const invalidatePodcastDetail = useInvalidatePodcastDetail();
  const setPodcastEpisodeDetailQueryData = useSetPodcastEpisodeDetailQueryData();
  const invalidateAllStoredEpisodesGroupedByPodcasts =
    useInvalidateAllStoredEpisodesGroupedByPodcasts();
  const { getStoredEpisode, updateStoredEpisode } = useLocalEpisodes();

  return useMutation({
    mutationFn: async ({ podcastId, episodeId, elapsedTime }: MutationData) => {
      try {
        const response = await getApiClient().podcast.episodeElapsedStreamTimeUpdate(
          podcastId,
          episodeId,
          {
            time: elapsedTime,
          },
        );

        return response.data;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
    async onSuccess(data, { podcastId, episodeId }) {
      await invalidatePodcastDetail(podcastId);
      setPodcastEpisodeDetailQueryData(podcastId, episodeId, data);

      const localEpisode = await getStoredEpisode(episodeId);

      if (localEpisode) {
        if (localEpisode.lastPlayedAt !== data.lastPlayedAt) {
          await updateStoredEpisode({
            ...data,
            type: 'cloud',
          });
        }
      }

      await invalidateAllStoredEpisodesGroupedByPodcasts();
    },
  });
}
