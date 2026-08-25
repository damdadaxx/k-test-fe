'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import IcUpload from '@/app/assets/icons/icon_upload.svg';

import { cn } from '@/lib/utils/cn';
import { downscaleImageToLimit } from '@/lib/utils/image';

// ID_CARD 업로드 허용 스펙 (PDF 기획). FACE(웹캠)는 항상 jpeg라 여기 무관.
const ACCEPT = 'image/jpeg,image/png,application/pdf';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB (5242880 bytes) — 업로드 자체 허용 상한(UI 안내용).
// 본인인증 AI 벤더(Azure Document Intelligence)가 실제로 안정적으로 처리하는 크기.
// 백엔드 확인: 1MB는 통과, 2.3MB부터 실패(공식 스펙상 4MB까지 되지만 실제로는 더 낮음) —
// 2026-08-25 실서버 테스트에서 4.5MB 여권 사진이 "본인인증 서비스와 통신에 실패했습니다"로
// 막힌 걸 이걸로 확인함. PDF는 축소 못 하니 그대로 둠(대상은 이미지 파일만).
const AI_UPLOAD_LIMIT = 1 * 1024 * 1024; // 1MB

export function IdCardUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // input change와 drop 양쪽에서 공용으로 쓰는 파일 처리.
  const processFile = async (selected: File) => {
    // 신뢰 경계 검증 — accept로 걸러지지만 드래그드롭/브라우저 편차 대비 이중 확인.
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('JPG, PNG, PDF 형식만 업로드할 수 있습니다.');
      return;
    }

    // 폰 원본처럼 큰 이미지는 AI 벤더가 처리 가능한 크기(1MB)로 축소. PDF는 축소 불가라 그대로 검증.
    let file = selected;
    if (
      selected.type !== 'application/pdf' &&
      selected.size > AI_UPLOAD_LIMIT
    ) {
      file = await downscaleImageToLimit(selected, AI_UPLOAD_LIMIT);
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 5MB 이하만 업로드할 수 있습니다.');
      return;
    }

    setError(null);
    setIsPdf(file.type === 'application/pdf');
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  return (
    <div
      className="flex w-full max-w-[488px] flex-col gap-5 rounded-lg border border-neutral-30 p-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <p className="text-title-sm text-icon-90">1. Upload ID</p>

      {preview && isPdf ? (
        // PDF 업로드 시 노출되는 문구
        <div className="flex h-[226px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-success bg-neutral-20 aspect-424/226 min-w-[424px]">
          <Image src={IcUpload} alt="" width={40} height={40} />
          <p className="text-body-md text-icon-90">PDF uploaded</p>
        </div>
      ) : preview ? ( // 신분증 이미지 업로드 시 미리보기 이미지
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="신분증 미리보기"
          className="h-[226px] w-full rounded-lg border border-success object-cover aspect-424/226 min-w-[424px]"
        />
      ) : (
        // 파일 업로드 안내 문구
        <div
          className={cn(
            'flex flex-col items-center gap-4 rounded-lg border border-dashed bg-neutral-20 p-10 aspect-424/226 min-w-[424px]',
            dragging ? 'border-primary bg-neutral-30' : 'border-icon-30',
          )}
        >
          <Image src={IcUpload} alt="" width={48} height={48} />
          <p className="text-body-md text-icon-70">
            Drag and drop your ID here
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-primary px-6 py-3 text-body-md font-semibold text-primary cursor-pointer"
          >
            Choose File
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
      />

      {/* 에러 문구 / 파일 형식 안내 문구 */}
      {error ? (
        <p className="text-[12px] text-error">{error}</p>
      ) : (
        <p className="text-[12px] text-icon-30">
          Supported formats: JPG, PNG, PDF (1MB)
        </p>
      )}
    </div>
  );
}
