'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import IcUpload from '@/app/assets/icons/icon_upload.svg';

export function IdCardUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  return (
    <div className="flex w-full max-w-[488px] flex-col gap-5 rounded-lg border border-[#e5e7eb] p-8">
      <p className="text-title-sm text-icon-90">1. Upload ID</p>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="신분증 미리보기"
          className="h-[226px] w-full rounded-lg border border-[#10b981] object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#9ca3af] bg-neutral-20 p-10">
          <Image src={IcUpload} alt="" width={48} height={48} />
          <p className="text-body-md text-[#4b5563]">
            Drag and drop your ID here
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-black px-6 py-3 text-body-md font-semibold text-black"
          >
            Choose File
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <p className="text-[12px] text-[#9ca3af]">
        Supported formats: JPG, PNG, PDF (5MB)
      </p>
    </div>
  );
}
