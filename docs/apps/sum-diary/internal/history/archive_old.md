# 아키텍처 문서화 계획

> 작성일: 2025-12-16  
> 목표: 실제 구현을 기반으로 아주 상세한 아키텍처 문서 작성

## 개요

숨다이어리 서비스의 아키텍처를 실제 코드 구현을 기반으로 매우 상세하게 문서화합니다. 각 시스템을 독립적인 문서로 분리하여 깊이 있게 설명합니다.

---

## 문서 구조 계획

### 1. 시스템 아키텍처 개요
**파일**: `ARCHITECTURE_OVERVIEW.md`
- 전체 시스템 개요
- 기술 스택
- 아키텍처 패턴
- 레이어 구조
- 데이터 흐름 개요
- 다른 아키텍처 문서로의 링크

### 2. 데이터 레이어 아키텍처
**파일**: `architecture/DATA_LAYER.md`
- Prisma ORM 구조
- 데이터베이스 스키마 설계
- 트랜잭션 관리
- 쿼리 최적화 전략
- 인덱스 전략
- 데이터 마이그레이션
- 연결 풀 관리

### 3. 암호화 시스템 아키텍처
**파일**: `architecture/ENCRYPTION_SYSTEM.md`
- AES-256-GCM 암호화 상세
- 키 관리 시스템
- 키 파생 (PBKDF2)
- 암호화/복호화 플로우
- 사용자별 암호화
- 키 로테이션 전략
- 보안 고려사항

### 4. AI 분석 시스템 아키텍처
**파일**: `architecture/AI_ANALYSIS_SYSTEM.md`
- 1차 AI 분석 (OpenAI/Gemini)
- 2차 HUA 감정 엔진 분석
- 프롬프트 엔지니어링
- 스트리밍 응답 처리
- 토큰 관리 및 비용 계산
- 프로바이더 전환 로직
- 재시도 및 에러 처리

### 5. 위기 감지 시스템 아키텍처
**파일**: `architecture/CRISIS_DETECTION_SYSTEM.md`
- 3단계 안전망 구조
- AI 기반 감지
- 키워드 Fail-Safe
- 익명화 프로세스
- 재식별 위험 평가
- Escalation 시스템
- 운영자 검토 플로우

### 6. 악용 탐지 시스템 아키텍처
**파일**: `architecture/ABUSE_DETECTION_SYSTEM.md`
- Jailbreak 탐지
- 반복 요청 감지
- Rate Limiting
- 동시 실행 제한
- 패턴 분석
- 제재 시스템

### 7. 할당량 및 비용 관리 아키텍처
**파일**: `architecture/QUOTA_AND_BILLING_SYSTEM.md`
- Quota 시스템 설계
- Rate Limit 구현
- 동시 실행 제한
- 비용 계산 로직
- BillingRecord 집계
- Redis vs DB 전략

### 8. 게스트 모드 시스템 아키텍처
**파일**: `architecture/GUEST_MODE_SYSTEM.md`
- 게스트 ID 생성 전략
- 게스트 일기 저장
- 자동 마이그레이션
- 게스트 제한 시스템
- IP 기반 추적
- localStorage 기반 추적

### 9. 오프라인 및 동기화 시스템 아키텍처
**파일**: `architecture/OFFLINE_SYNC_SYSTEM.md`
- IndexedDB 구조
- 오프라인 저장 전략
- 자동 동기화 로직
- 충돌 해결 전략
- 네트워크 상태 감지
- PWA 지원

### 10. 인증 및 권한 관리 아키텍처
**파일**: `architecture/AUTH_AND_AUTHORIZATION.md`
- NextAuth.js 통합
- 소셜 로그인 (Kakao, Google)
- 세션 관리
- 역할 기반 접근 제어 (RBAC)
- 게스트 인증
- 자동 로그아웃

### 11. API 레이어 아키텍처
**파일**: `architecture/API_LAYER.md`
- API 라우트 구조
- 요청/응답 처리
- 에러 핸들링
- 미들웨어 체인
- 인증 미들웨어
- Rate Limiting 미들웨어
- 주요 API 엔드포인트 상세

### 12. 프론트엔드 아키텍처
**파일**: `architecture/FRONTEND_ARCHITECTURE.md`
- 컴포넌트 구조
- 커스텀 훅 패턴
- 상태 관리 (Zustand)
- 라우팅 구조
- 페이지 구조
- UI 라이브러리 통합
- 테마 시스템

