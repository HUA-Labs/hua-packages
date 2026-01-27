# Lazy Cleanup 패턴 분석 및 최적화

## 📅 날짜
2025-12-15

## 🎯 목적
서버리스 환경에서 메모리 누수 방지를 위한 Lazy Cleanup 패턴 분석 및 최적화

## 🔍 서버리스 함수 생애주기 이해

### 함수 동결(Freeze) 메커니즘
1. **요청 처리 완료**: 함수가 응답을 반환하면 즉시 동결 상태로 전환
2. **CPU 중지**: 동결된 함수에서는 CPU가 멈춤
3. **타이머 무효화**: `setInterval`이 설정되어 있어도 실행되지 않음
4. **컨테이너 재시작/삭제**: 일정 시간 후 컨테이너가 삭제되면 메모리도 함께 해제

### 왜 setInterval이 작동하지 않는가?
```
요청 처리 → 응답 반환 → 함수 동결(Freeze) → CPU 중지
                                    ↓
                            setInterval 대기 중...
                                    ↓
                    (타이머가 실행될 기회가 없음)
```

### 왜 Lazy Cleanup이 작동하는가?
```
요청 도착 → 함수 깨어남(Thaw) → CPU 활성화
                ↓
        Lazy Cleanup 실행 (100% 보장)
                ↓
        요청 처리 → 응답 반환 → 함수 동결
```

**핵심**: 요청이 들어온 순간(Invoke)은 무조건 CPU가 깨어 있으므로, 그 시점에 실행되는 코드는 100% 실행이 보장됩니다.

## 📊 구현 방식 비교

### 1. 카운터 방식 (초기 구현)

```typescript
let cleanupCounter = 0;
const CLEANUP_INTERVAL = 100;

export async function checkUserRateLimit(userId: string) {
  cleanupCounter++;
  if (cleanupCounter >= CLEANUP_INTERVAL) {
    cleanupExpiredRateLimits();
    cleanupCounter = 0;
  }
  // ...
}
```

**장점**:
- 정확한 주기 보장 (100번마다 정확히 1회)
- 예측 가능한 동작

**단점**:
- 상태(변수) 의존성: 컨테이너 재시작 시 카운터가 0으로 초기화
- 100번 요청 전에 컨테이너가 죽으면 청소가 한 번도 안 돌 수 있음
- 변수 관리 필요

### 2. 확률 방식 (최적화된 구현) ✅

```typescript
const CLEANUP_PROBABILITY = 0.01; // 1% 확률

export async function checkUserRateLimit(userId: string) {
  if (Math.random() < CLEANUP_PROBABILITY) {
    cleanupExpiredRateLimits();
  }
  // ...
}
```

**장점**:
- 상태(변수) 의존성 없음: 컨테이너 재시작과 무관
- 더 순수한 함수형 접근
- 코드가 간결함
- 통계적으로 동일한 효과 (장기적으로 1% 확률 = 100번 중 1번)

**단점**:
- 완벽한 주기 보장은 아님 (확률적)
- 하지만 서버리스 환경에서는 컨테이너가 자주 재시작되므로 큰 문제 없음

## ✅ 최종 선택: 확률 방식

### 이유
1. **서버리스 특성**: 컨테이너가 자주 재시작되므로 상태 유지가 어려움
2. **순수성**: 상태(변수)에 의존하지 않는 더 순수한 코드
3. **실용성**: 통계적으로 동일한 효과, 코드가 더 간결
4. **안정성**: 컨테이너 재시작과 무관하게 동작

### 적용된 파일
- `apps/my-app/app/lib/rate-limit.ts` - CLEANUP_PROBABILITY = 0.01 (1%)
- `apps/my-app/app/lib/user-settings-server.ts` - CLEANUP_PROBABILITY = 0.02 (2%)

### 확률 선택 기준
- **Rate Limit**: 1% (100번 중 1번) - 엔트리가 자동 만료되므로 낮은 확률로 충분
- **User Settings Cache**: 2% (50번 중 1번) - 캐시가 더 중요하므로 약간 높은 확률

## 🎯 핵심 교훈

### 서버리스 철학
1. **"서버리스의 메모리는 휘발성이다"**
   - 컨테이너가 자주 재시작되므로 과도한 정리 불필요
   - 메모리 누수 걱정보다는 컨테이너 재시작을 활용

2. **"상태(State)는 적(敵)"**
   - 서버리스는 상태 비저장(Stateless) 설계가 핵심
   - 변수에 의존하지 않는 순수한 함수가 더 안정적

3. **"요청 시점(Invoke)은 황금 시간"**
   - 요청이 들어온 순간만 CPU가 보장됨
   - 그 시점에 필요한 모든 작업을 수행

## 📚 참고 자료

- [AWS Lambda Execution Environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Serverless Best Practices](https://www.serverless.com/framework/docs/guides/best-practices)
