import { type ChangeEvent, type FocusEvent, type HTMLAttributes, type Ref, useId } from 'react';

import { Text } from '../Text/Text';

import styles from './Input.module.css';

type Props = Pick<HTMLAttributes<HTMLInputElement>, 'autoFocus'> & {
  label: string;
  placeholder?: string;
  type: 'email' | 'password' | 'search' | 'tel' | 'text' | 'url' | 'number';
  value: string | number | null;
  ref: Ref<HTMLInputElement>;
  disabled?: boolean;
  name?: string | undefined;
  error?: string | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export function Input({
  label,
  placeholder,
  type = 'text',
  value,
  name,
  disabled,
  autoFocus = false,
  error,
  onChange,
  onBlur,
}: Props) {
  const id = useId();

  return (
    <div className={styles.inputControl}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        className={styles.input}
        onChange={onChange}
        onBlur={onBlur}
        value={value || ''}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {error && <Text variant="error">{error}</Text>}
    </div>
  );
}
