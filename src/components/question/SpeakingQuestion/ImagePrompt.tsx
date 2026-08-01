import Image from 'next/image';

export function ImagePrompt({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
      <Image src={imageUrl} alt="문항 이미지" fill className="object-cover" />
    </div>
  );
}
