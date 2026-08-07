import { CountdownTimer } from './CountdownTimer';
import { WebcamMonitor } from './WebcamMonitor';

export function ExamSessionHeader() {
  return (
    <header className="flex justify-center bg-white py-[16px] px-[20px]">
      <div className="flex items-center justify-between w-full max-w-[1200px]">
        <CountdownTimer />
        <div className="size-[72px] overflow-hidden rounded-[8Px]">
          <WebcamMonitor />
        </div>
      </div>
    </header>
  );
}
