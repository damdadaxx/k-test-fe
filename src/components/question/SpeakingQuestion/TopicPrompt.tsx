export function TopicPrompt({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <div className="flex w-[500px] flex-col gap-4 rounded-xl border border-neutral-30 bg-white p-8 text-left">
      <p className="text-title-sm text-icon-90">{title}</p>
      {bullets.length > 0 && (
        <ul className="flex flex-col gap-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="text-body-md text-icon-50">
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
