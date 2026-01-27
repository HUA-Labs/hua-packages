# Turbo 캐시 최적화 가이드

**작성일**: 2025-12-25  
**목적**: Turbo 캐시를 활용하여 빌드 시간 및 Vercel 비용 절감

---

## 📋 개요

Turbo 캐시는 빌드 결과를 저장하여 재사용함으로써 빌드 시간을 단축하고 Vercel 비용을 절감합니다.

### 현재 상황
- **On-Demand Concurrent Build Minutes**: $15.02 (가장 큰 비용)
- **문제**: 불필요한 빌드로 인한 비용 증가
- **해결**: Turbo 캐시 + `ignoreCommand` 조합으로 최적화

---

## 🔍 Turbo 캐시 작동 원리

### 기본 개념

1. **빌드 결과 저장**: 빌드 완료 후 결과물과 메타데이터를 캐시에 저장
2. **변경 감지**: 입력 파일(소스 코드, 의존성 등) 변경 여부 확인
3. **캐시 히트**: 변경이 없으면 저장된 결과를 재사용
4. **캐시 미스**: 변경이 있으면 새로 빌드

### 캐시 키 생성 요소

- 소스 코드 해시
- 의존성 해시 (`package.json`, `pnpm-lock.yaml`)
- 환경 변수 해시
- 빌드 설정 해시 (`turbo.json`, `next.config.ts` 등)

---

## 🎯 모노레포에서의 효과

### 의존성 그래프 활용

```
packages/hua-ui (변경 없음) → 캐시 재사용 ✅
  └─> apps/my-app (변경 있음) → 새로 빌드
```

**효과**:
- 변경된 패키지만 빌드
- 의존 패키지는 캐시 재사용
- 빌드 시간 대폭 단축

### 실제 효과 예시

#### 시나리오 1: 패키지만 변경
```
변경: packages/hua-ui/src/Button.tsx
결과:
- hua-ui: 새로 빌드 (5분)
- my-app: 캐시 재사용 (10초) ← 이전에는 5분 걸렸음
```

#### 시나리오 2: 앱만 변경
```
변경: apps/my-app/app/page.tsx
결과:
- hua-ui: 캐시 재사용 (즉시)
- my-app: 새로 빌드 (5분)
```

---

## ⚙️ Vercel에서의 활용

### 로컬 캐시 vs 원격 캐시

#### 1. 로컬 캐시 (기본)
- **위치**: Vercel 빌드 환경 내부에 저장
- **범위**: 동일 빌드 세션 내에서만 공유
- **장점**: 추가 설정 불필요
- **단점**: 빌드 간 캐시 공유 불가

#### 2. 원격 캐시 (Remote Caching)
- **위치**: Vercel의 Remote Caching 서비스
- **범위**: 팀/프로젝트 간 공유
- **장점**: 
  - 다른 브랜치/PR에서도 캐시 재사용
  - 팀원 간 빌드 결과 공유
  - CI/CD에서도 동일 캐시 활용
- **단점**: 추가 설정 필요

### Remote Caching 설정 시 효과

- **다른 브랜치**: `main`에서 빌드한 결과를 `feature` 브랜치에서 재사용
- **PR 빌드**: 기존 빌드 결과 재사용으로 빠른 피드백
- **팀 협업**: 한 명이 빌드하면 다른 팀원도 캐시 활용

---

## 💰 Vercel 비용 절감 효과

### 빌드 시간 단축

| 상황 | 이전 (캐시 없음) | 이후 (캐시 활용) | 절감률 |
|------|------------------|-----------------|--------|
| 전체 빌드 | 10-15분 | 10-15분 | 0% |
| 패키지만 변경 | 10-15분 | 5-7분 | 50% |
| 앱만 변경 | 10-15분 | 5-7분 | 50% |
| 문서만 변경 | 10-15분 | 0분 (ignoreCommand) | 100% |

### 동시 빌드 시간 감소

- **이전**: 매번 전체 빌드 (10-15분)
- **이후**: 변경된 부분만 빌드 (2-5분)
- **절감**: 50-70% 빌드 시간 감소
- **비용 효과**: `On-Demand Concurrent Build Minutes` 비용 감소

