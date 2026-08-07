import Image from 'next/image';

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
