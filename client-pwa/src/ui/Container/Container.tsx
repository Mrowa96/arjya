import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import clsx from 'clsx';

import styles from './Container.module.css';

type Props<T extends ElementType> = {
  children: ReactNode;
  as?: T;
  className?: string | undefined;

  /**
   * If set to `true` it will add `flex: 1` to styles.
   *
   * @default false
   */
  strech?: boolean;

  /**
   * If set to `true` it will add flex styles to center content.
   */
  center?: boolean;
  hasHorizontalPadding?: boolean;
  hasVerticalPadding?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

export function Container<T extends ElementType = 'div'>({
  children,
  as,
  className,
  strech = false,
  center = false,
  hasHorizontalPadding = true,
  hasVerticalPadding = false,
}: Props<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={clsx(
        styles.container,
        hasHorizontalPadding && styles.hasHorizontalPadding,
        hasVerticalPadding && styles.hasVerticalPadding,
        strech && styles.strech,
        center && styles.center,
        className,
      )}
    >
      {children}
    </Component>
  );
}
