# Goal Tree - i18n-core 기본 로더 서버사이드 개선

**작성일**: 2025-12-23  
**상태**: 완료

---

## 문제 상황

현재 `@hua-labs/i18n-core`의 기본 API 로더(`translationLoader: 'api'`)는 서버사이드에서 제한적으로 작동합니다:

```typescript
// packages/hua-i18n-core/src/index.ts
const apiRouteLoader = async (language: string, namespace: string) => {
  try {
    // 클라이언트 사이드에서만 동적 로드
    if (typeof window !== 'undefined') {
      const apiUrl = `${translationApiPath}/${language}/${namespace}`;
      const response = await fetch(apiUrl);
      // ...
    }
    
    // SSR 또는 API 실패 시 기본 번역 반환
    return getDefaultTranslations(language, namespace);
  } catch (error) {
    return getDefaultTranslations(language, namespace);
  }
};
```

**문제점**:
- 서버사이드에서 API 호출 불가 (항상 기본 번역만 반환)
- `createApiTranslationLoader`는 서버사이드 지원이 있지만 기본 로더는 없음
- 서버사이드에서 번역을 로드하려면 `createApiTranslationLoader`를 사용해야 함

---

## 목표

기본 API 로더에 서버사이드 지원을 추가하여 `createApiTranslationLoader`와 동일한 수준의 기능 제공

---

## 해결 전략

### 1. `createApiTranslationLoader`의 서버사이드 로직 참고

`@hua-labs/i18n-loaders`의 `createApiTranslationLoader`는 이미 서버사이드를 지원합니다:

```typescript
const buildUrl = (language: string, namespace: string) => {
  const path = `${translationApiPath}/${language}/${safeNamespace}`;
  
  if (typeof window !== 'undefined') {
    return path; // 클라이언트: 상대 경로
  }
  
  // 서버사이드: 절대 URL 필요
  if (options.baseUrl) {
    return `${options.baseUrl}${path}`;
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
  }
  
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return `${vercelUrl}${path}`;
  }
  
  const fallbackBase = options.localFallbackBaseUrl ?? 'http://localhost:3000';
  return `${fallbackBase}${path}`;
};
```

### 2. 기본 로더에 서버사이드 지원 추가

**옵션 1: `baseUrl` 옵션 추가**
- `I18nConfig`에 `baseUrl?: string` 옵션 추가
- 서버사이드에서 절대 URL 생성

**옵션 2: 환경 변수 자동 감지**
- `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL` 자동 감지
- 추가 설정 없이 서버사이드 작동

**옵션 3: 하이브리드 접근**
- `baseUrl` 옵션 우선
- 없으면 환경 변수 자동 감지
- 모두 없으면 기본값 사용

---

## 작업 항목

### 1. 타입 정의 수정
- [x] `createCoreI18n` 옵션에 `baseUrl?: string` 옵션 추가
- [x] `localFallbackBaseUrl?: string` 옵션 추가 (개발 환경용)

### 2. 기본 로더 로직 개선
- [x] `buildUrl` 함수 추가 (서버사이드 URL 생성)
- [x] 환경 변수 자동 감지 로직 추가 (`NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`)
- [x] 서버사이드 fetch 로직 추가 (클라이언트 체크 제거)

### 3. 테스트
- [x] 서버사이드 번역 로드 테스트 (코드 레벨 확인 완료, `initialTranslations`로 최적화되어 API 호출 스킵)
- [x] 클라이언트 사이드 번역 로드 테스트 (기존 기능 유지 확인)
- [x] 환경 변수 자동 감지 테스트 (코드 레벨 확인 완료)
- [x] 런타임 테스트 (SSR 번역 데이터 로드, 하이드레이션 완료 확인)

### 4. 문서화
- [x] GT 문서 작성
- [ ] API 문서 업데이트 (선택적)
- [ ] 서버사이드 사용 예시 추가 (선택적)

---

## 기술적 세부사항

### URL 빌드 로직

```typescript
const buildUrl = (
  translationApiPath: string,
  language: string,
  namespace: string,
  baseUrl?: string,
  localFallbackBaseUrl?: string
): string => {
  const safeNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, '');
  const path = `${translationApiPath}/${language}/${safeNamespace}`;
  
  // 클라이언트 사이드: 상대 경로
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // 서버사이드: 절대 URL 필요
  if (baseUrl) {
    return `${baseUrl}${path}`;
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
  }
  
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return `${vercelUrl}${path}`;
  }
  
  const fallbackBase = localFallbackBaseUrl ?? 'http://localhost:3000';
  return `${fallbackBase}${path}`;
};
```

### 기본 로더 수정

```typescript
const apiRouteLoader = async (
  language: string,
  namespace: string,
  translationApiPath: string,
  baseUrl?: string,
  localFallbackBaseUrl?: string
) => {
  try {
    const apiUrl = buildUrl(
      translationApiPath,
      language,
      namespace,
      baseUrl,
      localFallbackBaseUrl
    );
    
    const response = await fetch(apiUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (debug) {
        console.log(`✅ Loaded translation from API: ${language}/${namespace}`);
      }
      return data;
    } else if (response.status === 404) {
      if (debug) {
        console.warn(`⚠️ Translation not found in API: ${language}/${namespace}`);
      }
    }
    
    // API 실패 시 기본 번역 반환
    return getDefaultTranslations(language, namespace);
  } catch (error) {
    if (debug) {
      console.warn(`Failed to load translation from API: ${language}/${namespace}`, error);
    }
    return getDefaultTranslations(language, namespace);
  }
};
```

---

## 다음 단계

1. **새 스택 생성**: `gt create -m "feat(i18n-core): add server-side support to default API loader"`
2. **타입 정의 수정**: `I18nConfig`에 옵션 추가
3. **로더 로직 개선**: 서버사이드 URL 빌드 추가
4. **테스트 작성**: 서버사이드/클라이언트 사이드 테스트
5. **문서화**: API 문서 및 사용 예시 업데이트

---

## 참고 자료

- `packages/hua-i18n-loaders/src/api-loader.ts` - 서버사이드 구현 참고
- `packages/hua-i18n-core/src/index.ts` - 기본 로더 현재 구현
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

