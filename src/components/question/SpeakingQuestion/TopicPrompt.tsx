/** Section2 - 읽고 설명하기 문제 섹션 */
export function TopicPrompt({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <div className="flex w-[500px] flex-col gap-4 rounded-xl bg-white px-8 py-7 text-left mt-[8.75vw]">
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
