import type { SessionStatus } from './exam';

// POST /exam-sessions/:id/monitoring/analyze 응답 (부정행위 방지 플로우 PDF 2단계).
export type ProctorSeverity = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH';

// 브라우저 감지 위반 종류 (PDF 매핑표). severity는 서버 고정.
export type ViolationType =
  | 'TAB_SWITCH'
  | 'BLUR'
  | 'WINDOW_CLOSE_ATTEMPT'
  | 'MOUSE_LEAVE'
  | 'PASTE'
  | 'DUAL_MONITOR';

// POST /monitoring/violations 응답. sessionStatus가 핵심 — 같은 종류 2회 누적 시 DISQUALIFIED.
export interface ViolationResponse {
  id: string;
  eventType: ViolationType;
  severity: ProctorSeverity;
  snapshotPath: string | null;
  sessionStatus: SessionStatus;
}

export interface AnalyzeRecordedEvent {
  id: string;
  eventType: string;
  severity: ProctorSeverity;
  snapshotPath: string | null;
}

export interface AnalyzeResponse {
  severity: ProctorSeverity;
  decision: string;
  // true면 이 이벤트 id로 영상 클립 업로드(4·5단계) 진행 가능하다는 신호.
  createClip: boolean;
  eventCount: number;
  recordedEvents: AnalyzeRecordedEvent[];
}
