'use client';

import { use, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { Question, SessionQuestionResponse } from '@/types/exam';

import { getSessionQuestions } from '@/lib/api/exam';
import { getNextSection, getSectionQuestions } from '@/lib/exam/sections';

import { ExamSessionHeader } from '@/components/common/ExamSessionHeader/ExamSessionHeader';
import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { QuestionRenderer } from '@/components/question/QuestionRenderer';

// TODO: 문제 유형 추가
const GATED_TYPES: Question['type'][] = ['speaking', 'writing'];

// 백엔드 imageUrl은 "버킷/경로" 형태의 스토리지 상대 경로라서 프론트에서 Supabase public URL로 변환한다
function toImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`;
}

// "A. B. C." -> 앞 두 문장은 제목으로 합치고, 나머지 문장들은 불릿으로 쪼갠다.
function parseTopicPrompt(prompt: string): {
  title: string;
  bullets: string[];
} {
  const sentences = prompt
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean);

  const title = `${sentences.slice(0, 2).join('. ')}.`;
  const bullets = sentences.slice(2);
  return { title, bullets };
}

// ponytail: 백엔드 문항엔 prepSeconds/answerSeconds/mainSeconds/followUpSeconds가 없어서
// 기존 스텁값 그대로 고정 사용. 백엔드가 타이머 값을 내려주면 교체할 것.
function toQuestion(
  raw: SessionQuestionResponse,
  moduleId: string,
  order: number,
): Question {
  if (raw.mode === 'writing') {
    return {
      questionId: raw.id,
      moduleId,
      type: 'writing',
      order,
      situation: '',
      instruction: raw.prompt,
      followUpInstruction: raw.prompt,
      mainSeconds: 300,
      followUpSeconds: 180,
    };
  }

  // part별로 문항 형태가 다름 — 일단 picture_description(이미지), help_request(주제 카드) 두 개만 처리.
  if (raw.part === 'help_request') {
    const { title, bullets } = parseTopicPrompt(raw.prompt);
    return {
      questionId: raw.id,
      moduleId,
      type: 'speaking',
      order,
      situation: '',
      instruction: raw.prompt,
      topicTitle: title,
      topicBullets: bullets,
      prepSeconds: 30,
      answerSeconds: 90,
    };
  }

  return {
    questionId: raw.id,
    moduleId,
    type: 'speaking',
    order,
    situation: '',
    instruction: raw.prompt,
    imageUrl: toImageUrl(raw.imageUrl),
    prepSeconds: 30,
    answerSeconds: 90,
  };
}

export default function TestingQuestionPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; questionId: string }>;
}) {
  const { id: sessionId, moduleId, questionId } = use(params);
  const router = useRouter();

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

  const [nextReady, setNextReady] = useState(false);

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
      <ExamSessionHeader />

      <QuestionRenderer
        key={question.questionId}
        sessionId={sessionId}
        question={question}
        onReadyChange={setNextReady}
        onSubmitted={handleNext}
      />

      <NextStepButton
        onClick={handleNext}
        disabled={GATED_TYPES.includes(question.type) && !nextReady}
        label={GATED_TYPES.includes(question.type) ? '건너뛰기' : '다음'}
      />
    </div>
  );
}
