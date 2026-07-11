import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import type { variantOptions } from './consts';

export type ButtonProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'title'
> & {
  isDisabled?: boolean;
  isLoading?: boolean;
  size?: 'small' | 'medium';
  variant?: (typeof variantOptions)[number] | undefined;
} & (
    | {
        label: string;
        icon?: ReactNode;
        isRound?: false;
      }
    | {
        label?: string;
        icon: ReactNode;
        isRound?: boolean;
      }
  );

export type ButtonLinkProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'title' | 'download'
> & {
  size?: 'small' | 'medium';
  variant?: (typeof variantOptions)[number] | undefined;
} & (
    | {
        label: string;
        icon?: ReactNode;
        isRound?: false;
      }
    | {
        label?: string;
        icon: ReactNode;
        isRound?: boolean;
      }
  );
