import type { ReactNode } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { RiCloseLine } from '@remixicon/react';
import clsx from 'clsx';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

import styles from './Dialog.module.css';

type Props = {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  disableCloseButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  setIsOpen: (_value: boolean) => void;
  onOpenChangeComplete?: (isOpen: boolean) => void;
};

export default function Dialog({
  title,
  children,
  isOpen,
  disableCloseButton = false,
  size = 'medium',
  setIsOpen,
  onOpenChangeComplete,
}: Props) {
  return (
    <BaseDialog.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Popup className={clsx(styles.popup, styles[size])}>
          <div className={styles.header}>
            <Text variant="heading-2">{title}</Text>

            {!disableCloseButton && (
              <BaseDialog.Close
                className={styles.closeButton}
                render={<Button icon={<RiCloseLine />} isRound />}
              />
            )}
          </div>

          <div className={styles.content}>{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
