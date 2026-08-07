export default function ProgressBar({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  const percent = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#e5e7eb]">
      {/* Tailwind는 런타임 % 값을 못 읽어서 style로 직접 준다. */}
      <div
        className="h-3 rounded-full bg-black transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
