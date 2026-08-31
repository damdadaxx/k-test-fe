'use client';

import { useState } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils/cn';

import LoadingDisplay from '@/components/common/Display/LoadingDisplay';

type ImagePromptProps = {
  imageUrl: string;
  // Section1(상황 묘사하기): 328x328 고정 정사각형 크롭.
  // Section2(읽고 설명하기): 가로 최대 500px, 세로는 원본 비율 그대로.
  fixedSize?: boolean;
};

/** Section1/2 - 상황 묘사하기·읽고 설명하기 문제 섹션 (제시 이미지). 다운로드 중엔 스피너. */
export function ImagePrompt({ imageUrl, fixedSize = false }: ImagePromptProps) {
  const [loaded, setLoaded] = useState(false);

  if (!imageUrl) return null;

  if (fixedSize) {
    return (
      <div className="relative size-82 overflow-hidden rounded-2xl">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingDisplay fullHeight={false} />
          </div>
        )}
        <Image
          src={imageUrl}
          alt="문항 이미지"
          fill
          sizes="328px"
          className="object-cover"
          onLoad={() => setLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative w-full max-w-125', !loaded && 'min-h-82')}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingDisplay fullHeight={false} />
        </div>
      )}
      <Image
        src={imageUrl}
        alt="문항 이미지"
        width={500}
        height={500}
        sizes="500px"
        className={cn('h-auto w-full rounded-2xl', !loaded && 'invisible')}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
