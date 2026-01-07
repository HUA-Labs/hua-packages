# i18n-beginner v2 설계 (i18n-core 기반)

## 목표

i18n-core를 기반으로 **딸깍** 사용할 수 있는 초보자용 패키지

## 핵심 원칙

1. **한 줄로 시작**: `<SimpleI18n>{children}</SimpleI18n>`
2. **기본 번역 포함**: ko, en 기본 제공
3. **최소 설정**: 설정 없이 바로 사용
4. **i18n-core 기반**: 모든 고급 기능은 i18n-core로 확장 가능

## API 설계

### 1. Provider (한 줄)

```tsx
import { SimpleI18n } from '@hua-labs/i18n-beginner';

function App() {
  return (
    <SimpleI18n>
      <YourApp />
    </SimpleI18n>
  );
}
```

### 2. Hook (간단한 사용)

```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function MyComponent() {
  const { t, toggleLanguage, languageButtonText } = useSimpleI18n();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

### 3. 언어 추가 (간단)

```tsx
const { addLanguage } = useSimpleI18n();

addLanguage('ja', {
  welcome: 'ようこそ',
  hello: 'こんにちは'
});
```

## 내부 구현

### i18n-core 래핑

```tsx
import { createCoreI18n } from '@hua-labs/i18n-core';
import { defaultTranslations } from './default-translations';

export function SimpleI18n({ children }: { children: React.ReactNode }) {
  const I18nProvider = useMemo(() => {
    return createCoreI18n({
      defaultLanguage: 'ko',
      fallbackLanguage: 'en',
      namespaces: ['common'],
      initialTranslations: defaultTranslations, // ko, en 기본 포함
      translationLoader: 'custom',
      loadTranslations: async (language, namespace) => {
        // 메모리에서 로드 (addLanguage로 추가된 언어)
        return translations[language]?.[namespace] || {};
      },
    });
  }, []);

  return <I18nProvider>{children}</I18nProvider>;
}
```

## 기본 번역 데이터

- ko: 한국어 기본 번역 (80+ 키)
- en: 영어 기본 번역 (80+ 키)

## 마이그레이션 경로

기존 beginner 사용자:
- API는 거의 동일 (하위 호환)
- 내부는 i18n-core 기반으로 완전히 재작성
- 더 안정적이고 확장 가능

## 장점

1. **i18n-core 기반**: 모든 고급 기능 사용 가능
2. **간단한 API**: 초보자도 바로 사용
3. **확장 가능**: 필요시 i18n-core로 직접 마이그레이션
4. **안정성**: i18n-core의 검증된 코드 사용






