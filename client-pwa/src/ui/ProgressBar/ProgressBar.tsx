import clsx from 'clsx';

import styles from './ProgressBar.module.css';

type Props = {
  value: number;
  showAlways?: boolean;
  disabled?: boolean;
};

export function ProgressBar({ value, showAlways = false, disabled = false }: Props) {
  if (!value && !showAlways) {
    return null;
  }

  return (
    <progress
      className={clsx(styles.progressBar, disabled && styles.disabled)}
      max="100"
      value={value}
    />
  );
}
