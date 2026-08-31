'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import IcMicrophone from '@/app/assets/icons/icon_microphone.svg';

import type { SpeakingQuestionData } from '@/types/exam';

import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { getUserMedia } from '@/lib/utils/getUserMedia';

import { useModal } from '@/providers/ModalProvider';

import { useSubmitAudio } from '@/hooks/exam/useSubmitAudio';

import { useExamStore } from '@/store/examStore';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import ButtonSecondary from '@/components/common/Button/ButtonSecondary';
import { ModalBase } from '@/components/common/Modal/ModalBase';

import { ImagePrompt } from './ImagePrompt';
import { RecordingWaveform } from './RecordingWaveform';
import { SoundPlayer } from './SoundPlayer';

// 준비(prepSeconds) 동안 녹음 버튼 노출 → 클릭 또는 준비시간 종료 시 녹음 시작.
// 녹음 시간(answerSeconds)이 끝나면 남은 시간과 무관하게 바로 다음 문제로 넘어간다.
type Phase = 'prep' | 'recording' | 'done';

// 듣기 문항(질문에 대답하기)의 오디오 최대 재생 횟수.
const MAX_LISTENS = 2;

interface SpeakingQuestionProps {
  sessionId: string;
  question: SpeakingQuestionData;
  onReadyChange?: (ready: boolean) => void;
  onSubmitted?: () => void;
}

