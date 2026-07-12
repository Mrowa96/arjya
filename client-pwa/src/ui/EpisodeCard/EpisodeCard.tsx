import { memo } from 'react';

import { RiCloudOffLine, RiDownloadCloudLine } from '@remixicon/react';
import clsx from 'clsx';
import { Link } from 'react-router';

import { usePlayEpisode } from '../../hooks/usePlayEpisode';
import type { CloudEpisode, LocalEpisode } from '../../types';
import { toTimeLabel } from '../../utils/time';
import { PlaybackButton } from '../PlaybackButton/PlaybackButton';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Skeleton } from '../Skeleton/Skeleton';
import { Text } from '../Text/Text';

import styles from './EpisodeCard.module.css';

type Props = {
  episode: CloudEpisode | LocalEpisode;
  isPlaying: boolean;
  isLoading: boolean;
  isFailed: boolean;
  realTimeProgress?: number | undefined;
  enableTitleLink?: boolean;
};

export function EpisodeCardSkeleton() {
  return (
    <li className={styles.episodeCardSkeletonWrapper}>
      <Skeleton className={styles.episodeCardSkeleton} />
    </li>
  );
}

function UnmemoizedEpisodeCard({
  episode,
  isPlaying,
  isLoading,
  isFailed,
  realTimeProgress,
  enableTitleLink = true,
}: Props) {
  const { playHandler, playStatus } = usePlayEpisode({ episode });

  const isPlaybackButtonLoading = isLoading || playStatus === 'pending';
  const isPlaybackButtonFailed = isFailed || playStatus === 'error';

  return (
    <li
      className={clsx(
        styles.episodeCard,
        episode.type === 'local' && styles.localEpisode,
        episode.isStreamCompleted && styles.isStreamCompleted,
      )}
    >
      <div className={styles.playbackButtonWrapper}>
        <PlaybackButton
          isPlaying={isPlaying}
          isLoading={isPlaybackButtonLoading}
          isFailed={isPlaybackButtonFailed}
          play={playHandler}
        />
        {episode.type === 'local' ? (
          <span className={styles.isLocalIcon} title="Episode available offline">
            <RiCloudOffLine size={10} />
          </span>
        ) : episode.isDownloaded ? (
          <span className={styles.isDownloadedIcon} title="Episode downloaded on server">
            <RiDownloadCloudLine size={12} />
          </span>
        ) : null}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          {enableTitleLink ? (
            <Link
              to={`/podcast/${episode.podcast.id}/episode/${episode.id}`}
              className={styles.titleLink}
            >
              {episode.title}
            </Link>
          ) : (
            episode.title
          )}
        </div>

        <div className={styles.details}>
          <Text variant="caption">{toTimeLabel(episode.source.duration)} </Text>

          <div className={styles.playbackProgress}>
            {!!(typeof realTimeProgress !== 'undefined' || episode.elapsedStreamTime) && (
              <ProgressBar
                value={
                  typeof realTimeProgress !== 'undefined'
                    ? realTimeProgress
                    : episode.streamProgress
                }
              />
            )}
          </div>

          <Text variant="caption" className={styles.publishedAt}>
            {new Date(episode.publishedAt).toLocaleDateString('pl-PL')}
          </Text>
        </div>
      </div>
    </li>
  );
}

export const EpisodeCard = memo(UnmemoizedEpisodeCard);
