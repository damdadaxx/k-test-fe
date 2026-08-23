// 비디오 엘리먼트의 현재 프레임을 maxDimension 이하로 축소해 JPEG Blob으로 캡처.
// 웹캠 프레임 전송(WebcamMonitor)·시선 캘리브레이션(/ready) 공용.
// video가 없거나 아직 로드 전(videoWidth=0)이면 null.
export function captureVideoFrame(
  video: HTMLVideoElement | null,
  maxDimension = 640,
  quality = 0.7,
): Promise<Blob | null> {
  if (!video || !video.videoWidth) return Promise.resolve(null);

  const scale = Math.min(
    1,
    maxDimension / Math.max(video.videoWidth, video.videoHeight),
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
}
