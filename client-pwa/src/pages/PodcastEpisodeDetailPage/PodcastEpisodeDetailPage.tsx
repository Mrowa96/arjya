import { useCallback } from 'react';

import { RiEyeCloseLine, RiEyeLine, RiInstallLine, RiUninstallLine } from '@remixicon/react';
import { useParams } from 'react-router';

import { useLocalEpisodes } from '../../features/localEpisodes/LocalEpisodesProvider';
import { usePodcastEpisodeDetail } from '../../hooks/api/usePodcastEpisodeDetail';
import { useUpdateEpisodeElapsedTime } from '../../hooks/api/useUpdateEpisodeElapsedTime';
import { PageLayout } from '../../layouts/PageLayout/PageLayout';
import { Button } from '../../ui/Button/Button';
import { Image } from '../../ui/Image/Image';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { Text } from '../../ui/Text/Text';
import { tryCatch } from '../../utils/tryCatch';

import styles from './PodcastEpisodeDetailPage.module.css';

export default function PodcastEpisodeDetailPage() {
  const params = useParams();

  if (!params.podcastId) {
    throw new Error(`podcastId param is required!`);
  }

  if (!params.episodeId) {
    throw new Error(`episodeId param is required!`);
  }

  const {
    data: episode,
    isLoading: isEpisodeLoading,
    error: episodeError,
  } = usePodcastEpisodeDetail(params.podcastId, params.episodeId);
  const { mutateAsync: updateEpisodeElapsedTime } = useUpdateEpisodeElapsedTime();
  const { storeEpisode, deleteStoredEpisode, isEpisodeStorePending } = useLocalEpisodes();

  const toggleEpisodeStreamCompletion = useCallback(async () => {
    if (!episode) {
      return;
    }

    const [, error] = await tryCatch(() => {
      let elapsedTime = 0;

      if (!episode.isStreamCompleted) {
        elapsedTime = episode.source.duration;
      }

      return updateEpisodeElapsedTime({
        podcastId: episode.podcast.id,
        episodeId: episode.id,
        elapsedTime,
      });
    });

    if (error) {
      console.error('Unable to update episode stream completion.', error);
    }
  }, [episode, updateEpisodeElapsedTime]);

  const toggleEpisodeLocalAvailabilityClickHandler = useCallback(async () => {
    if (!episode) {
      return;
    }

    if (episode.type === 'local') {
      await deleteStoredEpisode(episode.id, episode.podcast.id);
    } else {
      await storeEpisode(episode);
    }
  }, [episode, storeEpisode, deleteStoredEpisode]);

  if (isEpisodeLoading) {
    return (
      <PageLayout title="">
        <div className={styles.content}>
          <div className={styles.details}>
            <Skeleton className={styles.imageSkeleton} />
            <Skeleton className={styles.descriptionSkeleton} />
          </div>
        </div>
      </PageLayout>
    );
  }

  // TODO Handle more errors
  if (episodeError?.code === 404) {
    return (
      <PageLayout title="Episode not found">
        <Text variant="error">Episode with given id: "{params.episodeId}" cannot be found.</Text>
      </PageLayout>
    );
  }

  if (!episode) {
    return null;
  }

  return (
    <PageLayout
      title={episode.title}
      subtitle={episode.podcast.name}
      actions={[
        {
          key: 'toggle-episode-stream-completion',
          Element: (
            <Button
              icon={
                episode.isStreamCompleted ? <RiEyeLine size={18} /> : <RiEyeCloseLine size={18} />
              }
              onClick={toggleEpisodeStreamCompletion}
              title={
                episode.isStreamCompleted
                  ? 'Mark episode stream as incomplete'
                  : 'Mark episode stream as complete'
              }
              size="small"
              isRound
            />
          ),
        },
        {
          key: 'toggle-episode-local-availability',
          Element: (
            <Button
              icon={
                episode.type === 'local' ? (
                  <RiUninstallLine size={18} />
                ) : (
                  <RiInstallLine size={18} />
                )
              }
              title={episode.type === 'local' ? 'Delete from storage' : 'Make available offline'}
              size="small"
              variant={episode.type === 'local' ? 'danger' : 'primary'}
              onClick={toggleEpisodeLocalAvailabilityClickHandler}
              isLoading={isEpisodeStorePending(episode.id)}
              isRound
            />
          ),
        },
      ]}
    >
      <div className={styles.details}>
        {!!episode.thumbnailUrl && (
          <Image
            className={styles.image}
            src={episode.thumbnailUrl}
            alt={episode.title}
            width={500}
            height={500}
          />
        )}
        <div className={styles.content}>
          {episode.description && (
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: episode.description }}
            />
          )}

          <Text className={styles.publishedAt} isBolder>
            Published at <time>{new Date(episode.publishedAt).toLocaleString('pl-pl')}</time>
          </Text>
        </div>
      </div>
    </PageLayout>
  );
}
