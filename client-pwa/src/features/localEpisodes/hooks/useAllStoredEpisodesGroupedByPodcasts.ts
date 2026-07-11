import { useCallback } from 'react';

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LocalEpisode } from '../../../types';
import { useLocalEpisodes } from '../LocalEpisodesProvider';

type EpisodesGroupedByPodcastsType = {
  id: string;
  name: string;
  episodes: LocalEpisode[];
}[];

export function useAllStoredEpisodesGroupedByPodcasts() {
  const { getAllStoredEpisodes } = useLocalEpisodes();

  return useQuery(
    queryOptions({
      queryKey: ['episodesGroupedByPodcasts', getAllStoredEpisodes.toString()],
      queryFn: async () => {
        const episodes = await getAllStoredEpisodes();
        const data: EpisodesGroupedByPodcastsType = [];

        for (const episode of episodes) {
          const foundEntry = data.find(({ id }) => id === episode.podcast.id);

          if (!foundEntry) {
            data.push({
              id: episode.podcast.id,
              name: episode.podcast.name,
              episodes: [episode],
            });
          } else {
            foundEntry.episodes.push(episode);
            foundEntry.episodes.sort((a, b) => b.publishedAt - a.publishedAt);
          }
        }

        return data;
      },
    }),
  );
}

export function useInvalidateAllStoredEpisodesGroupedByPodcasts() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries(
      queryOptions({
        queryKey: ['episodesGroupedByPodcasts'],
      }),
    );
  }, [queryClient]);
}
