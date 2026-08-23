'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getMyExams } from '@/lib/api/exam';

// TODO(기획 변경 대기 · 현재 미사용): 이전 기획("제출 즉시 리포트 자동 표시")의 진행바 컴포넌트.
// 리포트 생성이 최대 5분 걸릴 수 있어 finish는 "완료 안내 + 마이페이지 유도"로 방향 변경됨.
// 그 기획으로 되돌아가면 이 컴포넌트를 finish에서 다시 렌더하면 된다(로직 보존용).
//
// 제출은 마지막 답변/스킵에서 이미 자동 finalize됨 → 여기선 "채점 결과 준비"만 기다린다.
// readiness 신호는 GET /mypage의 examResultId(채점 전 null) — 유일한 출처라 /mypage를 폴링.
// 준비되면 진행바를 채우고 리포트 페이지(/report/{examResultId})로 이동.
const POLL_INTERVAL_MS = 2000;
// ponytail: 채점은 최대 5분(재시도 스케줄러)까지 걸릴 수 있으나 화면에 무한 대기시키지 않도록 상한.
// 상한 초과 시 폴링만 멈추고, 안내 문구 + 마이페이지 버튼으로 유도(추후 재접속 시 리포트 노출).
const MAX_WAIT_MS = 60000;

export function ResultProgress({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    // 준비 전까지 90%에 점근(느릴수록 천천히).
    const trickle = setInterval(() => {
      setProgress((p) =>
        p >= 90 ? 90 : Math.min(90, p + (90 - p) * 0.06 + 0.4),
      );
    }, 200);

    const poll = async () => {
      if (cancelled) return;

      try {
        const exams = await getMyExams();
        const item = exams.find((e) => e.examSessionId === sessionId);

        if (item?.examResultId) {
          clearInterval(trickle);
          setProgress(100);
          router.replace(`/report/${item.examResultId}`);
          return;
        }
      } catch {
        // 일시적 실패는 무시하고 재시도.
      }

      if (cancelled) return;

      if (Date.now() - startedAt >= MAX_WAIT_MS) {
        clearInterval(trickle); // 상한 초과 — 폴링 중단(안내 문구/마이페이지 버튼으로 유도).
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    void poll();

    return () => {
      cancelled = true;
      clearInterval(trickle);
    };
  }, [sessionId, router]);

  return (
    <div className="h-2 w-[360px] max-w-full overflow-hidden rounded-full bg-neutral-20">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
