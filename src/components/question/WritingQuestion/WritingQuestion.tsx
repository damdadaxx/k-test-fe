'use client';

import { useEffect, useState } from 'react';

import type { WritingQuestionData } from '@/types/exam';

import { useSubmitWriting } from '@/hooks/exam/useSubmitWriting';

import { useExamStore } from '@/store/examStore';

import { WritingPanel } from './WritingPanel';

interface WritingQuestionProps {
  sessionId: string;
  question: WritingQuestionData;
  onReadyChange?: (ready: boolean) => void;
  onSubmitted?: () => void;
}

export function WritingQuestion({
  sessionId,
  question,
  onReadyChange,
  onSubmitted,
}: WritingQuestionProps) {
  const [step, setStep] = useState<'main' | 'followUp'>('main');
  const [mainValue, setMainValue] = useState('');
  const [followUpValue, setFollowUpValue] = useState('');
  const [mainSubmitted, setMainSubmitted] = useState(false);
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  const submitAnswer = useSubmitWriting(sessionId, question.questionId);
  const setRemainingSeconds = useExamStore(
    (state) => state.setRemainingSeconds,
  );

  useEffect(() => {
    setRemainingSeconds(question.mainSeconds + question.followUpSeconds);
    onReadyChange?.(false);
    // 마운트 시 1회만 실행 (문항별 리셋은 QuestionRenderer의 key로 처리)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitMain = () => {
    submitAnswer.mutate(mainValue);
    setMainSubmitted(true);
    setStep('followUp');
  };

  const handleSubmitFollowUp = () => {
    submitAnswer.mutate(followUpValue);
    setFollowUpSubmitted(true);
    onReadyChange?.(true);
    onSubmitted?.();
  };

  const mainMinutes = Math.round(question.mainSeconds / 60);
  const followUpMinutes = Math.round(question.followUpSeconds / 60);

  return (
    <section className="flex flex-col gap-4 px-6 py-10">
      <div className="grid grid-cols-2 gap-4">
        <WritingPanel
          stepNumber={1}
          title={`아래 주제에 대해 ${mainMinutes}분간 작성하세요`}
          prompt={question.instruction}
          active
          submitted={mainSubmitted}
          value={mainValue}
          onChange={setMainValue}
          onSubmit={handleSubmitMain}
          isSubmitting={submitAnswer.isPending}
        />
        <WritingPanel
          stepNumber={2}
          title={`${followUpMinutes}분간 후속 응답을 작성하세요`}
          prompt={question.followUpInstruction}
          active={step === 'followUp'}
          submitted={followUpSubmitted}
          value={followUpValue}
          onChange={setFollowUpValue}
          onSubmit={handleSubmitFollowUp}
          isSubmitting={submitAnswer.isPending}
        />
      </div>
    </section>
  );
}
