# K-Test FE

온라인 화상 한국어 능력시험(K-Test) 응시 서비스의 프론트엔드입니다. 본인 인증부터 문항 풀이, 결과 확인까지의 전체 응시 플로우를 제공합니다.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) — `globals.css`에 컬러/타이포그래피 디자인 토큰 정의
- [TanStack Query](https://tanstack.com/query) — 서버 상태 관리
- [Zustand](https://zustand-demo.pmnd.rs) — 클라이언트 상태 관리 (세션/시험/채팅/부정행위 감지)
- [axios](https://axios-http.com) — API 클라이언트
- Pretendard 가변 폰트

## Getting Started

```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 환경변수

`.env.example` 참고:

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 API base URL |
| `NEXT_PUBLIC_SITE_URL` | OG 이미지 등 메타데이터에 쓰이는 배포 도메인 |

## Scripts

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 앱 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier로 전체 포맷 |
| `npm run format:check` | 포맷 검사만 (수정 없음) |

커밋 시 `husky` + `lint-staged`가 스테이징된 `.js/.jsx/.ts/.tsx` 파일에 자동으로 prettier + eslint를 적용합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/                 로그인·회원가입
│   ├── (protected)/            RouteGuard로 보호되는 라우트
│   │   ├── (exam)/[sessionId]/ 본인 인증 → 귀 촬영 → 응시 대기 → 문항 풀이 → 제출
│   │   └── (result)/[sessionId]/ 결과 확인
│   ├── style-guide/            디자인 토큰(컬러/타이포) 확인용 페이지
│   └── layout.tsx, providers.tsx, globals.css 등 앱 셸
├── components/
│   ├── auth/                   RouteGuard
│   ├── common/                 시험 중 공통 Header/Footer(타이머, 부정행위 감지 캠 등)
│   ├── identity/                신분증 업로드, 얼굴/귀 촬영
│   ├── question/                문항 타입별 렌더러 (카카오톡 채팅형, 말하기형)
│   ├── landing/                 랜딩 페이지
│   └── ui/                      Button, Modal, Toast, Skeleton 등 공통 UI
├── hooks/                       React Query mutation/query 훅
├── lib/
│   ├── api/                     axios 기반 API 모듈 (도메인별)
│   └── utils/                   base64/Blob 변환 등
├── providers/                   QueryProvider, AuthProvider, ModalProvider
├── store/                       Zustand 스토어
└── types/                       공통 타입 정의
```

### 라우팅 개요

- `/login`, `/signup` — 인증
- `/[sessionId]/identity` → `/ear-check` → `/ready` → `/testing/[moduleId]/[questionId]` → `/finish` — 시험 응시 플로우 (`(protected)` 그룹 하위, `RouteGuard`로 보호)
- `/[sessionId]` — 시험 결과

`(protected)`, `(exam)`, `(result)`는 Next.js 라우트 그룹이라 URL 경로에는 포함되지 않습니다.
