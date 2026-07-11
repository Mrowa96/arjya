import { RiBugLine, RiPauseLine, RiPlayLine } from '@remixicon/react';

import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';

type Props = {
  isPlaying: boolean;
  isLoading: boolean;
  isFailed: boolean;
  play: () => Promise<void>;
  pause: () => void;
};

export function PlaybackButton({ isPlaying, isLoading, isFailed, play, pause }: Props) {
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