### 13. 서비스 레이어 아키텍처
**파일**: `architecture/SERVICE_LAYER.md`
- 서비스 모듈 구조
- 의존성 주입 패턴
- 서비스 간 통신
- 비동기 작업 처리
- 에러 전파
- 로깅 전략

### 14. 캐싱 및 성능 최적화 아키텍처
**파일**: `architecture/CACHING_AND_PERFORMANCE.md`
- Redis 캐싱 전략
- 메모리 캐시 폴백
- 캐시 무효화 전략
- 쿼리 최적화
- 데이터베이스 인덱싱
- 프론트엔드 최적화

### 15. 모니터링 및 로깅 아키텍처
**파일**: `architecture/MONITORING_AND_LOGGING.md`
- 에러 로깅
- API 로깅
- 성능 모니터링
- 사용자 행동 추적
- 알림 시스템
- 관리자 대시보드

---

## 문서 작성 기준

### 각 문서에 포함할 내용

1. **개요**
   - 시스템의 목적과 역할
   - 전체 아키텍처에서의 위치

2. **설계 원칙**
   - 왜 이렇게 설계했는지
   - 대안과 비교

3. **구현 상세**
   - 실제 코드 구조
   - 주요 함수/클래스 설명
   - 데이터 구조
   - 알고리즘 설명

4. **데이터 흐름**
   - 입력 → 처리 → 출력
   - 상태 변화
   - 에러 처리

5. **통합 포인트**
   - 다른 시스템과의 연동
   - 의존성
   - 인터페이스

6. **성능 고려사항**
   - 최적화 전략
   - 병목 지점
   - 확장성

7. **보안 고려사항**
   - 보안 메커니즘
   - 취약점 및 대응
   - 모범 사례

8. **테스트 전략**
   - 테스트 방법
   - 테스트 케이스
   - 모킹 전략

9. **문제 해결**
   - 일반적인 문제
   - 디버깅 팁
   - 트러블슈팅

10. **참고 자료**
    - 관련 코드 파일
    - 관련 문서
    - 외부 리소스

---

## 작성 순서

### Phase 1: 핵심 시스템 (우선순위 높음)
1. 시스템 아키텍처 개요
2. 데이터 레이어 아키텍처
3. 암호화 시스템 아키텍처
4. AI 분석 시스템 아키텍처

### Phase 2: 보안 시스템
5. 위기 감지 시스템 아키텍처
6. 악용 탐지 시스템 아키텍처
7. 인증 및 권한 관리 아키텍처

### Phase 3: 비즈니스 로직
8. 할당량 및 비용 관리 아키텍처
9. 게스트 모드 시스템 아키텍처
10. 오프라인 및 동기화 시스템 아키텍처

### Phase 4: 인프라 및 프론트엔드
11. API 레이어 아키텍처
12. 프론트엔드 아키텍처
13. 서비스 레이어 아키텍처
14. 캐싱 및 성능 최적화 아키텍처
15. 모니터링 및 로깅 아키텍처

---

## 문서 위치

```
docs/
├── ARCHITECTURE_OVERVIEW.md (루트)
└── architecture/
    ├── DATA_LAYER.md
    ├── ENCRYPTION_SYSTEM.md
    ├── AI_ANALYSIS_SYSTEM.md
    ├── CRISIS_DETECTION_SYSTEM.md
    ├── ABUSE_DETECTION_SYSTEM.md
    ├── QUOTA_AND_BILLING_SYSTEM.md
    ├── GUEST_MODE_SYSTEM.md
    ├── OFFLINE_SYNC_SYSTEM.md
    ├── AUTH_AND_AUTHORIZATION.md
    ├── API_LAYER.md
    ├── FRONTEND_ARCHITECTURE.md
    ├── SERVICE_LAYER.md
    ├── CACHING_AND_PERFORMANCE.md
    └── MONITORING_AND_LOGGING.md
```

---

## 진행 상황

- [x] Phase 1: 핵심 시스템 (완료)
- [x] Phase 2: 보안 시스템 (완료)
- [x] Phase 3: 비즈니스 로직 (완료)
- [x] Phase 4: 인프라 및 프론트엔드 (완료)

**모든 아키텍처 문서 작성 완료 (2025-12-16)**

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
