# @hua-labs/i18n-loaders

프로덕션 환경에서 바로 사용할 수 있는 번역 로더, 캐싱, 프리로딩 유틸리티 모음입니다. `@hua-labs/i18n-core`와 함께 사용하면 PaysByPays, SUM API에서 검증된 로딩 전략을 그대로 재사용할 수 있습니다.

## 주요 기능

- API 기반 번역 로더 (`createApiTranslationLoader`)
- TTL/전역 캐시/중복 요청 방지 내장
- 네임스페이스 프리로딩 & 폴백 언어 워밍
- 기본 번역(JSON) 병합 기능 (SUM API 스타일)
- 서버/클라이언트 어디서든 동작

## 설치

```bash
pnpm add @hua-labs/i18n-loaders
# 또는
npm install @hua-labs/i18n-loaders
```

## 빠른 사용 예시

```ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000,
  enableGlobalCache: true
});

export const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard'],
  loadTranslations
});

// 앱 시작 시 필요한 네임스페이스를 미리 로드
preloadNamespaces('ko', ['common', 'dashboard'], loadTranslations);
```

## 문서

- [API 레퍼런스](../../docs/I18N_CORE_API_REFERENCE.md)
- [로더 가이드](../../docs/I18N_CORE_LOADERS.md)
- [성능 최적화 가이드](../../docs/I18N_CORE_PERFORMANCE_GUIDE.md)
- [PaysByPays 적용 사례](../../docs/I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md)

## 라이선스

MIT License

