import Image from 'next/image';

/** Section1 - 상황 묘사하기 문제 섹션 (제시 이미지) */
export function ImagePrompt({ imageUrl }: { imageUrl: string }) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-[328px] h-[328px] overflow-hidden rounded-[16px]">
      <Image
        src={imageUrl}
        alt="문항 이미지"
        fill
        sizes="328px"
        className="object-cover"
      />
    </div>
  );
}
