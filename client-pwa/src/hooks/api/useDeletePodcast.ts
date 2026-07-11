import { useMutation } from '@tanstack/react-query';
import * as v from 'valibot';

import { useAudioPlayerActions, useAudioPlayerData } from '../../features/audioPlayer/AudioPlayer';
import { ApiError, getApiClient } from '../../utils/api';
import { useInvalidatePodcastDetail } from './usePodcastDetail';
import { useInvalidatePodcastList } from './usePodcastList';

const dataSchema = v.object({
  podcastId: v.pipe(v.string(), v.uuid()),
});

export function useDeletePodcast() {
  const invalidatePodcastDetail = useInvalidatePodcastDetail();
  const invalidatePodcastList = useInvalidatePodcastList();
  const { source } = useAudioPlayerData();
  const { clearSource } = useAudioPlayerActions();

  return useMutation({
    mutationFn: async (podcastId: string) => {
      try {
        await getApiClient().podcast.podcastDelete(podcastId);

        return true;
      } catch (responseWithError) {
        throw ApiError.fromResponse(responseWithError);
      }
    },
    async onSuccess(_data, podcastId) {
      await Promise.all([invalidatePodcastDetail(podcastId), invalidatePodcastList()]);

      if (source) {
        const { podcastId: sourcePodcastId } = v.parse(dataSchema, source.data);

        if (sourcePodcastId === podcastId) {
          clearSource();
        }
      }
    },
  });
}
