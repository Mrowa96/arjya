import { RiLoader4Line } from '@remixicon/react';
import clsx from 'clsx';

import styles from './Loader.module.css';

type Props = {
  size?: number;
  withWrapper?: boolean;
  wrapperSize?: 'small' | 'medium' | 'large';
};

type InternalProps = {
  size: number;
};

function InternalLoader({ size }: InternalProps) {
  return <RiLoader4Line className={styles.loader} size={size} aria-label="Loading..." />;
}

export function Loader({ size = 24, withWrapper = false, wrapperSize = 'small' }: Props) {
  if (withWrapper) {
    return (
      <div className={clsx(styles.wrapper, styles[wrapperSize])}>
        <InternalLoader size={size} />
      </div>
    );
  }

  return <InternalLoader size={size} />;
}
