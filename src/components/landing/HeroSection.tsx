import Image from 'next/image';

import img_landing from '@/app/assets/images/img_landing.svg';

import { cn } from '@/lib/utils/cn';

import { TakeTestButton } from './TakeTestButton';

export function HeroSection() {
  return (
    <section
      className={cn(
        'w-full flex justify-center my-[8.75vw]',
        'desktop:my-[126px]',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between mx-auto max-w-6xl px-6',
        )}
      >
        <div
          className={cn(
            'flex flex-col items-end justify-between gap-[120px]',
            'desktop:flex-row',
          )}
        >
          {/* Paragraph Section */}
          <div
            className={cn(
              'flex flex-col gap-[62px] order-2 text-center',
              'desktop:order-1 w-full desktop:text-left',
            )}
          >
            <h1 className="text-4xl font-bold text-[60px] text-black leading-[70px]">
              Certify your Korean proficiency <br />
              anywhere, anytime
            </h1>
            <TakeTestButton />
          </div>

          {/* Image Section */}
          <Image
            src={img_landing}
            width={479}
            height={424}
            alt="landing_image"
            priority
            className={cn(
              'order-1 max-w-[479px] aspect-479/424 w-full m-auto',
              'desktop:order-2 desktop:mr-0',
            )}
          />
        </div>
      </div>
    </section>
  );
}
