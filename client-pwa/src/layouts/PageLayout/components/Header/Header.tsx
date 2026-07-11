import { type ReactNode, useCallback } from 'react';

import { RiArrowLeftSLine } from '@remixicon/react';
import { useLocation, useNavigate } from 'react-router';

import { Button } from '../../../../ui/Button/Button';
import { Container } from '../../../../ui/Container/Container';
import { Text } from '../../../../ui/Text/Text';

import styles from './Header.module.css';

type Props = {
  title: string;
  subtitle?: string | undefined;
  enableBackButton?: boolean;
  actions?: {
    key: string;
    Element: ReactNode;
  }[];
};

export type HeaderProps = Props;

export function Header({ title, subtitle, actions, enableBackButton = true }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const backButtonClickHandler = useCallback(() => {
    if (location.key === 'default' && location.pathname !== '/') {
      navigate('/');
    } else {
      navigate(-1);
    }
  }, [navigate, location]);

  const isBackButtonVisible = enableBackButton && location.pathname !== '/';

  return (
    <Container className={styles.header} hasHorizontalPadding={false} as="header">
      <div className={styles.innerHeader}>
        {isBackButtonVisible && (
          <div className={styles.backButtonWrapper}>
            <Button
              onClick={backButtonClickHandler}
              icon={<RiArrowLeftSLine />}
              size="small"
              title="Go to previous page"
              isRound
            />
          </div>
        )}

        <div className={styles.titles}>
          <Text className={styles.title} variant="heading-4" as="h1" lineClamp={2}>
            {title}
          </Text>

          {!!subtitle && (
            <Text className={styles.subtitle} variant="heading-6" as="p" lineClamp={1}>
              {subtitle}
            </Text>
          )}
        </div>

        {!!actions?.length && (
          <div className={styles.actions}>
            {actions.map(({ key, Element }) => (
              <div key={key} className={styles.action}>
                {Element}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
