import Image from 'next/image';

import IcCheckedCircle from '@/app/assets/icons/icon_checked_circle.svg';
import IcCheckedCircleGray from '@/app/assets/icons/icon_checked_circle_gray.svg';

export default function TermCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 cursor-pointer"
    >
      {checked ? (
        <Image src={IcCheckedCircle} alt="" width={20} height={20} />
      ) : (
        <Image src={IcCheckedCircleGray} alt="" width={20} height={20} />
      )}
      <span className="text-sm text-icon-90">{label}</span>
    </button>
  );
}
