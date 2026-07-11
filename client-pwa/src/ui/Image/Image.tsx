import { memo, useState } from 'react';

import { RiImageLine } from '@remixicon/react';
import clsx from 'clsx';

import { Skeleton } from '../Skeleton/Skeleton';

import styles from './Image.module.css';

type Props = {
  src: string | undefined;
  width: number;
  height: number;
  alt: string;
  className?: string | undefined;
};

function UnmemoizedImage({ src, width, height, alt, className }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  const imageLoadHandler = () => {
    setStatus('ready');
  };

  const imageErrorHandler = () => {
    setStatus('failed');
  };

  return (
    <div
      className={clsx(styles.imageWrapper, className)}
      style={{ '--image-width': `${width}px`, '--image-height': `${height}px` }}
    >
      {!src || status === 'failed' ? (
        <div className={styles.emptyImage}>
          <RiImageLine />
        </div>
      ) : (
        <>
          <div className={clsx(styles.imagePlaceholder, status === 'ready' && styles.imageReady)}>
            <Skeleton className={styles.imageSkeleton} withDelay={false} />
          </div>
          <img
            className={styles.image}
            alt={alt}
            width={width}
            height={height}
            src={src}
            loading="lazy"
            decoding="async"
            onLoad={imageLoadHandler}
            onError={imageErrorHandler}
          />
        </>
      )}
    </div>
  );
}

export const Image = memo(UnmemoizedImage);
