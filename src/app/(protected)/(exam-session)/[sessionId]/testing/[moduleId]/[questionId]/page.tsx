'use client';

import { use } from 'react';

import { useRouter } from 'next/navigation';

import type { Question } from '@/types/exam';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { Header } from '@/components/common/Header/Header';
import { QuestionRenderer } from '@/components/question/QuestionRenderer';

export default function TestingQuestionPage({
  params,
}: {
  params: Promise<{ sessionId: string; moduleId: string; questionId: string }>;
}) {
  const { sessionId, moduleId, questionId } = use(params);
  const router = useRouter();

  // TODO: useExamSession/useQuestion 훅으로 문항 데이터 조회
  const question: Question = {
    questionId,
    moduleId,
    type: 'kakao_chat',
    order: 1,
    situation: '',
    instruction: '',
    chatPartnerName: '',
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header onEndExam={() => router.push(`/${sessionId}/finish`)} />
      <div className="flex-1">
        <QuestionRenderer sessionId={sessionId} question={question} />
      </div>
      <NextStepButton onClick={() => {}} />
    </div>
  );
}
