import { RiBugLine, RiPauseLine, RiPlayLine } from '@remixicon/react';

import { useAudioPlayerActions } from '../../features/audioPlayer/AudioPlayer';
import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';

type Props = {
  isPlaying: boolean;
  isLoading: boolean;
  isFailed: boolean;
  play: () => Promise<void>;
};

export function PlaybackButton({ isPlaying, isLoading, isFailed, play }: Props) {
  const { pause } = useAudioPlayerActions();

  const playbackButtonClickHandler = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <Button
      icon={
        isLoading ? (
          <Loader />
        ) : isFailed ? (
          <RiBugLine />
        ) : isPlaying ? (
          <RiPauseLine />
        ) : (
          <RiPlayLine />
        )
      }
      onClick={playbackButtonClickHandler}
      isDisabled={isLoading}
      isRound
    />
  );
}
