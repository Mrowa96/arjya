import type { ReactNode } from 'react';

import clsx from 'clsx';

import type { asOptions, variantOptions } from './consts';

import styles from './Text.module.css';

type Props = {
  children: ReactNode;
  className?: string | undefined;
  variant?: (typeof variantOptions)[number];
  as?: (typeof asOptions)[number];
  isBolder?: boolean;
  lineClamp?: 1 | 2 | 3 | 4;
};

const variantToTagMap: Record<(typeof variantOptions)[number], (typeof asOptions)[number]> = {
  'heading-1': 'h1',
  'heading-2': 'h2',
  'heading-3': 'h3',
  'heading-4': 'h4',
  'heading-5': 'h5',
  'heading-6': 'h6',
  error: 'span',
  caption: 'p',
  paragraph: 'p',
};

export function Text({
  children,
  className,
  as,
  variant = 'paragraph',
  isBolder = false,
  lineClamp,
}: Props) {
  const Component = as || variantToTagMap[variant];

  return (
    <Component
      className={clsx(
        className,
        styles.text,
        styles[variant],
        !!isBolder && styles.isBolder,
        !!lineClamp && `line-clamp-${lineClamp}`,
      )}
    >
      {children}
    </Component>
  );
}
