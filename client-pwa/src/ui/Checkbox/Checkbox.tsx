import { type ChangeEvent, type FocusEvent } from 'react';

import { Text } from '../Text/Text';

import styles from './Checkbox.module.css';

type Props = {
  label: string;
  value: boolean;
  disabled?: boolean;
  name?: string | undefined;
  error?: string | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export function Checkbox({
  label,
  value = false,
  disabled = false,
  name,
  error,
  onChange,
  onBlur,
}: Props) {
  return (
    <div className={styles.checkboxControl}>
      <label className={styles.checkboxInnerControl}>
        <input
          type="checkbox"
          name={name}
          className={styles.nativeCheckbox}
          onChange={onChange}
          onBlur={onBlur}
          checked={value}
          disabled={disabled}
        />
        <span className={styles.checkbox} aria-hidden />
        <span>{label}</span>
      </label>

      {error && <Text variant="error">{error}</Text>}
    </div>
  );
}
