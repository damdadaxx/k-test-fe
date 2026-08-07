'use client';

import { useEffect, useRef, useState } from 'react';

import ImgTest from '@/app/assets/images/img_exam_1.png';

import type { SpeakingQuestionData } from '@/types/exam';

import { useSubmitAudio } from '@/hooks/exam/useSubmitAudio';

import { useExamStore } from '@/store/examStore';

import { cn } from '../../../lib/utils/cn';
import { ImagePrompt } from './ImagePrompt';
import { MicButton, type RecordPhase } from './MicButton';
import { RecordingWaveform } from './RecordingWaveform';
import { TopicPrompt } from './TopicPrompt';

// TODO: 30초 후에 제출
const SUBMIT_UNLOCK_SECONDS = 5;

interface SpeakingQuestionProps {
  sessionId: string;
  question: SpeakingQuestionData;
  onReadyChange?: (ready: boolean) => void;
  onSubmitted?: () => void;
}

export function SpeakingQuestion({
  sessionId,
  question,
  onReadyChange,
  onSubmitted,
}: SpeakingQuestionProps) {
  const [phase, setPhase] = useState<RecordPhase>('idle');
  const submitAudio = useSubmitAudio(sessionId, question.questionId);
  const setRemainingSeconds = useExamStore(
    (state) => state.setRemainingSeconds,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    setRemainingSeconds(question.prepSeconds + question.answerSeconds);
    onReadyChange?.(false);
    // 마운트 시 1회만 실행 (문항별 리셋은 QuestionRenderer의 key로 처리)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      recordStartedAtRef.current = Date.now();

      setPhase('locked');
      unlockTimerRef.current = setTimeout(() => {
        setPhase('ready');
        onReadyChange?.(true);
      }, SUBMIT_UNLOCK_SECONDS * 1000);
    } catch {
      // TODO: 마이크 권한 거부 등 에러 처리 UI 추가
    }
  };

  const handleSubmit = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const durationMs = recordStartedAtRef.current
        ? Date.now() - recordStartedAtRef.current
        : 0;
      submitAudio.mutate({ blob, durationMs });
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    recorder.stop();

    setPhase('submitted');
    onSubmitted?.();
  };

  const isRecording = phase === 'locked' || phase === 'ready';

  return (
    <section className="flex flex-col items-center justify-between flex-1 h-full px-[26px] py-[51px] text-center">
      <div className="flex flex-col items-center">
        <div>
          <h1 className="mb-[12px] text-title-lg text-icon-90">
            {question.topicTitle
              ? '다음 안전수칙을 읽고 새로 온 동료에게 알려주세요.'
              : '동료가 위험한 행동을 하고 있습니다. 경고하세요.'}
          </h1>
          <p className={cn('mb-[36px] text-title-sm font-normal text-icon-50')}>
            {question.topicTitle
              ? '90초 동안 말할 수 있습니다'
              : '무엇이 위험한지 → 왜 위험한지 → 어떻게 해야 하는지를 포함하여 말하세요. (30초)'}

            {/* {question.answerSeconds}초 동안 말할 수 있습니다 */}
          </p>
        </div>

        {question.topicTitle ? (
          <TopicPrompt
            title={question.topicTitle}
            bullets={question.topicBullets ?? []}
          />
        ) : (
          <ImagePrompt imageUrl={ImgTest} />
          // <ImagePrompt imageUrl={question.imageUrl ?? ''} />
        )}

        {isRecording && <RecordingWaveform />}
      </div>

      <MicButton phase={phase} onStart={handleStart} onSubmit={handleSubmit} />
    </section>
  );
}
