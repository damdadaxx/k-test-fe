// 회차(exam) 개념 제거 — ExamStatus/ExamListItem/ApplyExamResponse 삭제(feat/exam-question-pool).

export type SessionStatus =
  'INPROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'BLOCKED' | 'DISQUALIFIED';

export type FinalGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// GET /mypage — 내 응시 세션 현황(회차 개념 제거, 재응시 세션별로 한 줄).
// startedAt 기준 표시. examResultId 있으면 리포트 조회 가능.
export interface MyExamItem {
  examSessionId: string;
  sessionStatus: SessionStatus | null;
  startedAt: string;
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
// 실제 swagger(ReportViolationResponseDto)는 종류별 집계가 아니라 위반 건별 상세 —
// 화면에 필요한 "종류별 횟수"는 프런트가 eventType으로 묶어서 직접 계산한다.
export interface ReportViolation {
  id: string;
  eventType: string; // 브라우저 감지(TAB_SWITCH 등) + AI 웹캠 분석(FACE_OUT_OF_FRAME 등) 혼재
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  meta: Record<string, unknown>;
  createdAt: string;
  snapshotPath: string | null;
  clipPath: string | null;
  sessionStatus: SessionStatus;
}
export interface ExamReport {
  examResultId: string;
  examSessionId: string;
  candidateName: string;
  startedAt: string; // 회차 개념 제거 — roundName 대신 응시 시작 시각
  finalGrade: FinalGrade;
  percentile: number; // 참고용(임시 환산표)
  domainScores: ReportDomainScore[];
  tasks: ReportTask[];
  violations: ReportViolation[];
}

// GET /mypage/violations/:examSessionId — 실격(DISQUALIFIED) 세션 전용. 채점이 없어
// 등급/영역점수/문항 없이 위반 내역만. 실격 아닌 세션에 호출하면 409.
export interface ViolationSummary {
  examSessionId: string;
  candidateName: string;
  startedAt: string;
  violations: ReportViolation[];
}

// POST /exam-sessions 응답 — 회차 id 없음. verified=false면 본인인증/이어폰부터.
export interface StartExamSessionResponse {
  id: string;
  examSessionId: string;
  status: SessionStatus;
  startedAt: string;
  verified: boolean;
}

// GET /exam-sessions/:id · GET /exam-sessions/current — 상태 + 인증 여부.
export interface ExamSessionStatusResponse {
  id: string;
  status: SessionStatus;
  verified: boolean;
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
  skipped: boolean; // 건너뛴 문항(답안 없이 넘어감) — answered와 별개 필드
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
  part: QuestionPart;
}

export interface SpeakingQuestionData extends BaseQuestion {
  type: 'speaking';
  // 지시문 아래 안내 문구(백엔드 guideTexts).
  guideTexts: string[];
  // SITUATION_DESCRIPTION·READ_AND_EXPLAIN 둘 다 이미지 제시(디자인 변경 —
  // READ_AND_EXPLAIN도 예전엔 안전수칙 텍스트였지만 이제 Section1과 동일하게 이미지+텍스트).
  imageUrl?: string;
  // 질문을 먼저 듣고 답하는 문항(듣기)일 때만 채워짐.
  audioUrl?: string;
  prepSeconds: number;
  answerSeconds: number;
}

export type Question = SpeakingQuestionData;

export type AnswerType = 'TEXT' | 'AUDIO';

// 백엔드 SaveAnswerDto엔 audioFileUrl/durationMs만 있음(whitelist 검증이라 그 외 필드
// 보내면 400 "property X should not exist"). type/contentText는 응답(AnswerResponse)에만 있음.
export interface SaveAnswerRequest {
  audioFileUrl: string;
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
