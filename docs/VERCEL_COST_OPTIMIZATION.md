# Vercel 비용 최적화 가이드

**작성일**: 2025-12-26  
**목적**: Vercel 빌드 비용 절감 (1주일만에 $15-20 사용 문제 해결)

---

## 📊 현재 상황

- **1주일 사용량**: $15-20
- **주요 비용**: On-Demand Concurrent Build Minutes
- **원인**: 빌드 실패로 인한 재시도 + 불필요한 Preview 배포

---

## 🎯 최적화 전략

### 1. ignoreCommand 활용 (✅ 이미 설정됨)

**목적**: 변경이 없는 경우 빌드 스킵

**현재 설정**:
```json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- apps/my-app packages/..."
}
```

**효과**:
- 문서만 변경 시 빌드 스킵
- 다른 앱 변경 시 해당 앱 빌드 스킵
- **예상 절감**: 30-50% 빌드 시간 감소

### 2. Preview 배포 제한

**Vercel 대시보드 설정**:
1. Project Settings → Git
2. "Deploy Preview" 설정
3. 특정 브랜치만 Preview 생성 (예: `main` 브랜치만)

**또는 vercel.json에 추가**:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "previews": false  // Preview 비활성화 (필요시만)
    }
  }
}
```

### 3. 빌드 실패 시 자동 재시도 제한

**문제**: 빌드 실패 시 자동으로 재시도하여 비용 증가

**해결**:
- Vercel 대시보드에서 재시도 설정 확인
- 수동으로 재시도하도록 변경
- 또는 재시도 횟수 제한

### 4. Turbo 캐시 활용

**현재 상태**: Turbo 캐시 설정됨

**확인 사항**:
- Remote Caching 활성화 여부
- 캐시 히트율 확인

**효과**:
- 변경 없는 패키지는 캐시 재사용
- **예상 절감**: 50-70% 빌드 시간 감소

---

## 💰 예상 절감 효과

| 최적화 항목 | 현재 | 최적화 후 | 절감률 |
|------------|------|----------|--------|
| ignoreCommand | 100% | 50-70% | 30-50% |
| Turbo 캐시 | 100% | 30-50% | 50-70% |
| Preview 제한 | 100% | 30-50% | 50-70% |
| **합계** | **$15-20/주** | **$5-8/주** | **60-70%** |

---

## 🚀 즉시 적용 가능한 조치

### 1. Preview 배포 제한

**Vercel 대시보드**:
1. Project Settings → Git
2. "Deploy Preview" → "Only for production branch" 선택

### 2. 빌드 실패 알림 설정

**목적**: 빌드 실패를 빠르게 감지하여 수동 재시도

**설정**:
- Vercel 대시보드 → Notifications
- 빌드 실패 시 Slack/Email 알림 설정

### 3. 빌드 시간 모니터링

**Vercel 대시보드**:
- Analytics → Builds
- 빌드 시간 추이 확인
- 비정상적으로 긴 빌드 식별

---

## ⚠️ 주의사항

### 1. ignoreCommand 주의

**현재 설정**:
```json
"ignoreCommand": "git diff --quiet HEAD^ HEAD -- apps/my-app packages/..."
```

**동작**:
- 명시된 경로에 변경이 없으면 빌드 스킵
- 변경이 있으면 빌드 실행

**주의**:
- 환경 변수 변경 시에도 빌드 필요
- 의존성 변경 시에도 빌드 필요

### 2. Preview 배포 제한 시

**장점**:
- 불필요한 Preview 배포 감소
- 비용 절감

**단점**:
- PR 테스트가 어려워질 수 있음
- 필요 시 수동으로 Preview 생성 필요

---

## 📝 체크리스트

### 즉시 적용
- [x] ignoreCommand 설정 확인
- [ ] Preview 배포 제한 설정
- [ ] 빌드 실패 알림 설정
- [ ] 빌드 시간 모니터링 설정

### 추가 최적화
- [ ] Remote Caching 활성화 확인
- [ ] 빌드 캐시 히트율 확인
- [ ] 불필요한 빌드 트리거 제거

---

## 🔗 참고

- [Turbo 캐시 최적화 가이드](./TURBO_CACHE_OPTIMIZATION.md)
- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel 비용 관리](https://vercel.com/docs/billing)

