import clsx from 'clsx';
import { Link } from 'react-router';

import type { Podcast } from '../../types';
import { Image } from '../Image/Image';
import { Skeleton } from '../Skeleton/Skeleton';

import styles from './PodcastCard.module.css';

type Props = Pick<Podcast, 'id' | 'name' | 'thumbnailUrl'>;

export function PodcastCard({ id, name, thumbnailUrl }: Props) {
  return (
    <li className={styles.podcastCard}>
      <Link to={`/podcast/${id}`} className={styles.link}>
        {thumbnailUrl ? (
          <Image className={styles.image} src={thumbnailUrl} width={256} height={256} alt={name} />
        ) : (
          <span className="line-clamp-4">{name}</span>
        )}
      </Link>
    </li>
  );
}

export function PodcastCardSkeleton() {
  return (
    <li className={clsx(styles.podcastCard, styles.skeletonWrapper)}>
      <Skeleton className={styles.skeleton} />
    </li>
  );
}
