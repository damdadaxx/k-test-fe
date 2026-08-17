'use client';

import { useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

import { usePopoverDismiss } from '@/hooks/ui/usePopoverDismiss';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

function parseValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
}

function toValue(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const parsed = parseValue(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  usePopoverDismiss(rootRef, isOpen, () => setIsOpen(false));

  const handleToggle = () => {
    if (!isOpen && parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectDay = (day: number) => {
    onChange(toValue(viewYear, viewMonth, day));
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        onClick={handleToggle}
        className="flex h-11.5 w-full cursor-pointer items-center justify-between rounded-8 border border-neutral-30 bg-white p-(--space-16) text-sm"
      >
        <span className={value ? 'text-icon-90' : 'text-icon-30'}>
          {value || placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <rect
            x="1.5"
            y="2.5"
            width="13"
            height="12"
            rx="1.5"
            stroke="#909090"
            strokeWidth="1.2"
          />
          <path d="M1.5 6H14.5" stroke="#909090" strokeWidth="1.2" />
          <path
            d="M4.5 1V3.5"
            stroke="#909090"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M11.5 1V3.5"
            stroke="#909090"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] right-0 z-20 w-72 rounded-8 bg-white p-4 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">
          <div className="mb-3 flex gap-2">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="flex-1 rounded-8 border border-neutral-30 p-1 text-sm text-icon-90"
            >
              {MONTH_NAMES.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="rounded-8 border border-neutral-30 p-1 text-sm text-icon-90"
            >
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-icon-30">
            {WEEKDAYS.map((weekday, index) => (
              <span key={index}>{weekday}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {leadingBlanks.map((blank) => (
              <span key={`blank-${blank}`} />
            ))}
            {days.map((day) => {
              const isSelected =
                parsed?.year === viewYear &&
                parsed?.month === viewMonth &&
                parsed?.day === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'mx-auto flex size-8 items-center justify-center rounded-full text-sm',
                    isSelected
                      ? 'bg-icon-90 text-white'
                      : 'text-icon-90 hover:bg-neutral-20',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
