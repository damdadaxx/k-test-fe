'use client';

import { use } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getSessionQuestions } from '@/lib/api/exam';
import {
  ANSWER_SECONDS_PER_QUESTION,
  getSection,
  getSectionIndex,
  getSectionQuestions,
} from '@/lib/exam/sections';

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

  const { data: rawQuestions } = useQuery({
    queryKey: ['session-questions', sessionId],
    queryFn: () => getSessionQuestions(sessionId),
  });

  const section = getSection(moduleId);
  if (!section) return null;

  const sectionQuestions = rawQuestions
    ? getSectionQuestions(rawQuestions, moduleId)
    : [];

  const firstQuestion = sectionQuestions[0];

  const handleStart = () => {
    if (!firstQuestion) return;
    router.push(`/${sessionId}/testing/${moduleId}/${firstQuestion.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ExamSessionHeader />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-6">
        <div className="h-[644px] w-[1200px]">
          <SectionCard
            sectionIndex={getSectionIndex(moduleId)}
            title={section.title}
            questionCount={section.questionCount}
            answerSeconds={ANSWER_SECONDS_PER_QUESTION}
          />
        </div>
      </main>

      <NextStepButton
        onClick={handleStart}
        disabled={!firstQuestion}
        label="시작하기"
      />
    </div>
  );
}
