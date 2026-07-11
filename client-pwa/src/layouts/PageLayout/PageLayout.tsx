import type { ReactNode } from 'react';

import { Container } from '../../ui/Container/Container';
import { Header, type HeaderProps } from './components/Header/Header';

import styles from './PageLayout.module.css';

type Props = Pick<HeaderProps, 'title' | 'subtitle' | 'actions' | 'enableBackButton'> & {
  centerContent?: boolean;
  children: ReactNode;
};

export function PageLayout({
  title,
  subtitle,
  enableBackButton = true,
  actions = [],
  centerContent = false,
  children,
}: Props) {
  return (
    <>
      <title>{title ? `Arjya PWA: ${title}` : 'Arjya PWA'}</title>

      <Header
        title={title}
        subtitle={subtitle}
        actions={actions}
        enableBackButton={enableBackButton}
      />
      <Container className={styles.pageLayout} center={centerContent} strech>
        {children}
      </Container>
    </>
  );
}
