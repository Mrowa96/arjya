import { useAudioPlayerData } from '../../features/audioPlayer/AudioPlayer';
import { useAllStoredEpisodesGroupedByPodcasts } from '../../features/localEpisodes/hooks/useAllStoredEpisodesGroupedByPodcasts';
import { useNetworkState } from '../../features/networkState/NetworkStateProvider';
import { PageLayout } from '../../layouts/PageLayout/PageLayout';
import { EpisodeCard } from '../../ui/EpisodeCard/EpisodeCard';
import { Text } from '../../ui/Text/Text';

import styles from './OfflineEpisodesPage.module.css';

export default function OfflineEpisodesPage() {
  const { data } = useAllStoredEpisodesGroupedByPodcasts();
  const { source, isPlaying } = useAudioPlayerData();
  const { isOffline } = useNetworkState();

  return (
    <PageLayout title="Offline episodes" enableBackButton={!isOffline}>
      <div className={styles.content}>
        {data?.length ? (
          data.map((entry) => (
            <div key={entry.id} className={styles.section}>
              <Text variant="heading-3">{entry.name}</Text>

              {entry.episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  isPlaying={!!source && source.id === episode.id && isPlaying}
                  isLoading={false}
                  isFailed={false}
                  realTimeProgress={
                    !!source && source.id === episode.id ? source.progress : undefined
                  }
                  enableTitleLink={!isOffline}
                />
              ))}
            </div>
          ))
        ) : (
          <Text variant="heading-5" as="h2">
            No episodes are available offline yet.
          </Text>
        )}
      </div>
    </PageLayout>
  );
}
