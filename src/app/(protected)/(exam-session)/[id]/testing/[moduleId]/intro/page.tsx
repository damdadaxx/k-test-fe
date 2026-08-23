'use client';

import { use, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getSessionQuestions } from '@/lib/api/exam';
import {
  getSection,
  getSectionIndex,
  getSectionQuestionRange,
  getSectionQuestions,
} from '@/lib/exam/sections';

import { useExamSessionGuard } from '@/hooks/exam/useExamSessionGuard';

import { useExamStore } from '@/store/examStore';

import { ExamSessionHeader } from '@/components/common/ExamSessionHeader/ExamSessionHeader';
import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { SectionCard } from '@/components/question/SectionCard';

export default function SectionIntroPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id: sessionId, moduleId } = use(params);
  const router = useRouter();
  useExamSessionGuard(sessionId);

  // 섹션 소개 화면에선 "이번 문제 남은 시간"을 0으로 리셋(이전 섹션 잔여값 제거).
  // 실제 문항 시간은 각 문항(SpeakingQuestion) 진입 시 다시 세팅된다.
  const setRemainingSeconds = useExamStore(
    (state) => state.setRemainingSeconds,
  );
  useEffect(() => {
    setRemainingSeconds(0);
  }, [setRemainingSeconds]);

  const { data: rawQuestions } = useQuery({
    queryKey: ['session-questions', sessionId],
    queryFn: () => getSessionQuestions(sessionId),
  });

  const section = getSection(moduleId);
  if (!section) return null;

  const allQuestions = rawQuestions ?? [];
  const range = getSectionQuestionRange(allQuestions, moduleId);
  const questionRange = range ? `${range.start} ~ ${range.end}` : '';

  const sectionQuestions = getSectionQuestions(allQuestions, moduleId);
  const firstQuestion = sectionQuestions[0];

  const handleStart = () => {
    if (!firstQuestion) return;
    router.replace(`/${sessionId}/testing/${moduleId}/${firstQuestion.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-page-bg">
      {/* 시험 남은 시간 + 실시간 웹캠 섹션*/}
      <ExamSessionHeader />

      {/* 시험 메인 섹션 */}
      <main className="flex flex-1 w-full max-w-[1200px] mx-auto px-6 py-6">
        <div className="w-full h-[calc(100vh-48px-208px)]">
          <SectionCard
            sectionIndex={getSectionIndex(moduleId)}
            title={section.title}
            questionRange={questionRange}
            prepSeconds={firstQuestion?.preparationSeconds ?? 0}
            answerSeconds={firstQuestion?.responseSeconds ?? 0}
          />
        </div>
      </main>

      {/* 푸터 버튼 섹션 */}
      <footer>
        <NextStepButton
          onClick={handleStart}
          disabled={!firstQuestion}
          label="다음"
        />
      </footer>
    </div>
  );
}
