# my-app Architecture

**작성일**: 2026-03-13
**버전**: 0.1.0

---

## 목차

1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [디렉토리 구조](#디렉토리-구조)
4. [lib/ 도메인 구조](#lib-도메인-구조)
5. [주요 기능](#주요-기능)
6. [인프라](#인프라)

---

## 개요

my-app는 AI 기반 감정 분석 일기 SaaS 서비스입니다. 사용자가 일기를 작성하면 AI가 감정을 분석하고, 시간에 따른 감정 패턴을 추적합니다.

### 핵심 특징

- **AI 감정 분석**: 다중 AI 프로바이더(OpenAI, Gemini) 기반 감정 티어 분석 (tier_a/tier_m)
- **위기 감지**: 3-레이어 위기 감지 시스템 (AI + 키워드 + 에스컬레이션 룰)
- **SLIP 계산기**: 학술 논문 기반 감정 불안정 패턴 감지
- **KMS 암호화**: 모든 일기 내용 암호화 저장
- **다국어**: 한국어/영어/일본어 (i18n-core + Zustand)
- **게스트 모드**: IP 기반 체험, 로그인 업셀
- **어드민 대시보드**: 사용자 관리, 비용 추적, 위기 알림

---

## 기술 스택

| 영역       | 기술                                    |
| ---------- | --------------------------------------- |
| 프레임워크 | Next.js 16 (App Router)                 |
| 언어       | TypeScript                              |
| ORM        | Prisma (PostgreSQL)                     |
| 인증       | NextAuth v5 (Kakao/Google/GitHub OAuth) |
| 상태관리   | Zustand                                 |
| UI         | @hua-labs/ui + @hua-labs/dot            |
| 애니메이션 | @hua-labs/motion-core                   |
| i18n       | @hua-labs/i18n-core + i18n-core-zustand |
| 캐시       | Upstash Redis                           |
| 배포       | Vercel Pro (Seoul)                      |

---

## 디렉토리 구조

```
apps/my-app/
├── app/
│   ├── (app)/          # 인증 필요 페이지
│   ├── (auth)/         # 로그인/회원가입
│   ├── (guest)/        # 게스트 모드
│   ├── admin/          # 어드민 대시보드
│   ├── api/            # API 라우트
│   └── lib/            # 비즈니스 로직 (15개 도메인)
├── prisma/
│   └── schema.prisma   # DB 스키마
├── scripts/            # 유틸리티/테스트 스크립트
├── public/
├── package.json
└── tsconfig.json
```

---

## lib/ 도메인 구조

PR #495 (2026-02-21)에서 flat 구조를 15개 도메인 디렉토리로 재구조화.

| 도메인   | 디렉토리          | 역할                             |
| -------- | ----------------- | -------------------------------- |
| 인프라   | `lib/infra/`      | prisma, cache (Redis), logger    |
| 인증     | `lib/auth/`       | auth-v5 (NextAuth), diary-auth   |
| 보안     | `lib/security/`   | encryption (KMS), decryption-log |
| AI       | `lib/ai/`         | AI 프로바이더, 프롬프트, 분석    |
| 분석     | `lib/analysis/`   | 감정 분석 로직                   |
| 일기     | `lib/diary/`      | 일기 CRUD, 검색                  |
| i18n     | `lib/i18n/`       | translations, translation.ts     |
| 비용     | `lib/cost/`       | 토큰 비용 추적, 환율             |
| 어드민   | `lib/admin/`      | 어드민 기능                      |
| 게스트   | `lib/guest/`      | 게스트 모드 로직                 |
| 할당량   | `lib/quota/`      | 사용량 제한                      |
| 속도제한 | `lib/rate-limit/` | API rate limiting                |
| 에러     | `lib/errors/`     | 에러 코드 시스템 (apiError)      |
| 라우트   | `lib/route/`      | 라우트 유틸리티                  |
| 사용자   | `lib/user/`       | 사용자 관리                      |
| 환경     | `lib/env/`        | 환경변수 검증                    |
| API      | `lib/api/`        | API 공용 유틸리티                |
| 유틸     | `lib/utils.ts`    | 공용 헬퍼                        |

---

## 주요 기능

### AI 감정 분석

- 다중 프로바이더: OpenAI → Gemini 폴백
- tier_a (감정): 0-100 스케일
- tier_m (조증): 0-100 스케일
- 토큰 비용 추적 (일별/주별/월별 집계)

### 위기 감지 (3-레이어)

1. **AI 분석**: 프롬프트 내 위기 신호 감지
2. **키워드 매칭**: 위험 키워드 패턴
3. **에스컬레이션 룰**: SLIP 패턴 기반 자동 에스컬레이션

### KMS 암호화

- 스마트 엔벨로프 암호화 (KMS + PBKDF2 폴백)
- 모든 일기 content_enc 필드 암호화
- 복호화 감사 로그

### 에러 코드 시스템

- `apiError('ERROR_CODE')` 패턴
- 응답 형식: `{ code: "ERROR_CODE", error: "사용자 메시지" }`
- 헬퍼: unauthorized(), forbidden(), notFound(), validationError()

---

## 인프라

| 서비스        | 리전                   | 상세                        |
| ------------- | ---------------------- | --------------------------- |
| Vercel        | Seoul (icn1)           | Pro 플랜                    |
| Supabase DB   | Seoul (ap-northeast-2) | PG 17, IPv6                 |
| Upstash Redis | Tokyo (ap-northeast-1) | 무료 (500K cmd/월)          |
| 백업          | sum-back 미니PC        | 매일 새벽 4시 KST, 7일 보관 |

### DB 연결

- `DATABASE_URL`: Transaction Pooler (port 6543, `?pgbouncer=true`)
- `DIRECT_URL`: Session Pooler (port 5432)

### 환경변수 관리

- 프로덕션/개발: Doppler
- 로컬: `.env` 파일

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-03-13
