import Link from 'next/link';

import { CheckListItem } from './CheckListItem';

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2">
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
          언제 어디서든
          <br />
          한국어 실력을 인증하세요
        </h1>

        <ul className="flex flex-col gap-4">
          <CheckListItem>
            온라인으로 응시하세요. 예약할 필요가 없습니다.
          </CheckListItem>
          <CheckListItem>
            시험 후 48시간 이후 결과를 확인할 수 있습니다.
          </CheckListItem>
        </ul>

        <Link
          href="/signup"
          className="flex h-14 w-full max-w-xs items-center justify-center rounded-lg bg-black text-base font-semibold text-white hover:bg-gray-800"
        >
          테스트
        </Link>
      </div>

      <div
        className="aspect-square w-full rounded-lg bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[length:24px_24px]"
        aria-hidden
      />
    </section>
  );
}
