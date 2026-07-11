import { Suspense, lazy, useState } from 'react';

import { RiAddLine, RiDatabase2Line, RiSettings2Line } from '@remixicon/react';
import { Link } from 'react-router';

import { usePodcastList } from '../../hooks/api/usePodcastList';
import { PageLayout } from '../../layouts/PageLayout/PageLayout';
import { PodcastCard, PodcastCardSkeleton } from '../../ui/PodcastCard/PodcastCard';

import styles from './HomePage.module.css';

const AddPodcastDialog = lazy(() => import('./components/AddPodcastDialog/AddPodcastDialog'));

export default function HomePage() {
  const { data: podcasts, isLoading: arePodcastsLoading } = usePodcastList();
  const [isAddPodcastDialogVisible, setIsAddPodcastDialogVisible] = useState(false);

  return (
    <PageLayout
      title="Podcasts"
      actions={[
        {
          key: 'offline-episodes-link',
          Element: (
            <Link to="/offline-episodes" title="Offline episodes" className={styles.headerLink}>
              <RiDatabase2Line aria-hidden />
            </Link>
          ),
        },
        {
          key: 'settings-link',
          Element: (
            <Link to="/settings" title="Settings" className={styles.headerLink}>
              <RiSettings2Line aria-hidden />
            </Link>
          ),
        },
      ]}
    >
      <ul className={styles.podcasts}>
        {arePodcastsLoading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((index) => <PodcastCardSkeleton key={index} />)
        ) : (
          <>
            <button
              type="button"
              className={styles.addPodcastDialogTrigger}
              onClick={() => {
                setIsAddPodcastDialogVisible(true);
              }}
            >
              <RiAddLine size={32} />
              <span>Add podcast</span>
            </button>
            {podcasts?.items.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                id={podcast.id}
                name={podcast.name}
                thumbnailUrl={podcast.thumbnailUrl}
              />
            ))}

            <Suspense>
              <AddPodcastDialog
                isOpen={isAddPodcastDialogVisible}
                setIsOpen={setIsAddPodcastDialogVisible}
              />
            </Suspense>
          </>
        )}
      </ul>
    </PageLayout>
  );
}
