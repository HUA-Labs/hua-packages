---
name: SaaS Starter Kit 판매 계획
description: my-app 스택 기반 SaaS Starter Kit 상품화 — 시장 조사, 가격, 차별점, 판매 채널
type: project
---

## SaaS Starter Kit 판매 계획 (2026-03-12 수립)

my-app 코드베이스에서 도메인 로직 제거 후 SaaS Starter Kit으로 패키징하여 판매.

**Why:** 수익화 필요. 코드는 이미 프로덕션 검증됨. 해외 시장 타겟으로 달러 수익.

**How to apply:** 결제 시스템(provider-agnostic) 완성 후 패키징 시작. 스타터킷 관련 의사결정 시 참조.

### 시장 조사 결과

| 가격대   | 대표 제품                      | 포지션            |
| -------- | ------------------------------ | ----------------- |
| 무료     | Vercel 공식 템플릿             | 최소 기능         |
| $49~119  | LaunchFast                     | 사이드 프로젝트용 |
| $149~199 | ShipFast (월 $100K+, 마진 91%) | 인디해커 메인     |
| $299~399 | Supastarter, Makerkit          | B2B/엔터프라이즈  |

### 경쟁사 대비 차별점

- KMS 암호화 시스템 (경쟁사 없음)
- i18n 3개국어 기본 + AI 번역 파이프라인 (대부분 영어만)
- 할당량 시스템 DB + Redis (대부분 없음)
- 관리자 패널 + 감사 로그 + 악용 탐지 ($299+ 급에서나 있음)
- Rate Limiting
- 에러 코드 체계 (대부분 raw throw)
- PWA + 오프라인 지원

### 스타터킷에 필요한 추가 작업

- [x] 시장 조사
- [ ] 결제 연동 (LemonSqueezy + Stripe) — `payment-provider-agnostic-2026-03-12.md`
- [ ] 랜딩 페이지 템플릿
- [ ] 설치 문서 (5분 안에 돌릴 수 있게)
- [ ] 도메인 로직 분리 (감정 분석 등 제거)
- [ ] LemonSqueezy에 상품 등록

### 판매 채널

- **LemonSqueezy**: 메인 판매 (MoR 모델, 한국 법인으로 바로 사용 가능)
- **Vercel Templates**: 무료 등록 → 유료 제품 퍼널
- **런칭**: Product Hunt, X(Twitter), Reddit r/nextjs

### hua 패키지 별도 상품화 가능성

- @hua-labs/ui (70+ 컴포넌트, v2.2.0) — Pro 티어 $49~99
- @hua-labs/dot (크로스플랫폼 스타일 엔진, v0.1.0) — 아직 초기
- @hua-labs/motion-core (35+ 훅, 의존성 0, v2.3.0) — 독보적
- 패키지 단독 판매는 스타터킷 이후 순차 진행
