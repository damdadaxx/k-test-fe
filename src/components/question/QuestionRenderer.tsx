import type { Question } from '@/types/exam';

import { ChatQuestion } from './ChatQuestion/ChatQuestion';
import { SpeakingQuestion } from './SpeakingQuestion/SpeakingQuestion';
import { WritingQuestion } from './WritingQuestion/WritingQuestion';

export function QuestionRenderer({
  sessionId,
  question,
  onReadyChange,
  onSubmitted,
}: {
  sessionId: string;
  question: Question;
  onReadyChange?: (ready: boolean) => void;
  onSubmitted?: () => void;
}) {
  switch (question.type) {
    case 'chat':
      return <ChatQuestion sessionId={sessionId} question={question} />;
    case 'speaking':
      return (
        <SpeakingQuestion
          key={question.questionId}
          sessionId={sessionId}
          question={question}
          onReadyChange={onReadyChange}
          onSubmitted={onSubmitted}
        />
      );
    case 'writing':
      return (
        <WritingQuestion
          key={question.questionId}
          sessionId={sessionId}
          question={question}
          onReadyChange={onReadyChange}
          onSubmitted={onSubmitted}
        />
      );
    default:
      return null;
  }
}
