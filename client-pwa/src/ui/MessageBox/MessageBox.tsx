import clsx from 'clsx';

import styles from './MessageBox.module.css';

type Props = {
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
};

export function MessageBox({ message, variant }: Props) {
  return <div className={clsx(styles.messageBox, styles[variant])}>{message}</div>;
}
