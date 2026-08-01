'use client';

import { useState } from 'react';

import type { SpeakingQuestionData } from '@/types/exam';

import { useSubmitAudio } from '@/hooks/useSubmitAudio';

import { QuestionPanel } from '../QuestionPanel';
import { ImagePrompt } from './ImagePrompt';
import { MicButton } from './MicButton';

export function SpeakingQuestion({
  sessionId,
  question,
}: {
  sessionId: string;
  question: SpeakingQuestionData;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const submitAudio = useSubmitAudio(sessionId, question.questionId);

  return (
    <QuestionPanel question={question}>
      <ImagePrompt imageUrl={question.imageUrl} />
      <div className="flex justify-center py-6">
        <MicButton
          isRecording={isRecording}
          onToggle={() => setIsRecording((prev) => !prev)}
        />
      </div>
      {submitAudio.isPending && (
        <p className="text-center text-sm text-gray-500">제출 중...</p>
      )}
    </QuestionPanel>
  );
}
