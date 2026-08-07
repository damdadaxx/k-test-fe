import ButtonPrimary from '@/components/common/Button/ButtonPrimary';

import { CheckListItem } from './CheckListItem';

export function HeroSection() {
  return (
    <section className="w-full flex justify-center mt-[126px]">
      <div className="flex items-end justify-between gap-[120px] w-full max-w-[1200px]">
        <div className="flex flex-col gap-[62px]">
          <h1 className="text-4xl font-bold text-[60px] text-black leading-[70px]">
            Certify your Korean proficiency <br />
            anywhere, anytime
          </h1>
          <ul className="flex flex-col gap-2">
            <CheckListItem>
              Take the test online. No appointment needed.
            </CheckListItem>
            <CheckListItem>
              Get your results within 48 hours after the test.
            </CheckListItem>
          </ul>
          {/* TODO: href 변경하기 */}
          <ButtonPrimary as="link" href="/2/identity">
            Take Test
          </ButtonPrimary>
        </div>

        <div
          className="max-w-[479px] aspect-479/424 w-full rounded-lg bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[length:24px_24px]"
          aria-hidden
        />
      </div>
    </section>
  );
}
