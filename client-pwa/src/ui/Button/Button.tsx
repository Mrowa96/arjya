import clsx from 'clsx';

import { Loader } from '../Loader/Loader';
import { variantOptions } from './consts';
import type { ButtonLinkProps, ButtonProps } from './types';

import styles from './Button.module.css';

export const buttonVariantOptions = variantOptions;

export function Button({
  label,
  title,
  icon,
  size = 'medium',
  isRound = false,
  type = 'button',
  variant = 'primary',
  isDisabled = false,
  isLoading = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      title={title}
      className={clsx(styles.button, isRound && styles.isRound, styles[size], styles[variant])}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}

export function ButtonLink({
  href,
  target,
  title,
  label,
  icon,
  variant = 'primary',
  isRound = false,
  size = 'medium',
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      target={target}
      title={title}
      className={clsx(styles.button, isRound && styles.isRound, styles[size], styles[variant])}
    >
      {icon}
      {label}
    </a>
  );
}
