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

export type SessionStatus =
  'INPROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'BLOCKED' | 'DISQUALIFIED';

export type FinalGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// GET /mypage — 내가 신청한 회차 현황. appliedAt 있으면 신청함, sessionStatus로 진행 단계 구분.
export interface MyExamItem {
  examId: string;
  roundName: string;
  openAt: string;
  closeAt: string;
  examStatus: ExamStatus;
  appliedAt: string;
  examSessionId: string | null;
  sessionStatus: SessionStatus | null;
  // 제출 시각(제출 전 null). 최종 리포트 id(채점 전 null) — report 조회·readiness 판정에 사용. 등급 A~F.
  submittedAt: string | null;
  examResultId: string | null;
  finalGrade: FinalGrade | null;
}

// GET /mypage/report/:examResultId — 최종 리포트 상세.
export interface ReportDomainScore {
  area: string; // content_task | language_use | delivery 등. 라벨은 프런트 매핑.
  score: number; // 0~100
}
export interface ReportRequiredPoint {
  description: string;
  met: boolean;
}
export interface ReportTask {
  questionId: string;
  part: QuestionPart;
  skipped: boolean; // 명시 스킵 + 방치 미착수 모두 true
  response: string | null; // STT 전사, 스킵이면 null
  requiredPoints: ReportRequiredPoint[] | null; // 스킵이면 null
}
export interface ReportViolation {
  eventType: string; // 브라우저 + AI 감지 혼재
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  count: number;
}
export interface ExamReport {
  examResultId: string;
  examSessionId: string;
  candidateName: string;
  roundName: string;
  finalGrade: FinalGrade;
  percentile: number; // 참고용(임시 환산표)
  domainScores: ReportDomainScore[];
  tasks: ReportTask[];
  violations: ReportViolation[];
}

export interface StartExamSessionResponse {
  id: string;
  examSessionId: string;
  examId: string;
  status: SessionStatus;
  startedAt: string;
}

// GET /exam-sessions/:id — 상태만 확인. INPROGRESS 아니면 진행 불가.
export interface ExamSessionStatusResponse {
  id: string;
  examId: string;
  status: SessionStatus;
}

// 문항 part = 섹션 종류. 그림묘사/읽고설명(안전수칙)/듣고답하기(오디오).
export type QuestionPart =
  'SITUATION_DESCRIPTION' | 'READ_AND_EXPLAIN' | 'ANSWER_QUESTION';

// GET /exam-sessions/:id/questions 문항 원본 (백엔드 스키마).
// 준비/응답 시간, 안전수칙, 오디오까지 문항별로 내려온다. 없으면 빈 문자열/배열.
export interface SessionQuestionResponse {
  id: string;
  part: QuestionPart;
  answered: boolean;
  preparationSeconds: number;
  responseSeconds: number;
  guideTexts: string[];
  instruction: string;
  imageUrl: string;
  safetyRulesTitle: string;
  safetyRules: string[];
  audioUrl: string;
}

export interface BaseQuestion {
  questionId: string;
  moduleId: string;
  type: 'speaking';
  order: number;
  situation: string;
  instruction: string;
}

export interface SpeakingQuestionData extends BaseQuestion {
  type: 'speaking';
  // 지시문 아래 안내 문구(백엔드 guideTexts).
  guideTexts: string[];
  imageUrl?: string;
  // 이미지 없이 주제 텍스트로 발화하는 문항(안전수칙 등)일 때만 채워짐.
  topicTitle?: string;
  topicBullets?: string[];
  // 질문을 먼저 듣고 답하는 문항(듣기)일 때만 채워짐.
  audioUrl?: string;
  prepSeconds: number;
  answerSeconds: number;
}

export type Question = SpeakingQuestionData;

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
