import Image from 'next/image';

import IcCheckedCircle from '@/app/assets/icons/icon_checked_circle.svg';

export function CheckListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <Image src={IcCheckedCircle} width={48} height={48} alt="" />
      <span className="text-2xl text-black">{children}</span>
    </li>
  );
}
