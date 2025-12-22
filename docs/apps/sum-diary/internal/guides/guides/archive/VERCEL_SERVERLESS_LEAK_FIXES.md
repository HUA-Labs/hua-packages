# Vercel 서버리스 환경 누수 방지 수정 사항

## 📅 날짜
2025-12-15

## 🎯 목적
Vercel 서버리스 환경에서 발생할 수 있는 메모리 누수 및 리소스 누수 방지

## ⚠️ 발견된 잠재적 누수 문제

### 1. 메모리 캐시 누수 (중요)

#### 문제
- `user-settings-server.ts`: `userSettingsCache` Map이 무한정 증가할 수 있음
- `rate-limit.ts`: `userRateLimitMap`, `ipRateLimitMap`이 무한정 증가할 수 있음
- 서버리스 환경에서 함수가 재사용될 때 캐시가 계속 쌓임

#### 영향
- 메모리 사용량 증가
- 서버리스 함수 메모리 제한 초과 가능성
- 성능 저하

### 2. Prisma 연결 풀 최적화 필요

#### 현재 설정
- 연결 풀 크기: 10
- 서버리스 환경에서는 과도할 수 있음

#### 권장
- Vercel 서버리스: 연결 풀 크기 1-2 권장
- 각 함수 실행마다 새로운 인스턴스가 생성될 수 있음

## ✅ 해결 방법

### 1. 메모리 캐시 TTL 추가

#### user-settings-server.ts
- 캐시 엔트리에 TTL 추가
- Lazy Cleanup 패턴 적용 (요청 시 확률적으로 정리)
- ⚠️ 주의: 서버리스 환경에서는 각 인스턴스마다 별도의 메모리를 가지므로 캐시가 공유되지 않음

#### rate-limit.ts
- `setInterval` 제거 (서버리스에서 작동하지 않음)
- Lazy Cleanup 패턴 적용 (요청 시 확률적으로 정리)
- ⚠️ 주의: 서버리스 환경에서는 각 인스턴스마다 별도의 메모리를 가지므로 Rate Limit이 공유되지 않음

### 2. Prisma 연결 풀 최적화

#### 서버리스 환경 감지
- `VERCEL` 환경 변수 확인
- 서버리스 환경에서는 연결 풀 크기 감소

## 📋 수정 사항

### 수정된 파일
1. `apps/my-app/app/lib/user-settings-server.ts` - 캐시 TTL 추가
2. `apps/my-app/app/lib/rate-limit.ts` - 오래된 엔트리 정리
3. `apps/my-app/app/lib/prisma.ts` - 서버리스 환경 연결 풀 최적화

## 🔍 확인된 안전한 부분

### ✅ 잘 관리되고 있는 부분
1. **타이머/인터벌**: 클라이언트 사이드에서 `useEffect` cleanup으로 잘 처리됨
2. **이벤트 리스너**: 클라이언트 사이드에서 cleanup으로 잘 처리됨
3. **SSE 연결**: EventSource cleanup이 잘 처리됨
4. **Redis 연결**: 싱글톤 패턴으로 잘 관리됨
5. **KeyManager**: 싱글톤 패턴, 작은 고정 크기 Map

## ⚠️ 서버리스 환경 특성 이해

### 1. 인메모리 캐시의 한계
- **각 인스턴스마다 별도의 메모리**: 서버리스 함수는 동시에 여러 인스턴스가 실행됨
- **캐시 공유 불가**: 인스턴스 A에 저장된 캐시는 인스턴스 B에서 접근 불가
- **해결책**: TTL을 짧게 설정하여 메모리 누수 방지, 완벽한 캐싱은 기대하지 않음

### 2. setInterval의 한계
- **함수 동결**: 서버리스 함수는 요청 처리 후 즉시 동결(Freeze) 상태가 됨
- **타이머 미작동**: 동결된 함수에서는 `setInterval`이 실행되지 않음
- **해결책**: Lazy Cleanup 패턴 사용 (요청이 들어올 때 확률적으로 정리)

## 📚 참고 자료

- [Vercel Serverless Functions Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Prisma Serverless Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments)
