import clsx from 'clsx';

import styles from './Skeleton.module.css';

type Props = {
  className: string | undefined;
  withDelay?: boolean;
};

export function Skeleton({ className, withDelay = true }: Props) {
  return <div className={clsx(styles.skeleton, withDelay && styles.withDelay, className)} />;
}
