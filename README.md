# K-Test FE

온라인 화상 한국어 능력시험(K-Test) 응시 서비스의 프론트엔드입니다. 본인 인증부터 문항 풀이, 결과 확인까지의 전체 응시 플로우를 제공합니다.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) — `globals.css`에 컬러/타이포그래피 디자인 토큰 정의
- [TanStack Query](https://tanstack.com/query) — 서버 상태 관리
- [Zustand](https://zustand-demo.pmnd.rs) — 클라이언트 상태 관리 (`sessionStore`/`examStore`)
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — 폼 상태·유효성 검증
- [axios](https://axios-http.com) — API 클라이언트
- [Framer Motion](https://www.framer.com/motion) — 모션/애니메이션
- Pretendard 가변 폰트

## Getting Started

```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev
```

[http://localhost:5173](http://localhost:5173)에서 확인할 수 있습니다.


## Scripts

| 명령어                 | 설명                    |
| ---------------------- | ----------------------- |
| `npm run dev`          | 개발 서버 실행          |
| `npm run build`        | 프로덕션 빌드           |
| `npm run start`        | 빌드된 앱 실행          |
| `npm run lint`         | ESLint 검사             |
| `npm run test`         | Vitest 실행             |
| `npm run format`       | Prettier로 전체 포맷    |
| `npm run format:check` | 포맷 검사만 (수정 없음) |

커밋 시 `husky` + `lint-staged`가 스테이징된 `.js/.jsx/.ts/.tsx` 파일에 자동으로 prettier + eslint를 적용합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/                        로그인·회원가입
│   ├── (protected)/                   로그인 필요 라우트
│   │   ├── (exam-entry)/[id]/         본인인증(identity) → 얼굴(face-check) → 이어폰(ear-check) 확인
│   │   ├── (exam-session)/[id]/       듀얼모니터 안내 → 캘리브레이션(ready) → 문항 풀이(testing) → 완료(finish)
│   │   └── (result)/                  my-reports 목록 · report/[examResultId] 상세 · violations/[examSessionId] 실격 상세
│   ├── style-guide/                   디자인 토큰(컬러/타이포) 확인용 페이지
│   └── layout.tsx, providers.tsx, globals.css 등 앱 셸
├── components/
│   ├── auth/                          RouteGuard
│   ├── common/                        PageHeader, Button/Modal/Toast/Skeleton 등 공통 UI
│   ├── identity/                      신분증 업로드, 얼굴/귀 촬영
│   ├── proctor/                       ProctorGuard(브라우저 이벤트 감지), WebcamMonitor(AI 웹캠 분석)
│   ├── question/                      문항 타입별 렌더러(말하기 3섹션: 이미지/텍스트/오디오)
│   ├── landing/                       랜딩 페이지
│   ├── result/                        리포트/위반 내역 렌더링
│   └── ui/                            공통 UI 프리미티브
├── hooks/                             React Query mutation/query 훅
├── lib/
│   ├── api/                           axios 기반 API 모듈 (도메인별)
│   ├── exam/                          섹션 정의, 위반 라벨 등 시험 도메인 로직
│   ├── proctor/                       프록토링 개발용 플래그 설정
│   └── utils/                         base64/Blob 변환, getUserMedia 등
├── providers/                         QueryProvider, AuthProvider, ModalProvider, CameraStreamProvider
├── store/                             Zustand 스토어 (`sessionStore`, `examStore`)
└── types/                             공통 타입 정의
```

### 라우팅 개요

- `/login`, `/signup` — 인증
- `/[id]/identity` → `/face-check` → `/ear-check` → `/dual-monitor-notice` → `/ready` → `/testing/[moduleId]/intro` → `/testing/[moduleId]/[questionId]` → `/finish` — 시험 응시 플로우 (`[id]` = examSessionId, `(protected)` 그룹 하위)
- `/my-reports` — 내 응시 이력 목록
- `/report/[examResultId]` — 채점 결과 상세
- `/violations/[examSessionId]` — 실격(DISQUALIFIED) 세션의 부정행위 내역

`(auth)`, `(protected)`, `(exam-entry)`, `(exam-session)`, `(result)`는 Next.js 라우트 그룹이라 URL 경로에는 포함되지 않습니다.
