// 이미지가 maxBytes를 넘으면 해상도/품질을 낮춰 그 밑으로 맞춘 File을 돌려준다.
// 이미지가 아니거나(PDF 등) 이미 작으면 원본 그대로 반환.
// ponytail: 8회로도 못 맞추면 원본 반환 — 호출부의 크기 검증이 막는다(사실상 도달 어려움).
export const downscaleImageToLimit = async (
  file: File,
  maxBytes: number,
  maxDimension = 2000,
): Promise<File> => {
  if (!file.type.startsWith('image/') || file.size <= maxBytes) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  let scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  let quality = 0.85;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (blob && blob.size <= maxBytes) {
      bitmap.close();
      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], name, { type: 'image/jpeg' });
    }
    // 품질부터 낮추고, 바닥이면 해상도를 줄인다.
    if (quality > 0.5) quality -= 0.15;
    else scale *= 0.8;
  }

  bitmap.close();
  return file;
};
