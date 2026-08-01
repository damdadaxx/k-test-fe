'use client';

import { useRef, useState } from 'react';

import { blobToBase64 } from '@/lib/utils/image';

import { Button } from '@/components/ui/Button';

export function IdCardUpload({
  onUpload,
}: {
  onUpload: (base64: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await blobToBase64(file);
    setPreview(base64);
    onUpload(base64);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="신분증 미리보기"
          className="max-h-48 rounded-md border"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500">
          신분증 이미지를 업로드하세요
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button variant="secondary" onClick={() => inputRef.current?.click()}>
        파일 선택
      </Button>
    </div>
  );
}
