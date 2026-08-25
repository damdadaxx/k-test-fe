import Image from 'next/image';

import IcCaretRight from '@/app/assets/icons/icon_caret_right.svg';
import IcCheckedCircle from '@/app/assets/icons/icon_checked_circle.svg';
import IcCheckedCircleGray from '@/app/assets/icons/icon_checked_circle_gray.svg';

import { cn } from '@/lib/utils/cn';

export default function TermCheckbox({
  label,
  caption,
  bold = false,
  showChevron = false,
  checked,
  onChange,
  onOpenDetail,
}: {
  label: string;
  caption?: string;
  bold?: boolean;
  showChevron?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onOpenDetail?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-0.5">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => {
            // 체크 전엔 약관을 먼저 보여준다(동의는 모달의 Agree로만). 이미 체크된
            // 상태에서 다시 누르면 모달을 또 띄우지 않고 바로 해제한다.
            if (!checked && onOpenDetail) {
              onOpenDetail();
              return;
            }
            onChange(!checked);
          }}
          className="relative flex flex-1 cursor-pointer items-center gap-2"
        >
          {checked ? (
            <Image src={IcCheckedCircle} alt="" width={20} height={20} />
          ) : (
            <Image src={IcCheckedCircleGray} alt="" width={20} height={20} />
          )}
          <span
            className={cn(
              'text-sm text-icon-90',
              bold ? 'font-bold' : 'font-normal',
            )}
          >
            {label}
          </span>
          {showChevron && (
            <Image
              src={IcCaretRight}
              alt=""
              width={8}
              height={14}
              className="absolute right-0"
            />
          )}
        </button>
      </div>
      {caption && <p className="pl-7 text-sm text-icon-50">{caption}</p>}
    </div>
  );
}
