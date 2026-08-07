import { CountdownTimer } from './CountdownTimer';
import { EndExamButton } from './EndExamButton';
import { WebcamMonitor } from './WebcamMonitor';

export function Header({ onEndExam }: { onEndExam: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
      <CountdownTimer />
      <div className="flex items-center gap-4">
        <EndExamButton onConfirm={onEndExam} />
        <WebcamMonitor />
      </div>
    </header>
  );
}