### 예상 절감액

- **현재**: $15.02/월 (On-Demand Concurrent Build Minutes)
- **예상 절감**: 50-70% → **$7-10/월 절감**

---

## 🚀 설정 방법

### 1. 현재 설정 확인

#### turbo.json
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    }
  }
}
```

**확인 사항**:
- ✅ `dependsOn`: 의존성 빌드 순서 정의
- ✅ `outputs`: 캐시할 출력 디렉토리 정의

### 2. Remote Caching 활성화 (선택사항)

#### Vercel 대시보드 설정
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings > General
4. **Turbo Remote Caching** 활성화

#### 환경 변수 설정
```bash
# Vercel 대시보드에서 설정
TURBO_TOKEN=your-turbo-token
TURBO_TEAM=your-team-name
```

### 3. 캐시 무효화 전략

#### 자동 무효화
- 소스 코드 변경
- 의존성 변경 (`package.json`, `pnpm-lock.yaml`)
- 환경 변수 변경
- 빌드 설정 변경

#### 수동 무효화 (필요 시)
```bash
# 특정 패키지 캐시 삭제
pnpm turbo build --filter=my-app --force

# 전체 캐시 삭제
pnpm turbo build --force
```

---

## 📊 모니터링

### 캐시 히트율 확인

#### 로컬 빌드
```bash
# 캐시 히트율 확인
pnpm turbo build --filter=my-app

# 출력 예시:
# ✓ hua-ui:build (cache hit, duration 0.1s)
# ✓ my-app:build (cache miss, duration 5m 23s)
```

#### Vercel 빌드 로그
- Vercel 대시보드 > Deployments > 빌드 로그 확인
- `cache hit` 또는 `cache miss` 메시지 확인

### 캐시 효과 측정

#### 빌드 시간 비교
- **첫 빌드**: 캐시 없음 → 전체 빌드 시간
- **두 번째 빌드**: 캐시 히트 → 빌드 시간 단축 확인

---

## ⚠️ 주의사항

### 1. 캐시 무효화
- 환경 변수나 빌드 설정 변경 시 수동 무효화 필요할 수 있음
- 예: `DATABASE_URL` 변경 시 Prisma Client 재생성 필요

### 2. 캐시 크기
- 오래된 캐시는 자동 정리되지만, 저장 공간 제한 확인
- Vercel Remote Caching은 저장 공간 제한이 있을 수 있음

### 3. 디버깅
- 캐시 문제 시 캐시 비활성화로 재현 가능
- `--force` 플래그로 캐시 무시하고 빌드

### 4. 환경 변수 처리
- `turbo.json`의 `globalEnv`에 환경 변수 명시
- 환경 변수 변경 시 캐시 자동 무효화

---

## 🔧 최적화 팁

### 1. outputs 설정 최적화
```json
{
  "tasks": {
    "build": {
      "outputs": [
        ".next/**",
        "!.next/cache/**",  // 캐시 디렉토리는 제외
        "dist/**"
      ]
    }
  }
}
```

### 2. 의존성 그래프 최적화
- 불필요한 의존성 제거
- 의존성 순서 최적화 (`dependsOn` 활용)

### 3. ignoreCommand와 조합
- `ignoreCommand`: 변경이 없으면 빌드 자체를 건너뛰기
- Turbo 캐시: 변경이 있어도 의존 패키지는 캐시 재사용
- **조합 효과**: 최대 절감

---

## 📚 관련 문서

- [배포 패턴](../patterns/deployment.md)
- [환경 변수 관리](./ENVIRONMENT_VARIABLE_MANAGEMENT.md)
- [Turbo 공식 문서](https://turbo.build/repo/docs/core-concepts/caching)

---

## 🎯 다음 단계

1. ✅ `ignoreCommand` 추가 완료 (PR #84)
2. ⏸️ Remote Caching 활성화 검토
3. ⏸️ 캐시 히트율 모니터링
4. ⏸️ 추가 최적화 적용

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-25

