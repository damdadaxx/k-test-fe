import { ReactNode } from 'react';

import Label from '@/components/common/Form/Label';

export default function FormRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-5 py-3">
      <Label
        htmlFor={htmlFor}
        type="required"
        className="w-25 shrink-0 text-icon-90"
      >
        {label}
      </Label>
      <div className="flex flex-1 items-center gap-2">{children}</div>
    </div>
  );
}
