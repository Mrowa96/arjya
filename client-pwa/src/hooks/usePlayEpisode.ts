import { useCallback, useState } from 'react';

import { useAudioPlayerActions } from '../features/audioPlayer/AudioPlayer';
import type { Episode } from '../types';

type Params = {
  episode: Episode;
};

export function usePlayEpisode({ episode }: Params) {
  const { updateSource } = useAudioPlayerActions();
  const [playStatus, setPlayStatus] = useState<'initial' | 'pending' | 'playing' | 'error'>(
    'initial',
  );

  const playHandler = useCallback(async () => {
    setPlayStatus('pending');

    try {
      if (episode.type === 'local') {
        await updateSource(episode.id, {
          type: 'local',
          episode,
        });
      } else {
        await updateSource(episode.id, {
          type: 'cloud',
          podcastId: episode.podcast.id,
        });
      }

      setPlayStatus('playing');
    } catch (error) {
      console.error(error);

      setPlayStatus('error');
    }
  }, [episode, updateSource]);

  return {
    playStatus,
    playHandler,
  };
}
