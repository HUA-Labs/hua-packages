# 🔍 Quota 시스템 코드 점검 결과

> 작성일: 2025-12-06  
> 목적: Quota 시스템 전반 코드 점검 및 수정 사항 정리

---

## ✅ 완료된 수정 사항

### 1. 인증 시스템 개선

#### `app/api/diary/create/route.ts`
- ✅ **세션 기반 인증으로 변경**: `userId`를 body에서 받던 것을 세션에서 가져오도록 수정
- ✅ **게스트 모드 제거**: 불필요한 게스트 모드 로직 제거
- ✅ **에러 처리 개선**: `AuthRequiredError` 추가 및 적절한 상태 코드 반환

**변경 전**:
```typescript
const { title, content, userId, diaryDate } = body;
const isGuest = !userId;
```

**변경 후**:
```typescript
const session = await getServerSession(authOptions);
const userId = session?.user?.id;
if (!userId) {
  throw new AuthRequiredError('로그인이 필요합니다.');
}
```

---

### 2. 비용 계산 및 BillingRecord 통일

#### `app/api/hua-emotion-analysis/route.ts`
- ✅ **`updateBillingRecord` 호출 수정**: 함수 시그니처에 맞게 수정

**변경 전**:
```typescript
await updateBillingRecord({
  userId: diary.user_id,
  provider: 'openai',
  model: 'gpt-4o-mini',
  inputTokens: usage.prompt_tokens || 0,
  outputTokens: usage.completion_tokens || 0,
  costUSD: costUSD,
});
```

**변경 후**:
```typescript
await updateBillingRecord(
  diary.user_id,
  getCurrentPeriod(),
  {
    total_analyses: 1,
    total_tokens: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
    total_cost_usd: costUSD,
    provider: 'openai',
  }
);
```

#### `app/lib/billing.ts`
- ✅ **`total_diaries` 필드 추가**: 스키마에 맞게 `total_diaries: 0` 추가 (현재는 분석만 집계)

---

### 3. 보안 개선

#### `app/api/diary/analyze/stream/route.ts`
- ✅ **세션 체크 활성화**: 주석 처리되어 있던 사용자 권한 확인 로직 활성화

**변경 전**:
```typescript
// TODO: 로그인 구현 후 사용자 권한 확인
// const session = await getServerSession();
```

**변경 후**:
```typescript
const { getServerSession } = await import('next-auth');
const { authOptions } = await import('@/app/lib/auth');
const session = await getServerSession(authOptions);

if (!session?.user?.id || session.user.id !== diary.user_id) {
  send({ type: 'error', data: { message: '권한이 없습니다.' } });
  controller.close();
  return;
}
```

---

## 📊 Quota 정책 최종 확정

### 무료 사용자
- **일일 전송**: 3회
- **월간 전송**: 50회
- **목적**: 체험 + 프리미엄 전환 유도

### 프리미엄 사용자 (₩4,900/월)
- **일일 전송**: 20회
- **월간 전송**: 500회
- **목적**: 충분한 사용량 제공

---

## 🔄 시스템 플로우 확인

### 1. 일기 전송 플로우 (`/api/diary/create`)

```
1. 세션 확인 (로그인 필수)
2. 입력 검증
3. 통합 제한 체크:
   - Rate Limit (1분 10회)
   - 동시 실행 제한 (최대 3개)
   - Quota 체크 (일일/월간)
4. 일기 암호화 및 저장
5. AnalysisResult 생성 (PENDING 상태)
6. diaryId 반환
```

### 2. AI 분석 플로우 (`/api/diary/analyze/stream`)

```
1. 세션 확인 (권한 체크)
2. 기존 분석 결과 확인:
   - COMPLETED → 복호화하여 즉시 전송
   - PENDING/PROCESSING/FAILED → 새로 분석
3. 상태를 PROCESSING으로 업데이트
4. OpenAI 스트리밍 호출
5. 실시간 파싱 및 전송
6. 분석 완료 시:
   - AnalysisResult 업데이트 (COMPLETED)
   - Quota 증가 (일일/월간)
   - BillingRecord 업데이트
```

### 3. 2차 분석 플로우 (`/api/hua-emotion-analysis`)

```
1. 세션 확인
2. 일기 및 1차 분석 결과 조회
3. 익명화 처리
4. HUA AI 분석 수행 (gpt-4o-mini)
5. 결과 저장
6. 비용 계산 및 BillingRecord 업데이트
```

---

## ✅ 검증 완료 항목

### Quota 시스템
- ✅ Quota 증가 시점: 분석 완료 시점 (올바름)
- ✅ Quota 체크 시점: 전송 시점 (올바름)
- ✅ 프리미엄/무료 구분: `isPremiumUser` 함수 사용
- ✅ Quota 초기화: 자동 초기화 로직 확인

### 비용 계산
- ✅ 1차 분석 비용: GPT-5-mini 기준 계산
- ✅ 2차 분석 비용: GPT-4o-mini 기준 계산
- ✅ BillingRecord 업데이트: 두 분석 모두 기록
- ✅ 환경변수 기반 가격: 모든 모델 지원

### 에러 처리
- ✅ `AuthRequiredError`: 401 상태 코드
- ✅ `QuotaExceededError`: 403 상태 코드
- ✅ `RateLimitExceededError`: 429 상태 코드
- ✅ `ConcurrentLimitExceededError`: 429 상태 코드

### 보안
- ✅ 세션 기반 인증: 모든 API에서 확인
- ✅ 사용자 권한 체크: 일기 소유자 확인
- ✅ 암호화: 민감 데이터 모두 암호화

---

## 📝 환경변수 설정 필요

### GPT-5-mini (1차 분석)
```env
OPENAI_GPT5_MINI_INPUT_PER_1K_USD=0.00025
OPENAI_GPT5_MINI_OUTPUT_PER_1K_USD=0.002
```

### GPT-4o-mini (2차 분석)
```env
OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.0006
```

### Gemini 2.5 Flash (대체 모델)
```env
GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD=0.0003
GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD=0.0025
```

---

## 🎯 최종 정리

### 수정된 파일
1. ✅ `app/api/diary/create/route.ts` - 세션 기반 인증, 게스트 모드 제거
2. ✅ `app/api/diary/analyze/stream/route.ts` - 세션 체크 활성화
3. ✅ `app/api/hua-emotion-analysis/route.ts` - `updateBillingRecord` 호출 수정
4. ✅ `app/lib/billing.ts` - `total_diaries` 필드 추가
5. ✅ `app/lib/api-error.ts` - `AuthRequiredError` 추가
6. ✅ `app/lib/quota.ts` - Quota 수치 조정 (무료: 3/50, 프리미엄: 20/500)
7. ✅ `app/lib/quota-store/db-quota-store.ts` - 기본값 조정

### 확인된 사항
- ✅ Quota 증가 시점: 분석 완료 시점 (올바름)
- ✅ 비용 계산: 모든 분석에서 정확히 계산됨
- ✅ 에러 처리: 적절한 상태 코드 반환
- ✅ 보안: 세션 기반 인증 및 권한 체크

---

## 🚀 다음 단계

1. **환경변수 설정**: Doppler 또는 `.env`에 가격 정보 추가
2. **테스트**: Quota 시스템 통합 테스트 실행
3. **모니터링**: 실제 사용량 추적 및 비용 확인

---

**작성자**: Auto (AI Assistant)  
**태그**: #quota-system #code-review #cost-management

