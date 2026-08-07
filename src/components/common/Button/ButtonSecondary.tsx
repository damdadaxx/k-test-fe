import { ButtonHTMLAttributes, ReactNode } from 'react';

import Link, { LinkProps } from 'next/link';

import { cn } from '@/lib/utils/cn';

type Variant = 'fill' | 'outline';

const variantStyle: Record<Variant, string> = {
  fill: 'w-full gap-(--space-8) rounded-[8px] bg-neutral-90 px-(--space-24) py-(--space-20) text-white disabled:opacity-50',
  outline:
    'h-16 gap-2 rounded-[8px] border border-icon-50 bg-white px-9.5 py-5 text-icon-50 hover:bg-neutral-20 disabled:border-transparent disabled:bg-neutral-30 disabled:text-icon-40 disabled:hover:bg-neutral-30',
};

type CommonProps = {
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };

type AsLink = CommonProps & Omit<LinkProps, 'className'> & { as: 'link' };

type ButtonSecondaryProps = AsButton | AsLink;

export default function ButtonSecondary({
  variant = 'fill',
  icon,
  className,
  children,
  ...props
}: ButtonSecondaryProps) {
  const styles = cn(
    'flex items-center justify-center text-button-lg transition-colors cursor-pointer disabled:cursor-not-allowed',
    variantStyle[variant],
    className,
  );

  if (props.as === 'link') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as, ...linkProps } = props;
    return (
      <Link className={styles} {...linkProps}>
        {icon}
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, ...buttonProps } = props;
  return (
    <button type="button" className={styles} {...buttonProps}>
      {icon}
      {children}
    </button>
  );
}
