import { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

type Variant = 'fill' | 'line';
type Size = 'sm' | 'md';
type Width = number | `${number}` | 'full';

const variantStyle: Record<Variant, string> = {
  fill: 'bg-primary text-white',
  line: 'border border-primary bg-white text-primary',
};

const sizeStyle: Record<Size, string> = {
  sm: 'h-[48px] text-body-md',
  md: 'h-[50px] text-button-md',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  width?: Width;
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };

type AsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, 'className'> & { as: 'link' };

type ButtonPrimaryProps = AsButton | AsLink;

export default function ButtonPrimary({
  variant = 'fill',
  size = 'md',
  width = 'full',
  className,
  children,
  style,
  ...props
}: ButtonPrimaryProps) {
  const styles = cn(
    'flex items-center justify-center rounded-8 px-(--space-16) py-(--space-16) text-base font-bold cursor-pointer',
    sizeStyle[size],
    variantStyle[variant],
    width === 'full' && 'w-full',
    className,
  );
  // Tailwind는 소스에 없는 문자열로 만든 클래스(w-[${width}px])는 못 읽어서
  // 실제 픽셀 너비는 style로 직접 준다.
  const widthStyle =
    width === 'full' ? style : { width: `${width}px`, ...style };

  if (props.as === 'link') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as, ...linkProps } = props;
    return (
      <Link className={styles} style={widthStyle} {...linkProps}>
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, ...buttonProps } = props;
  return (
    <button
      type="button"
      className={styles}
      style={widthStyle}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
