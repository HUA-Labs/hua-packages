# 환경 변수 관리 현황

**작성일**: 2025-12-24  
**목적**: 로컬 개발과 프로덕션 환경의 환경 변수 관리 전략 및 현황 정리

---

## 📋 현재 상황

### 로컬 개발 환경 ✅

**Doppler 사용 중**
- **도구**: Doppler CLI
- **사용 방법**: `doppler run -- <command>`
- **예시**: `"dev": "doppler run -- next dev"`
- **장점**:
  - ✅ 환경 변수 중앙 관리
  - ✅ 버전 관리 및 변경 추적
  - ✅ 팀원 간 환경 변수 공유 용이
  - ✅ 로컬 `.env` 파일 관리 불필요

**설정 방법**:
```bash
# Doppler CLI 설치
pnpm add -g doppler

# Doppler 로그인
doppler login

# 프로젝트 설정
doppler setup
# 프로젝트: my-app
# Config: dev
```

### 프로덕션 환경 (Vercel) ⚠️

**현재 방식: Vercel 환경 변수 직접 관리**
- **도구**: Vercel 대시보드
- **사용 방법**: Vercel 프로젝트 Settings > Environment Variables에서 직접 설정
- **자동 주입**: Vercel이 빌드/런타임에 자동으로 환경 변수 주입
- **예시**: `process.env.DATABASE_URL` (Vercel에서 설정)

**Doppler Sync 미적용 이유**:
- ❌ **Doppler Sync는 유료 서비스**
- ❌ 현재 단계에서는 비용 대비 효과가 낮음
- ✅ Vercel 환경 변수 직접 관리로 충분
- ⏸️ **향후 확장 시 재검토 예정**

---

## 🎯 환경 변수 관리 전략

### 로컬 개발 환경

#### Doppler 사용
- **목적**: 환경 변수 중앙 관리 및 팀 협업
- **장점**: 
  - 버전 관리 및 변경 추적
  - 팀원 간 환경 변수 공유
  - 로컬 `.env` 파일 관리 불필요
- **사용 방법**: `doppler run -- <command>`

#### 환경 변수 분리
- **서버 전용**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY` 등
- **클라이언트 전용**: `NEXT_PUBLIC_*` 접두사 변수만

### 프로덕션 환경

#### Vercel 환경 변수 직접 관리
- **목적**: 비용 효율적인 환경 변수 관리
- **장점**:
  - 무료 플랜으로 충분
  - Vercel과의 통합 용이
  - 빌드/런타임 자동 주입
- **단점**:
  - 수동 관리 필요
  - 변경 추적 어려움

#### Doppler Sync (향후 검토)
- **조건**: 팀 확장 또는 환경 변수 복잡도 증가 시
- **비용**: 유료 서비스 (비용 대비 효과 분석 필요)

---

## 📝 환경 변수 목록

### 서버 전용 환경 변수

**데이터베이스**:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `DIRECT_URL`: Prisma 직접 연결 URL

**인증**:
- `NEXTAUTH_SECRET`: JWT 서명 키 (최소 32자, 프로덕션 필수)
- `NEXTAUTH_URL`: 인증 콜백 URL

**암호화**:
- `ENCRYPTION_KEY`: 데이터 암호화 키 (최소 32자, 프로덕션 필수)

**AI 프로바이더**:
- `OPENAI_API_KEY`: OpenAI API 키
- `GEMINI_API_KEY`: Google Gemini API 키

**소셜 로그인**:
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**기타**:
- `REDIS_URL`: Redis 연결 문자열 (선택)
- AWS SES 관련 변수들

### 클라이언트 전용 환경 변수

**NEXT_PUBLIC_* 접두사만**:
- `NEXT_PUBLIC_DEFAULT_AI_PROVIDER`: 기본 AI 프로바이더 설정

---

## 🔒 보안 고려사항

### 프로덕션 환경 변수 필수화
- `NEXTAUTH_SECRET`: 프로덕션에서 필수 (서버 시작 실패)
- `ENCRYPTION_KEY`: 프로덕션에서 필수 (서버 시작 실패)

### 환경 변수 검증
- Zod 스키마로 런타임 검증
- 서버/클라이언트 분리 검증
- `NEXT_PUBLIC_*` 접두사 강제

---

## 🚀 향후 계획

### 단기 (현재)
- ✅ 로컬: Doppler 사용
- ✅ 프로덕션: Vercel 환경 변수 직접 관리

### 중기 (향후 검토)
- ⏸️ Doppler Sync 도입 검토 (비용 대비 효과 분석)
- ⏸️ 환경 변수 변경 추적 시스템 구축

### 장기 (팀 확장 시)
- 🔄 Doppler Sync 도입 재검토
- 🔄 환경 변수 관리 자동화

---

## 📚 Related Documents

- [검증 패턴](../patterns/validation-patterns.md) - 환경 변수 검증 패턴
- [외부 도구 평가](./EXTERNAL_TOOLS_EVALUATION.md) - Doppler 평가

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

