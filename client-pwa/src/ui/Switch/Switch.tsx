import { type ChangeEvent, type FocusEvent } from 'react';

import { Text } from '../Text/Text';

import styles from './Switch.module.css';

type Props = {
  label: string;
  value: boolean;
  disabled?: boolean;
  name?: string | undefined;
  error?: string | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export function Switch({
  label,
  value = false,
  disabled = false,
  name,
  error,
  onChange,
  onBlur,
}: Props) {
  return (
    <div className={styles.switchControl}>
      <label className={styles.switchInnerControl}>
        <span>{label}</span>

        <input
          type="checkbox"
          name={name}
          className={styles.nativeSwitch}
          onChange={onChange}
          onBlur={onBlur}
          checked={value}
          disabled={disabled}
        />
        <span className={styles.switch} aria-hidden />
      </label>

      {error && <Text variant="error">{error}</Text>}
    </div>
  );
}
