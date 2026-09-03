// contentType은 upload-url 발급 때 백엔드에 선언한 값과 반드시 같아야 한다 — file.type을
// 그대로 쓰면 MediaRecorder가 붙이는 "audio/webm;codecs=opus" 같은 접미사가 실려서
// Supabase가 415(invalid_mime_type)로 거부한다(호출부가 접미사를 뗀 값을 upload-url엔
// 넘기고 여기선 file.type을 다시 썼던 게 원인). 항상 그 값을 그대로 넘겨받아 쓴다.
export async function uploadToSignedUrl(
  signedUrl: string,
  file: Blob,
  contentType: string,
) {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!response.ok) {
    const error = new Error(`파일 업로드 실패 (${response.status})`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
}
