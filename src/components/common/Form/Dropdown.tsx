'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import IcCaretDown from '@/app/assets/icons/icon_caret_down.svg';

import { cn } from '@/lib/utils/cn';

import { usePopoverDismiss } from '@/hooks/ui/usePopoverDismiss';

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  id?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function Dropdown({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  usePopoverDismiss(rootRef, isOpen, () => setIsOpen(false));

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11.5 w-full items-center justify-between rounded-8 border border-neutral-30 bg-white p-(--space-16) text-sm outline-none"
      >
        <span className={selected ? 'text-icon-90' : 'text-icon-30'}>
          {selected ? selected.label : placeholder}
        </span>
        <Image
          src={IcCaretDown}
          alt=""
          width={16}
          height={9}
          className={cn('transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 z-20 max-h-80 w-full overflow-y-auto rounded-8 bg-white py-2 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
            >
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex h-14 w-full items-center px-3 py-2 text-left text-base',
                  option.value === value
                    ? 'bg-icon-90 text-white'
                    : 'text-icon-90 hover:bg-neutral-20',
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
