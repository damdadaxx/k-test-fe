export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="w-full overflow-hidden rounded border border-[#e0e0e0] text-[13px]">
      <div className="flex gap-2 bg-[#f5f5f5] px-2.5 py-2 font-bold">
        {headers.map((header) => (
          <p key={header} className="flex-1">
            {header}
          </p>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row.join('|')}
          className="flex gap-2 border-t border-[#ededed] px-2.5 py-2"
        >
          {row.map((cell, cellIndex) => (
            <p key={cellIndex} className="flex-1">
              {cell}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
