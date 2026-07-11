import { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import { Link } from 'react-router';

import { useAudioPlayerActions, useAudioPlayerData } from '../../features/audioPlayer/AudioPlayer';
import { debounce } from '../../utils/debounce';
import { Image } from '../Image/Image';
import { PlaybackControl } from '../PlaybackControl/PlaybackControl';
import { Slider } from '../Slider/Slider';
import { Text } from '../Text/Text';

import styles from './MiniPlayer.module.css';

export function MiniPlayer() {
  const { source } = useAudioPlayerData();
  const { setProgress } = useAudioPlayerActions();
  const [internalProgress, setInternalProgress] = useState(source?.progress || 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInternalProgress(0);
  }, [source?.id]);

  const [debouncedSetProgress] = useMemo(
    () =>
      debounce((value: number) => {
        setProgress(value);
      }, 300),
    [setProgress],
  );

  const valueChangeHandler = useCallback(
    async (value: number) => {
      setInternalProgress(value);

      await debouncedSetProgress(value);
    },
    [debouncedSetProgress],
  );

  const thumbnailLink = useMemo(
    () =>
      typeof source?.title === 'object'
        ? source?.title.url
        : typeof source?.subtitle === 'object'
          ? source?.subtitle.url
          : undefined,
    [source?.title, source?.subtitle],
  );

  if (!source) {
    return null;
  }

  return (
    <div
      className={clsx(
        styles.miniPlayer,
        source.isRestoredFromLastPlayedSource && styles.delayAnimation,
      )}
    >
      <div className={styles.details}>
        {!!source.thumbnailUrl && (
          <>
            {thumbnailLink ? (
              <Link to={thumbnailLink} className={styles.thumbnailWrapper}>
                <Image
                  src={source.thumbnailUrl}
                  width={128}
                  height={128}
                  className={styles.thumbnail}
                  alt=""
                />
              </Link>
            ) : (
              <div className={styles.thumbnailWrapper}>
                <Image
                  src={source.thumbnailUrl}
                  width={128}
                  height={128}
                  className={styles.thumbnail}
                  alt=""
                />
              </div>
            )}
          </>
        )}

        <div className={styles.summary}>
          <Text variant="heading-6" as="span" lineClamp={2}>
            {typeof source.title === 'string' ? (
              source.title
            ) : (
              <Link to={source.title.url} className={styles.titleAsLink}>
                {source.title.label}
              </Link>
            )}
          </Text>

          {!!source.subtitle && (
            <Text variant="paragraph" as="span" lineClamp={1}>
              {typeof source.subtitle === 'string' ? (
                source.subtitle
              ) : (
                <Link to={source.subtitle.url} className={styles.subtitleAsLink}>
                  {source.subtitle.label}
                </Link>
              )}
            </Text>
          )}
        </div>
      </div>

      <div className={styles.controlsWrapper}>
        <PlaybackControl />
      </div>

      <Text variant="caption" className={styles.duration}>
        <span>{source.currentTimeText}</span>
        <span className={styles.durationText}> of {source.durationText}</span>
      </Text>

      <div className={styles.progress}>
        <Slider
          value={internalProgress || source?.progress || 0}
          onValueChange={valueChangeHandler}
        />
      </div>
    </div>
  );
}
