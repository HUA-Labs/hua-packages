# GT: i18n SSR 함수 전달 문제 해결

**작성일**: 2025-12-07  
**상태**: 진행 중  
**우선순위**: 높음

---

## 목표

Next.js 15에서 Server Component에서 Client Component로 함수를 전달하는 문제를 해결하고, SSR 지원을 유지하면서 i18n 설정을 최적화합니다.

---

## 문제 상황

### 에러 메시지
```
Runtime Error
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
```

### 발생 위치
- `apps/my-app/app/components/layout/providers.tsx` (33:7)
- `apps/my-app/app/lib/i18n-config.ts`에서 `loadTranslations` 함수 전달

### 원인
- `createApiTranslationLoader`로 생성한 함수를 `translationLoader: 'custom'`과 함께 사용
- Server Component(`layout.tsx`)에서 Client Component로 함수 전달 시도
- Next.js 15에서는 함수를 직접 전달할 수 없음 (Server Action이 아닌 경우)

---

## 해결 전략

### 단계 1: 기본 해결 (완료)
- ✅ `translationLoader: 'api'` 사용
- ✅ `loadTranslations` 함수 전달 제거
- ✅ SSR 지원 유지

### 단계 2: 최적화 검토 (예정)
- [ ] `createApiTranslationLoader`의 고급 캐싱 기능이 필요한지 확인
- [ ] 필요시 패키지에 `translationLoader: 'api'`에 캐싱 옵션 추가 제안
- [ ] 또는 클라이언트 컴포넌트 내부에서만 로더 생성하는 방법 검토

---

## 작업 항목

### ✅ 완료된 작업
1. [x] `i18n-config.ts`에서 `translationLoader: 'api'`로 변경
2. [x] `loadTranslations` 함수 전달 제거
3. [x] `createApiTranslationLoader` import 제거
4. [x] 린트 오류 확인

### 🔄 진행 중인 작업
- 없음

### 📋 예정된 작업
1. [ ] 패턴 문서화 (Next.js 15 함수 전달 문제)
2. [ ] 데브로그 작성
3. [ ] 테스트 및 검증

---

## 기술적 세부사항

### 변경 전
```typescript
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000,
});

export const I18nProvider = createZustandI18n(useAppStore, {
  translationLoader: 'custom',
  loadTranslations, // ❌ 함수 전달 문제
});
```

### 변경 후
```typescript
export const I18nProvider = createZustandI18n(useAppStore, {
  translationLoader: 'api', // ✅ 내부적으로 처리
  translationApiPath: '/api/translations',
});
```

### 장점
- ✅ SSR 지원 유지
- ✅ 함수 전달 문제 해결
- ✅ 코드 간소화

### 단점
- ⚠️ `createApiTranslationLoader`의 고급 캐싱 기능 사용 불가
  - TTL 캐싱
  - 중복 요청 방지
  - 전역 캐시

---

## 관련 스킬 참고

- `.cursor/skills/error-handling/SKILL.md` - 에러 처리 패턴
- `.cursor/skills/define-types/SKILL.md` - 타입 정의 가이드
- `.cursor/skills/document-patterns/SKILL.md` - 패턴 문서화

---

## 다음 단계

1. **테스트 및 검증**
   - 개발 서버에서 런타임 에러 확인
   - 번역 기능 정상 작동 확인
   - SSR 동작 확인

2. **패턴 문서화**
   - `docs/patterns/nextjs-function-passing.md` 생성
   - 문제 상황, 원인, 해결 방법 기록

3. **데브로그 작성**
   - 문제 해결 과정 기록
   - 학습한 내용 정리

---

## 참고 자료

- Next.js 15 Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- i18n-core 패키지: `packages/hua-i18n-core/src/index.ts`
- i18n-loaders 패키지: `packages/hua-i18n-loaders/src/api-loader.ts`

---

## 체크리스트

- [x] 문제 원인 파악
- [x] 해결 방법 결정
- [x] 코드 수정
- [x] 린트 오류 확인
- [ ] 런타임 테스트
- [ ] 패턴 문서화
- [ ] 데브로그 작성

