# 다음 단계 작업 가이드

> 작성일: 2025-12-06  
> 목적: 현재 완료된 작업 정리 및 다음 단계 제안

---

## ✅ 완료된 작업 (오늘)

### 1. Quota 시스템 구현
- ✅ 단일 전송 Quota 시스템 (무료: 3/50, 프리미엄: 20/500)
- ✅ Rate Limit (1분 10회, VPN 의심 시 3회)
- ✅ 동시 실행 제한 (최대 3개)
- ✅ 비용 계산 및 BillingRecord 업데이트
- ✅ 코드 점검 및 수정 완료

### 2. 게스트 모드 복원
- ✅ IP 기반 게스트 사용자 (일일 3회 체험)
- ✅ 게스트 Quota 관리
- ✅ 게스트 비용 추적 제외

### 3. 어뷰즈 방지 강화
- ✅ User-Agent 검증 강화
- ✅ 모바일 브라우저 허용
- ✅ VPN 의심 IP 더 엄격한 제한
- ✅ 허용된 봇 목록 관리
- ✅ 테스트 환경 검증 비활성화

---

## 🎯 다음 단계 (우선순위 순)

### 1. 통합 테스트 실행 (즉시)

#### Quota 시스템 테스트
```bash
# 로컬 테스트
pnpm test:quota:local

# Doppler 테스트
pnpm test:quota
```

**확인 사항:**
- [ ] Quota 초기화 정상 동작
- [ ] Quota 증가 정상 동작
- [ ] Quota 초과 시 적절한 에러 반환
- [ ] Rate Limit 정상 동작
- [ ] 동시 실행 제한 정상 동작
- [ ] 비용 계산 정확성

#### SSE 분석 API 테스트
```bash
# 로컬 테스트
pnpm test:sse-analysis:local

# Doppler 테스트
pnpm test:sse-analysis
```

**확인 사항:**
- [ ] 암호화 저장 정상 동작
- [ ] 재시도 로직 정상 동작
- [ ] 상태 전환 정상 동작
- [ ] 에러 처리 정상 동작

#### 어뷰즈 방지 테스트
```bash
# User-Agent 검증 테스트
curl -H "User-Agent: python-requests/2.28.0" \
  -X POST http://localhost:3000/api/diary/create \
  -H "Content-Type: application/json" \
  -d '{"content": "테스트"}'
# 예상: 403 Forbidden

# 허용된 봇 테스트
curl -H "User-Agent: HUA-Bot/1.0" \
  -X POST http://localhost:3000/api/diary/create \
  -H "Content-Type: application/json" \
  -d '{"content": "테스트"}'
# 예상: 200 OK (또는 적절한 응답)
```

---

### 2. 환경변수 설정 확인 (즉시)

#### 필수 환경변수 확인

**AI 모델 가격 설정:**
```bash
# GPT-5-mini (1차 분석)
OPENAI_GPT5_MINI_INPUT_PER_1K_USD=0.00025
OPENAI_GPT5_MINI_OUTPUT_PER_1K_USD=0.002

# GPT-4o-mini (2차 분석)
OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.0006

# Gemini 2.5 Flash (대체 모델)
GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD=0.0003
GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD=0.0025
```

**어뷰즈 방지 설정 (선택):**
```bash
# 테스트 환경에서 User-Agent 검증 비활성화
DISABLE_USER_AGENT_CHECK=false

# 허용된 봇 목록 (쉼표로 구분)
ALLOWED_BOT_USER_AGENTS=hua-bot,my-app-bot,monitoring-bot
```

**확인 사항:**
- [ ] Doppler에 모든 환경변수 설정됨
- [ ] 로컬 `.env` 파일에 테스트용 값 설정됨
- [ ] 환경변수 이름 정확성 확인

---

### 3. 실제 동작 테스트 (오늘/내일)

#### 엔드투엔드 테스트 시나리오

