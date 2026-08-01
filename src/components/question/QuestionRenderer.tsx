import type { Question } from '@/types/exam';

import { KakaoChatQuestion } from './KakaoChatQuestion/KakaoChatQuestion';
import { SpeakingQuestion } from './SpeakingQuestion/SpeakingQuestion';

export function QuestionRenderer({
  sessionId,
  question,
}: {
  sessionId: string;
  question: Question;
}) {
  switch (question.type) {
    case 'kakao_chat':
      return <KakaoChatQuestion sessionId={sessionId} question={question} />;
    case 'speaking':
      return <SpeakingQuestion sessionId={sessionId} question={question} />;
    default:
      return null;
  }
}