export function SpeakingQuestion({
  sessionId,
  question,
  onSubmitted,
}: SpeakingQuestionProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const submitAudio = useSubmitAudio(sessionId, question.questionId);
  const setRemainingSeconds = useExamStore(
    (state) => state.setRemainingSeconds,
  );
  const setPaused = useExamStore((state) => state.setPaused);

  // 듣기 문항: 질문 오디오를 먼저 듣고 답한다.
  const isListening = !!question.audioUrl;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [listenCount, setListenCount] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [phase, setPhase] = useState<Phase>('prep');
  const [prepRemaining, setPrepRemaining] = useState(question.prepSeconds);
  const [recordRemaining, setRecordRemaining] = useState(
    question.answerSeconds,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordStartedAtRef = useRef<number | null>(null);
  const startedRef = useRef(false); // 녹음 시작 1회 보장(클릭+자동 경쟁 방지)
  const finishedRef = useRef(false); // 종료 1회 보장

  // 헤더 "이번 문제 남은 시간" = 준비+응답 총합.
  useEffect(() => {
    setRemainingSeconds(question.prepSeconds + question.answerSeconds);
  }, [question.prepSeconds, question.answerSeconds, setRemainingSeconds]);

  // 언마운트 시 스트림 정리 + 카운트다운 정지 상태 해제.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
      setPaused(false);
    },
    [setPaused],
  );

  // 질문 오디오 재생 — 최대 MAX_LISTENS회. 실제 재생/종료는 아래 audio 이벤트로 반영.
  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio || playing || listenCount >= MAX_LISTENS) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  // 실제 재생이 시작되면 파형 애니메이션 + 카운트다운 정지, 종료되면 재개.
  const handleAudioPlay = () => {
    setPlaying(true);
    setPaused(true);
  };

  const handleAudioEnded = () => {
    setPlaying(false);
    setListenCount((c) => c + 1);
    setPaused(false);
  };

  const startRecording = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      const stream = await getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      // timeslice(1초)로 청크를 주기적으로 flush — 긴 녹음/조기 종료에도 데이터 유실 방지.
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      // 녹음 길이 계산용 시작 시각 — 이벤트 핸들러라 순수성 규칙 예외.
      // eslint-disable-next-line react-hooks/purity
      recordStartedAtRef.current = Date.now();
      setRecordRemaining(question.answerSeconds);
      setPhase('recording');
    } catch {
      // 마이크 권한 거부/실패 — 스킵하지 않고 안내 후 다시 시도할 수 있게 한다.
      // 단, 브라우저에서 이미 명시적으로 "차단"된 상태면 getUserMedia를 다시 불러도
      // 네이티브 권한 팝업 자체가 다시 뜨지 않는다(브라우저 정책, 코드로 우회 불가) —
      // 그 경우엔 "다시 시도" 대신 브라우저 설정에서 직접 허용하라고 안내해야 한다.
      startedRef.current = false;
      const permission = await navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .catch(() => null);
      const blocked = permission?.state === 'denied';

      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">
            {blocked
              ? 'Microphone permission is blocked by your browser. Please allow microphone access in your address bar settings and refresh the page.'
              : 'Microphone access is required. Please allow permission and try again.'}
          </p>
          <ButtonPrimary
            width={140}
            onClick={
              blocked
                ? closeModal
                : () => {
                    closeModal();
                    startRecording();
                  }
            }
          >
            {blocked ? 'Confirm' : 'Retry'}
          </ButtonPrimary>
        </ModalBase>,
      );
    }
  };

  // 답안 제출 실패(종료/차단된 시험 등) 시 안내 모달 → 확인 시 회차 목록으로.
  const showSubmitError = (error: unknown) => {
    const backToExams = () => {
      closeModal();
      router.replace('/');
    };
    openModal(
      <ModalBase
        onClose={backToExams}
        className="flex w-90 flex-col items-center gap-6 text-center"
      >
        <p className="text-body-lg text-primary">
          {getErrorMessage(error, 'Answer submission failed. Please retry.')}
        </p>
        <ButtonPrimary width={140} onClick={backToExams}>
          Confirm
        </ButtonPrimary>
      </ModalBase>,
    );
  };

  const finish = () => {
    if (finishedRef.current) return;
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    finishedRef.current = true;

    recorder.onstop = () => {
      // 실제 녹음 코덱(예: audio/webm;codecs=opus)으로 라벨 — 재생 호환성 위해.
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      const durationMs = recordStartedAtRef.current
        ? Date.now() - recordStartedAtRef.current
        : 0;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      // 제출 성공해야 다음 문제로. 실패(409 종료/차단 등)면 모달 경고.
      submitAudio.mutate(
        { blob, durationMs },
        {
          onSuccess: () => {
            setPhase('done');
            onSubmitted?.();
          },
          onError: (error) => {
            setPhase('done');
            showSubmitError(error);
          },
        },
      );
    };
    recorder.stop();
  };

  // 준비 카운트다운: 매초 감소, 마지막 초에 자동으로 녹음 시작(전이는 타이머 콜백에서).
  // 오디오 재생 중(playing)엔 준비시간도 정지 — 헤더 타이머와 동일하게 멈춘다.
  useEffect(() => {
    if (phase !== 'prep' || playing) return;
    const t = setTimeout(() => {
      if (prepRemaining <= 1) startRecording();
      else setPrepRemaining((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, prepRemaining, playing]);

  // 녹음 카운트다운: 매초 감소, 마지막 초에 제출 후 다음 문제로.
  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setTimeout(() => {
      if (recordRemaining <= 1) finish();
      else setRecordRemaining((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recordRemaining]);

  const isRecording = phase === 'recording';

  // 듣기 문항: 상태별 지시문을 guideTexts[0]("먼저 들어주세요 → 들은 질문에 답하기")에서 파생,
  // 안내문구는 남은 재생 가능 여부로.
  const listeningParts = (question.guideTexts[0] ?? '')
    .split('→')
    .map((s) => s.trim());
  const headingText = isListening
    ? listenCount === 0
      ? listeningParts[0]
      : (listeningParts[1] ?? listeningParts[0])
    : question.instruction;
  // 남은 재생 가능 횟수 안내는 백엔드 값 대신 고정 문구(피그마 스펙)로 표시.
  const remainingListens = MAX_LISTENS - listenCount;
  const subText = isListening
    ? remainingListens > 0
      ? `${remainingListens}번 다시 들을 수 있습니다.`
      : '음성을 다시 들을 수 없습니다.'
    : question.guideTexts[0];

  // 듣기 문항은 1회 이상 들은 뒤에만 녹음 버튼 노출(재생 중엔 비활성).
  const showRecordButton =
    phase === 'prep' && (!isListening || listenCount >= 1);

  return (
    <section
      className={cn(
        'flex h-full flex-1 flex-col items-center px-[26px] mt-[51px] mb-[33px] text-center',
        isRecording ? 'h-[calc(100vh-208px-35px)]' : 'h-[calc(100vh-208px)]',
      )}
    >
      <div className="flex shrink-0 flex-col items-center gap-3">
        {/* 문항 번호(전체 6문항 기준, 섹션 안 순번 아님) — Figma 477:2582 */}
        <p className="text-title-lg tracking-[-0.64px] text-icon-50">
          {String(question.order).padStart(2, '0')}
        </p>
        <h1 className="text-title-lg tracking-[-0.64px] text-icon-90">
          {headingText}
        </h1>
        {subText && (
          <p className="text-title-sm font-normal text-icon-50">{subText}</p>
        )}
      </div>

      {/* 이미지/오디오 플레이어를 텍스트-버튼 사이 남는 공간 정중앙에 — 이미지 세로
          크기가 원본 비율대로 제각각이라(ImagePrompt) 고정 마진 대신 flex 중앙정렬로 맞춘다. */}
      <div className="flex w-full flex-1 items-center justify-center py-[20px]">
        {isListening ? (
          <SoundPlayer
            playing={playing}
            disabled={playing || isRecording || listenCount >= MAX_LISTENS}
            onPlay={playAudio}
          />
        ) : (
          <ImagePrompt
            imageUrl={question.imageUrl ?? ''}
            fixedSize={question.part === 'SITUATION_DESCRIPTION'}
          />
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center">
        {isRecording && <RecordingWaveform />}

        {phase === 'prep' ? (
          // 듣기 문항은 1회 듣기 전엔 버튼을 안 보여주지만, 렌더 자체를 없애면
          // 그만큼 아래 영역 높이가 줄어서 위 중앙정렬(음성 플레이어)이 버튼 유무에
          // 따라 흔들린다 — invisible로 자리는 유지하고 안 보이기만 하게 처리.
          <ButtonSecondary
            onClick={startRecording}
            disabled={!showRecordButton || (isListening && playing)}
            icon={<Image src={IcMicrophone} alt="" width={24} height={24} />}
            className={cn(
              'w-auto min-w-64.25',
              !showRecordButton && 'invisible',
            )}
          >
            클릭해 녹음하세요
          </ButtonSecondary>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-auto min-w-64.25 cursor-not-allowed items-center justify-center rounded-[8px] border border-icon-30 bg-white px-(--space-24) py-(--space-20) text-button-lg text-icon-50"
          >
            녹음중입니다...
          </button>
        )}
      </div>

      {isListening && (
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onPlay={handleAudioPlay}
          onEnded={handleAudioEnded}
          preload="auto"
          className="hidden"
        />
      )}
    </section>
  );
}
