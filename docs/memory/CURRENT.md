# Current Context

> 세션 시작 시 이 파일을 읽고 컨텍스트를 이어받는다.

**마지막 업데이트**: 2026-03-15 (Session 27)

## 진행 중

### SaaS Starter Kit — 구조 완료, 빌드 blocked

- PR #626 머지됨 (Schema + lib + API 분리)
- PR #627 머지됨 (package.json, tsconfig, next.config, .env.example)
- **BLOCKER**: @hua-labs 패키지 publish 필요 — Kit이 독립 빌드 안 됨
  - `@hua-labs/hua` npm 1.1.0 → 코드는 2.2.0+ (`/dot` subpath 없음)
  - `@hua-labs/security` npm 1.0.0-alpha.0 → crypto API 변경됨
  - `@hua-labs/i18n-loaders` 버전 불일치 가능
- **패키지 publish 후**: 버전 업데이트 → tsc --noEmit → next build 검증

### Stripe 키

- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` 도플러에 등록됨 (sandbox/test)
- 웹훅 시크릿은 엔드포인트 만든 후 등록 예정

## 이전 (Session 22~27, 03-15)

- **Client Logger** — PR #628: clientLogger + console.log 57개 교체 (prod silencing)
- **SaaS Kit 코드 분리** — PR #626: Schema 33 models, lib/ 117 files, API 50 routes
- **SaaS Kit 빌드 설정** — PR #627: package.json, tsconfig, next.config, .env.example
- **Admin Payment Dashboard** — PR #621
- **결제 통화 핫픽스** — PR #624
- **dot 19 Unknown Tokens** — PR #622
- **SDUI Registry + 테스트** — PR #625

## 다음

- [ ] **@hua-labs 패키지 publish** (hua-packages 레포) ← 선행 blocker
- [ ] Kit 빌드 검증 (tsc + next build)
- [ ] Pages(UI) 분리
- [ ] Stripe 구현체 (`payment/stripe.ts` 실제 연동)
- [ ] Paddle 구현체
- [ ] SaaS Starter Kit 랜딩 + 5분 셋업 문서
- [ ] **Pre-Release**: i18n 빈 키 11개, 크라이시스 E2E, JWT 스모크, env vars
- [ ] **결제 남은**: LemonSqueezy 인증, yearly variant, 프로덕션 UI
- [ ] **security-guidance 훅 도입**
- [ ] **3/26 베타 런칭** (D-11)
- [ ] iOS TestFlight
- [ ] Paper B 리뷰 대기

## 주의

- **B2B painkiller plan** — 레퍼런스만. 액션에 넣지 말 것
- **Kit 포지셔닝**: "아시아 시장 SaaS Kit" — Toss + LemonSqueezy + Stripe + Paddle 4종
- **숨다 런칭이 우선**, Kit은 병행 패키징
- **Kit 코드 주석은 영어** — 한국어 데이터(닉네임, abuse 키워드)는 OK
- **패키지 publish가 Kit 빌드 blocker** — hua, security, i18n-loaders 최신 버전 올려야 함
- **백그라운드 에이전트 Edit 유실**: 기존 파일 Edit은 포그라운드
- **스코프 점프 → worktree 분리**: 다른 패키지 건드릴 때 별도 PR
- **PR 머지 후 devlog 필수**
