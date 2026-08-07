'use client';

import { clsx } from 'clsx';

interface WritingPanelProps {
  stepNumber: number;
  title: string;
  prompt: string;
  active: boolean;
  submitted: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function WritingPanel({
  stepNumber,
  title,
  prompt,
  active,
  submitted,
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: WritingPanelProps) {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-30 bg-white">
      <div className="flex items-center gap-2 border-b border-neutral-30 px-4 py-3">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {stepNumber}
        </span>
        <span className="text-body-sm font-semibold text-primary">{title}</span>
      </div>

      {active && (
        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="text-body-sm text-icon-50">{prompt}</p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={submitted}
            placeholder="답변을 입력하세요"
            className={clsx(
              'h-40 flex-1 resize-none rounded-md border border-neutral-30 p-3 text-body-sm text-primary outline-none focus:border-primary',
              submitted && 'bg-neutral-20',
            )}
          />
          {!submitted && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onSubmit}
                disabled={!value.trim() || isSubmitting}
                className={clsx(
                  'rounded-md px-4 py-2 text-body-sm font-semibold transition-colors',
                  value.trim()
                    ? 'bg-primary text-white hover:bg-icon-90'
                    : 'cursor-not-allowed bg-neutral-20 text-icon-30',
                )}
              >
                제출
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
