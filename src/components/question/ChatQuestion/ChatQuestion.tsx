import type { ChatQuestionData } from '@/types/exam';

import { QuestionPanel } from '../QuestionPanel';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { useChatQuestion } from './useChatQuestion';

export function ChatQuestion({
  sessionId,
  question,
}: {
  sessionId: string;
  question: ChatQuestionData;
}) {
  const { messages, sendMessage } = useChatQuestion(
    sessionId,
    question.questionId,
  );

  return (
    <QuestionPanel question={question}>
      <div className="flex flex-1 flex-col rounded-lg bg-gray-50">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>
        <ChatInput
          onSend={(text) => sendMessage.mutate(text)}
          disabled={sendMessage.isPending}
        />
      </div>
    </QuestionPanel>
  );
}
