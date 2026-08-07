export type QuestionType = 'chat' | 'speaking' | 'writing';

export type ExamStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';

export interface ExamListItem {
  id: string;
  roundName: string;
  applicationOpenAt: string;
  applicationCloseAt: string;
  openAt: string;
  closeAt: string;
  status: ExamStatus;
}

export interface ApplyExamResponse {
  id: string;
  examId: string;
  appliedAt: string;
}

export interface StartExamSessionResponse {
  id: string;
  examId: string;
  status: 'INPROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startedAt: string;
}

export interface SessionQuestionResponse {
  id: string;
  part: string;
  prompt: string;
  imageUrl: string | null;
  mode: 'writing' | 'speaking' | null;
}

export interface BaseQuestion {
  questionId: string;
  moduleId: string;
  type: QuestionType;
  order: number;
  situation: string;
  instruction: string;
}

export interface ChatQuestionData extends BaseQuestion {
  type: 'chat';
  chatPartnerName: string;
}

export interface SpeakingQuestionData extends BaseQuestion {
  type: 'speaking';
  imageUrl?: string;
  // 이미지 없이 주제 텍스트로 발화하는 문항(예: help_request)일 때만 채워짐.
  topicTitle?: string;
  topicBullets?: string[];
  prepSeconds: number;
  answerSeconds: number;
}

export interface WritingQuestionData extends BaseQuestion {
  type: 'writing';
  followUpInstruction: string;
  mainSeconds: number;
  followUpSeconds: number;
}

export type Question =
  ChatQuestionData | SpeakingQuestionData | WritingQuestionData;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'partner';
  text: string;
  sentAt: string;
}

export type AnswerType = 'TEXT' | 'AUDIO';

export interface SaveAnswerRequest {
  type: AnswerType;
  contentText?: string;
  audioFileUrl?: string;
  durationMs?: number;
}

export interface AnswerResponse {
  id: string;
  questionId: string;
  type: AnswerType;
  contentText: string | null;
  audioFileUrl: string | null;
  status: 'DRAFT' | 'FINAL';
  modifiedAt: string;
  graded: boolean;
  score: unknown;
}
