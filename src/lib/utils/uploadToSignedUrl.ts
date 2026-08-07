export async function uploadToSignedUrl(signedUrl: string, file: Blob) {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`파일 업로드 실패 (${response.status})`);
  }
}
