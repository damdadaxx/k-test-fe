export type QuestionType = 'kakao_chat' | 'speaking';

export interface ExamSession {
  sessionId: string;
  examId: string;
  status: 'ready' | 'in_progress' | 'finished';
  startedAt?: string;
  endedAt?: string;
}

export interface ExamModule {
  moduleId: string;
  title: string;
  order: number;
}

export interface BaseQuestion {
  questionId: string;
  moduleId: string;
  type: QuestionType;
  order: number;
  situation: string;
  instruction: string;
}

export interface KakaoChatQuestionData extends BaseQuestion {
  type: 'kakao_chat';
  chatPartnerName: string;
}

export interface SpeakingQuestionData extends BaseQuestion {
  type: 'speaking';
  imageUrl: string;
  prepSeconds: number;
  answerSeconds: number;
}

export type Question = KakaoChatQuestionData | SpeakingQuestionData;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'partner';
  text: string;
  sentAt: string;
}

export interface AnswerSubmission {
  sessionId: string;
  questionId: string;
  answer: string;
}
