import { useState } from 'react';

import { RiDeleteBinLine, RiRefreshLine } from '@remixicon/react';
import { useParams } from 'react-router';

import { useAudioPlayerData } from '../../features/audioPlayer/AudioPlayer';
import { usePodcastDetail } from '../../hooks/api/usePodcastDetail';
import { useUpdatePodcast } from '../../hooks/api/useUpdatePodcast';
import { PageLayout } from '../../layouts/PageLayout/PageLayout';
import { Button } from '../../ui/Button/Button';
import { EpisodeCard, EpisodeCardSkeleton } from '../../ui/EpisodeCard/EpisodeCard';
import { Image } from '../../ui/Image/Image';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { Text } from '../../ui/Text/Text';
import DeletePodcastDialog from './components/DeletePodcastDialog';

import styles from './PodcastDetailPage.module.css';

export default function PodcastDetailPage() {
  const params = useParams();

  if (!params.podcastId) {
    throw new Error(`podcastId param is required!`);
  }

  const { mutateAsync: updatePodcast, isPending: isUpdatePodcastPending } = useUpdatePodcast();
  const { data: podcast, isLoading: isPodcastLoading, error } = usePodcastDetail(params.podcastId);
  const { source, isPlaying, isLoading, isFailed } = useAudioPlayerData();
  const [isDeletePodcastDialogVisible, setIsDeletePodcastDialogVisible] = useState(false);

  if (isPodcastLoading) {
    return (
      <PageLayout title="">
        <div className={styles.content}>
          <div className={styles.details}>
            <Skeleton className={styles.imageSkeleton} />
            <Skeleton className={styles.descriptionSkeleton} />
          </div>

          <Text variant="heading-2">Episodes</Text>

          <ul className={styles.episodeList}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
              <EpisodeCardSkeleton key={value} />
            ))}
          </ul>
        </div>
      </PageLayout>
    );
  }

  // TODO Handle more errors
  if (error?.code === 404) {
    return (
      <PageLayout title="Podcast not found">
        <Text variant="error">Podcast with given id: "{params.podcastId}" cannot be found.</Text>
      </PageLayout>
    );
  }

  if (!podcast) {
    return null;
  }

  return (
    <>
      <PageLayout
        title={podcast.name}
        actions={[
          {
            key: 'update-podcast',
            Element: (
              <Button
                icon={<RiRefreshLine size={20} />}
                title="Check for updates"
                onClick={async () => {
                  await updatePodcast(params.podcastId!);
                }}
                isLoading={isUpdatePodcastPending}
                size="small"
                isRound
              />
            ),
          },
          {
            key: 'delete-podcast',
            Element: (
              <Button
                icon={<RiDeleteBinLine size={20} />}
                title="Delete podcast"
                variant="danger"
                size="small"
                isRound
                onClick={() => {
                  setIsDeletePodcastDialogVisible(true);
                }}
              />
            ),
          },
        ]}
      >
        <div className={styles.content}>
          <div className={styles.details}>
            {!!podcast.thumbnailUrl && (
              <Image
                className={styles.image}
                src={podcast.thumbnailUrl}
                alt={podcast.name}
                width={500}
                height={500}
              />
            )}
            {podcast.description && (
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: podcast.description }}
              />
            )}
          </div>

          <Text variant="heading-2">Episodes</Text>

          <ul className={styles.episodeList}>
            {podcast.episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                isPlaying={!!source && source.id === episode.id && isPlaying}
                isLoading={!!source && source.id === episode.id && isLoading}
                isFailed={!!source && source.id === episode.id && isFailed}
                realTimeProgress={
                  !!source && source.id === episode.id ? source.progress : undefined
                }
              />
            ))}
          </ul>
        </div>
      </PageLayout>

      <DeletePodcastDialog
        podcastId={params.podcastId}
        podcastName={podcast.name}
        isOpen={isDeletePodcastDialogVisible}
        setIsOpen={setIsDeletePodcastDialogVisible}
      />
    </>
  );
}