**시나리오 1: 정상 사용자 플로우**
1. 로그인
2. 일기 작성 및 전송
3. 분석 결과 확인
4. Quota 확인 (`/api/quota`)
5. 비용 확인 (`/api/billing`)

**시나리오 2: 게스트 사용자 플로우**
1. 로그인 없이 일기 작성 (게스트 모드)
2. 일일 3회 제한 확인
3. 4번째 시도 시 에러 확인

**시나리오 3: Quota 초과 시나리오**
1. 일일 Quota 모두 사용
2. 추가 전송 시도
3. 적절한 에러 메시지 확인

**시나리오 4: Rate Limit 초과**
1. 1분 내 10회 이상 요청
2. Rate Limit 에러 확인

**확인 사항:**
- [ ] 모든 시나리오 정상 동작
- [ ] 에러 메시지 사용자 친화적
- [ ] Quota/Billing 정보 정확성

---

### 4. 문서 업데이트 (오늘/내일)

#### 업데이트 필요한 문서
- [ ] `DEVLOG_2025-12-06_DIARY_ANALYSIS_IMPROVEMENT.md` 업데이트
  - 게스트 모드 복원 내용 추가
  - 어뷰즈 방지 강화 내용 추가
- [ ] `QUOTA_SYSTEM_CODE_REVIEW.md` 업데이트
  - 게스트 모드 관련 내용 추가
  - User-Agent 검증 내용 추가

---

### 5. 베타 런칭 준비 체크리스트 확인 (이번 주)

#### 필수 항목 확인
- [ ] **UserQuota**: ✅ 구현 완료
- [ ] **비용 추적**: ✅ 구현 완료
- [ ] **BackupRecord**: 스키마 확인 필요
- [ ] **AuditLog**: 스키마 확인 필요
- [ ] **SystemHealth**: 스키마 확인 필요
- [ ] **AnalysisFailure**: 스키마 확인 필요

#### 선택 항목 (베타 후)
- [ ] GDPR 컴플라이언스
- [ ] LegalHoldRequest
- [ ] 2FA 일반 사용자
- [ ] 고급 보안 기능

---

### 6. 코드 정리 (이번 주)

#### TODO 주석 확인
- [ ] `app/api/diary/[id]/route.ts`: 세션 확인 TODO
- [ ] `app/api/diary/[id]/share-image/route.ts`: Puppeteer 구현 TODO

#### 리팩토링 가능 항목
- [ ] 중복 코드 정리
- [ ] 타입 정의 개선
- [ ] 에러 처리 통일

---

## 🚀 즉시 실행 가능한 작업

### 1. 테스트 실행
```bash
# Quota 시스템 테스트
pnpm test:quota:local

# SSE 분석 테스트
pnpm test:sse-analysis:local
```

### 2. 환경변수 확인
```bash
# Doppler 환경변수 확인
doppler secrets

# 또는 로컬 .env 파일 확인
cat .env | grep -E "OPENAI|GEMINI|ALLOWED_BOT"
```

### 3. 실제 동작 테스트
- 브라우저에서 일기 작성 → 분석 확인
- 게스트 모드로 3회 체험
- Quota 초과 시나리오 테스트

---

## 📝 다음 회의 전 확인 사항

1. **테스트 결과**: 모든 테스트 통과 여부
2. **환경변수**: Doppler에 모든 가격 정보 설정됨
3. **실제 동작**: 엔드투엔드 플로우 정상 동작
4. **문서**: 주요 변경사항 문서화 완료

---

## 🎯 우선순위 요약

1. **즉시 (오늘)**: 통합 테스트 실행, 환경변수 확인
2. **오늘/내일**: 실제 동작 테스트, 문서 업데이트
3. **이번 주**: 베타 런칭 준비 체크리스트 확인, 코드 정리

---

**작성자**: Auto (AI Assistant)  
**태그**: #next-steps #beta-launch #testing

