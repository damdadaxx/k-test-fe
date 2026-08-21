'use client';

import { use } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { Question, SessionQuestionResponse } from '@/types/exam';

import { getSessionQuestions } from '@/lib/api/exam';
import { getNextSection, getSectionQuestions } from '@/lib/exam/sections';

import { useExamSessionGuard } from '@/hooks/exam/useExamSessionGuard';

import { ExamSessionHeader } from '@/components/common/ExamSessionHeader/ExamSessionHeader';
import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { SpeakingQuestion } from '@/components/question/SpeakingQuestion/SpeakingQuestion';

// 백엔드 imageUrl은 "버킷/경로" 형태의 스토리지 상대 경로라서 프론트에서 Supabase public URL로 변환한다
function toImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`;
}

// 백엔드 문항(part별)을 화면 렌더 모델(Question)로 변환. 시간/지시문/이미지/안전수칙은
// 모두 응답에서 읽는다. (오디오 문항 렌더는 다음 단계에서 처리)
function toQuestion(
  raw: SessionQuestionResponse,
  moduleId: string,
  order: number,
): Question {
  const base = {
    questionId: raw.id,
    moduleId,
    type: 'speaking' as const,
    order,
    situation: '',
    instruction: raw.instruction ?? '',
    guideTexts: raw.guideTexts,
    prepSeconds: raw.preparationSeconds,
    answerSeconds: raw.responseSeconds,
  };

  // 읽고 설명하기 — 안전수칙 카드
  if (raw.part === 'READ_AND_EXPLAIN') {
    return {
      ...base,
      topicTitle: raw.safetyRulesTitle,
      topicBullets: raw.safetyRules,
    };
  }

  // 상황 묘사하기 — 그림 제시
  if (raw.part === 'SITUATION_DESCRIPTION') {
    return { ...base, imageUrl: toImageUrl(raw.imageUrl) };
  }

  // 질문에 대답하기 — 오디오 듣고 답하기
  if (raw.part === 'ANSWER_QUESTION') {
    return { ...base, audioUrl: raw.audioUrl };
  }

  return base;
}

export default function TestingQuestionPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; questionId: string }>;
}) {
  const { id: sessionId, moduleId, questionId } = use(params);
  const router = useRouter();
  useExamSessionGuard(sessionId);

  const { data: rawQuestions } = useQuery({
    queryKey: ['session-questions', sessionId],
    queryFn: () => getSessionQuestions(sessionId),
  });

  const sectionQuestions = rawQuestions
    ? getSectionQuestions(rawQuestions, moduleId)
    : [];
  const currentIndex = sectionQuestions.findIndex((q) => q.id === questionId);
  const rawQuestion = currentIndex >= 0 ? sectionQuestions[currentIndex] : null;
  const nextRawQuestion =
    currentIndex >= 0 ? sectionQuestions[currentIndex + 1] : undefined;

  if (!rawQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">문항을 불러오는 중입니다...</p>
      </div>
    );
  }

  const question = toQuestion(rawQuestion, moduleId, currentIndex + 1);

  const handleNext = () => {
    if (nextRawQuestion) {
      router.push(`/${sessionId}/testing/${moduleId}/${nextRawQuestion.id}`);
      return;
    }

    const nextSection = getNextSection(moduleId);
    if (nextSection) {
      router.push(`/${sessionId}/testing/${nextSection.moduleId}/intro`);
    } else {
      router.push(`/${sessionId}/finish`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col h-full justify-between">
      {/* 시험 페이지 헤더 - 타이머 + 웹캠 */}
      <ExamSessionHeader />

      {/* 문항 섹션 */}
      <SpeakingQuestion
        key={question.questionId}
        sessionId={sessionId}
        question={question}
        onSubmitted={handleNext}
      />

      {/* 건너뛰기는 항상 활성 — 녹음 완료 시엔 onSubmitted가 자동으로 넘긴다. */}
      <NextStepButton onClick={handleNext} label="건너뛰기" />
    </div>
  );
}
