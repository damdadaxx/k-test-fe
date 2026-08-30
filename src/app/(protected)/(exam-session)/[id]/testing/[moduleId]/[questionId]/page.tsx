'use client';

import { use, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { Question, SessionQuestionResponse } from '@/types/exam';

import { getSessionQuestions, skipQuestion } from '@/lib/api/exam';
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
  const { canAccess } = useExamSessionGuard(sessionId);
  // 건너뛰기 요청 진행 중 재클릭 방지 — 가드 없이는 더블클릭 시 같은 문항에 skip이
  // 두 번 나가 두 번째가 409(이미 처리됨)로 실패하고, 마지막 문항이면 그 실패 때문에
  // finalize가 걸려 세션이 계속 INPROGRESS로 남는 문제가 있었다. 문항이 바뀌면 새
  // 문항이니 렌더 중에 리셋(React 권장 패턴 — effect 안에서 setState 금지).
  const [isSkipping, setIsSkipping] = useState(false);
  const [skipResetKey, setSkipResetKey] = useState(questionId);
  if (skipResetKey !== questionId) {
    setSkipResetKey(questionId);
    setIsSkipping(false);
  }

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

  // 세션 상태 확인 끝나기 전(또는 실격/차단 등)엔 문항 내용을 안 보여준다.
  if (!canAccess) return null;

  if (!rawQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">문항을 불러오는 중입니다...</p>
      </div>
    );
  }

  const question = toQuestion(rawQuestion, moduleId, currentIndex + 1);
  // 다음 문항도, 다음 섹션도 없으면 마지막 문항(section3 끝) → 버튼을 "제출"로 표시.
  // (동작 자체는 여전히 skip 호출 — 실제 답안 제출은 SpeakingQuestion 녹음이 담당.
  // "제출"이라는 라벨은 이걸 눌러 시험을 끝낸다는 의미로만 쓴다.)
  const isLastQuestion = !nextRawQuestion && !getNextSection(moduleId);

  // 다음 문항/섹션/결과로 이동만. 뒤로가기 복귀 방지 위해 replace(history 미적재).
  const goNext = () => {
    if (nextRawQuestion) {
      router.replace(`/${sessionId}/testing/${moduleId}/${nextRawQuestion.id}`);
      return;
    }

    const nextSection = getNextSection(moduleId);
    if (nextSection) {
      router.replace(`/${sessionId}/testing/${nextSection.moduleId}/intro`);
    } else {
      router.replace(`/${sessionId}/finish`);
    }
  };

  // "건너뛰기" 버튼: 답안 대신 skip 호출(마지막 문항이면 서버가 자동 finalize) 후 이동.
  // 실패(이미 답안 저장 409/종료된 세션 등)해도 이동은 진행 — 다음 화면 가드가 처리.
  // isSkipping 가드: 없으면 더블클릭 시 같은 문항에 skip이 두 번 나가 하나는 반드시
  // 409로 실패한다(이미 처리된 문항/세션).
  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      await skipQuestion(sessionId, questionId);
    } catch {
      // best-effort: 스킵 실패해도 시험 흐름은 막지 않는다.
    }
    goNext();
  };

  return (
    <div className="flex min-h-screen flex-col h-full justify-between">
      {/* 시험 페이지 헤더 - 타이머 + 웹캠 */}
      <ExamSessionHeader />

      {/* 문항 섹션 — 녹음 제출(답안 저장) 성공 시 skip 없이 바로 다음으로. */}
      <SpeakingQuestion
        key={question.questionId}
        sessionId={sessionId}
        question={question}
        onSubmitted={goNext}
      />

      {/* 건너뛰기/제출 버튼: 동작은 항상 skip 호출 후 이동. 마지막 문항만 "제출"로 표시
          (이 버튼으로 시험을 끝낸다는 의미) — 실제 답안 제출은 SpeakingQuestion 녹음이 담당. */}
      <NextStepButton
        onClick={() => void handleSkip()}
        label={isLastQuestion ? '제출' : '건너뛰기'}
        disabled={isSkipping}
      />
    </div>
  );
}
