import { useCallback } from 'react';

import { RiForward10Line, RiReplay10Line } from '@remixicon/react';

import { useAudioPlayerActions, useAudioPlayerData } from '../../features/audioPlayer/AudioPlayer';
import { Button } from '../Button/Button';
import { PlaybackButton } from '../PlaybackButton/PlaybackButton';

import styles from './PlaybackControl.module.css';

export function PlaybackControl() {
  const { isPlaying, isLoading, isFailed, source } = useAudioPlayerData();
  const { play, seek } = useAudioPlayerActions();

  const showSeekButtons = !!source && !isFailed && !isLoading;

  const seekBackward = useCallback(() => {
    seek(-10);
  }, [seek]);

  const seekForward = useCallback(() => {
    seek(10);
  }, [seek]);

  return (
    <div className={styles.playbackControl}>
      {showSeekButtons && (
        <Button icon={<RiReplay10Line size={18} />} size="small" onClick={seekBackward} isRound />
      )}

      <PlaybackButton isPlaying={isPlaying} isLoading={isLoading} isFailed={isFailed} play={play} />

      {showSeekButtons && (
        <Button icon={<RiForward10Line size={18} />} size="small" onClick={seekForward} isRound />
      )}
    </div>
  );
}
