import type { ReportTask } from '@/types/exam';

import { cn } from '@/lib/utils/cn';

export function TaskFeedbackCard({
  sectionLabel,
  partLabel,
  task,
}: {
  sectionLabel: string;
  partLabel: string;
  task: ReportTask;
}) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-neutral-30 p-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 text-body-sm">
          <span className="text-icon-80">{sectionLabel}</span>
          <span className="font-bold text-primary">{partLabel}</span>
        </div>
      </div>

      {task.skipped ? (
        <div className="w-full rounded-8 bg-neutral-20 p-3">
          <p className="text-body-sm text-icon-50">You skipped this task</p>
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col gap-1.5 rounded-8 bg-neutral-20 p-3">
            <p className="text-body-sm text-icon-50">Test Taker Response</p>
            <p className="text-body-sm text-primary">{task.response}</p>
          </div>
          {task.requiredPoints && (
            <div className="flex w-full flex-col gap-2 text-body-sm">
              <p className="text-icon-40">Required Points</p>
              <div className="flex flex-col gap-1">
                {task.requiredPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={cn(
                        'font-bold',
                        p.met ? 'text-success' : 'text-error',
                      )}
                    >
                      {p.met ? '✓' : '✗'}
                    </span>
                    <span className="text-primary">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
