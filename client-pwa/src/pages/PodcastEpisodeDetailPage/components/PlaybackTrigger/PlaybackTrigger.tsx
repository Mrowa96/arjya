import { useAudioPlayerData } from '../../../../features/audioPlayer/AudioPlayer';
import { usePlayEpisode } from '../../../../hooks/usePlayEpisode';
import type { Episode } from '../../../../types';
import { PlaybackButton } from '../../../../ui/PlaybackButton/PlaybackButton';

import styles from './PlaybackTrigger.module.css';

type Props = {
  episode: Episode;
};

export function PlaybackTrigger({ episode }: Props) {
  const { isPlaying, isLoading, isFailed } = useAudioPlayerData();
  const { playHandler, playStatus } = usePlayEpisode({ episode });

  const isPlaybackButtonLoading = isLoading || playStatus === 'pending';
  const isPlaybackButtonFailed = isFailed || playStatus === 'error';

  return (
    <div className={styles.playbackTrigger}>
      <PlaybackButton
        isPlaying={isPlaying}
        isLoading={isPlaybackButtonLoading}
        isFailed={isPlaybackButtonFailed}
        play={playHandler}
      />
    </div>
  );
}
