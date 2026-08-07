import { InputHTMLAttributes, Ref } from 'react';

import { cn } from '@/lib/utils/cn';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  // not-placeholder-shown:bg-white 로 채움 여부를 판단하므로 placeholder 필수.
  placeholder: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function Input({
  error,
  id,
  className,
  ref,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-11.5 w-full rounded-8 bg-neutral-20 p-(--space-16) text-sm text-icon-90 placeholder-icon-30 outline-none not-placeholder-shown:bg-white border border-neutral-30',
          'autofill:[-webkit-text-fill-color:inherit] autofill:[box-shadow:0_0_0_1000px_white_inset]',
          error && 'border border-error bg-white',
          className,
        )}
        {...props}
      />
      {error && <p className="ml-4 text-body-sm text-error">{error}</p>}
    </div>
  );
}
