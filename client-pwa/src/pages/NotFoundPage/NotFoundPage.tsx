import { PageLayout } from '../../layouts/PageLayout/PageLayout';
import { Text } from '../../ui/Text/Text';

import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <PageLayout title="Page not found" centerContent>
      <div className={styles.content}>
        <Text variant="heading-4" as="p">
          Oh no, the page your are looking for doesn't exist 😭
        </Text>
      </div>
    </PageLayout>
  );
}
