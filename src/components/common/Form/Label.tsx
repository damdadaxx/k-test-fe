import { LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type LabelType = 'default' | 'required';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  type?: LabelType;
};

export default function Label({
  type = 'default',
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-1 text-sm font-bold text-primary',
        className,
      )}
      {...props}
    >
      {children}
      {type === 'required' && <span className="text-[#ff5c00]">*</span>}
    </label>
  );
}
