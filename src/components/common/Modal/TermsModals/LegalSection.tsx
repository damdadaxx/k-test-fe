export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="w-full text-lg font-bold tracking-tight text-icon-90">
        {title}
      </p>
      {children}
    </div>
  );
}
