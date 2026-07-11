import { type PropsWithChildren, useCallback } from 'react';

import { Toast } from '@base-ui/react/toast';
import { RiCloseLine } from '@remixicon/react';
import clsx from 'clsx';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

import styles from './Toast.module.css';

export const ToastManager = Toast.createToastManager();

function ToastList() {
  const { toasts, close } = Toast.useToastManager();

  const closeToastButtonClickHandler = useCallback(
    (toastId: string) => {
      close(toastId);
    },
    [close],
  );

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={clsx(styles.toast, toast.type && styles[toast.type])}
    >
      <Toast.Content className={styles.content}>
        <Text className={styles.message}>{toast.title}</Text>

        <Button
          icon={<RiCloseLine />}
          onClick={() => closeToastButtonClickHandler(toast.id)}
          variant={toast.type === 'info' ? 'primary' : 'ghost'}
          size="small"
          isRound
        />
      </Toast.Content>
    </Toast.Root>
  ));
}

export function ToastsProvider({ children }: PropsWithChildren) {
  return (
    <Toast.Provider toastManager={ToastManager}>
      {children}

      <Toast.Portal>
        <Toast.Viewport className={styles.viewport}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

type AddToastOptions = {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export function useToast() {
  const { add } = Toast.useToastManager();

  const addToast = useCallback(
    ({ id, message, type }: AddToastOptions) => {
      return add({
        id,
        title: message,
        type,
        timeout: type === 'error' ? 0 : 5000,
      });
    },
    [add],
  );

  return {
    addToast,
  };
}
