# @hua-labs/i18n-beginner

[한국어](#korean) | [English](./README_EN.md)

## **이 SDK는 초보자용입니다!**

> 데모 보기 | 기여는 [SDK 레포](https://github.com/HUA-Labs/HUA-Labs-public)에서

> 고급 기능이 필요하시다면?  
> - **초보자용**: `@hua-labs/i18n-beginner` (현재 패키지) - 간단하고 직관적
> - **고급자용**: `@hua-labs/i18n-sdk` - 완전한 기능, 플러그인, 고급 설정
> - **전문가용**: `@hua-labs/i18n-advanced` - 커스텀 로더, 성능 최적화, 엔터프라이즈 기능

**이 SDK는 "30초 만에 시작"을 목표로 만들어졌습니다!**

---

## English

**The simplest internationalization SDK for React beginners!**

A beginner-friendly i18n SDK that supports Korean and English out of the box, with easy support for additional languages.

### Features
- **Zero Configuration**: Works out of the box with Korean and English
- **Easy Language Addition**: Add any language with simple functions
- **TypeScript Support**: Full type safety and IntelliSense
- **Next.js Compatible**: Works perfectly with App Router and Pages Router
- **No External Dependencies**: Lightweight and fast
- **80+ Built-in Translations**: Common UI elements pre-translated

### Quick Start (30 seconds)
```bash
npm install @hua-labs/i18n-beginner
```

```tsx
// app/layout.tsx
import { SimpleI18n } from '@hua-labs/i18n-beginner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SimpleI18n>
          {children}
        </SimpleI18n>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
'use client';
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

export default function Home() {
  const { t, toggleLanguage, languageButtonText } = useSimpleI18n();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello')}</p>
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

### Adding Other Languages
```tsx
// Add Japanese
useEffect(() => {
  addTranslation('ja', 'welcome', 'ようこそ');
  addTranslation('ja', 'hello', 'こんにちは');
}, []);

// Or use TypeScript files
const japaneseTranslations = {
  ja: {
    welcome: "ようこそ",
    hello: "こんにちは"
  }
} as const;

useTranslationsFromFile(japaneseTranslations);
```

---

## Korean

**React 초보자를 위한 가장 간단한 다국어 지원 SDK!**

한국어와 영어를 기본으로 지원하며, 다른 언어도 쉽게 추가할 수 있는 초보자 친화적인 i18n SDK입니다.

### 특징
- **설정 불필요**: 한국어/영어 즉시 사용 가능
- **언어 추가 쉬움**: 간단한 함수로 어떤 언어든 추가
- **TypeScript 지원**: 완전한 타입 안정성과 자동완성
- **Next.js 호환**: App Router와 Pages Router 완벽 지원
- **외부 의존성 없음**: 가볍고 빠름
- **80개+ 기본 번역**: 일반적인 UI 요소 미리 번역됨

### 30초 만에 시작하기

#### 1단계: 설치하기
```bash
npm install @hua-labs/i18n-beginner
```

#### 2단계: 설정하기
```tsx
// app/layout.tsx (또는 pages/_app.tsx)
import { SimpleI18n } from '@hua-labs/i18n-beginner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SimpleI18n>
          {children}
        </SimpleI18n>
      </body>
    </html>
  );
}
```

#### 3단계: 사용하기
```tsx
// app/components/MyComponent.tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

export default function MyComponent() {
  const { t, toggleLanguage, languageButtonText } = useSimpleI18n();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello')}</p>
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

#### 4단계: TypeScript 파일로 번역 분리하기 (선택사항)
```tsx
// translations/myTranslations.ts
export const myTranslations = {
  ko: {
    welcome_message: "환영합니다",
    goodbye_message: "안녕히 가세요"
  },
  en: {
    welcome_message: "Welcome",
    goodbye_message: "Goodbye"
  }
} as const;

// app/components/MyComponent.tsx
import { useSimpleI18n, useTranslationsFromFile } from '@hua-labs/i18n-beginner';
import { myTranslations } from '../translations/myTranslations';

export default function MyComponent() {
  const { t, toggleLanguage, languageButtonText } = useSimpleI18n();
  
  // TypeScript 파일에서 번역 자동 로드
  useTranslationsFromFile(myTranslations);

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('welcome_message')}</p> {/* TypeScript 파일에서 로드된 번역 */}
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

**끝!** 이제 한국어/영어 자동 전환이 완성되었습니다!

---

## 다국어 지원 안내

### 현재 지원 언어
- **한국어 (ko)**: 기본 지원
- **영어 (en)**: 기본 지원

### 다른 언어 추가하기

현재 SDK는 한국어와 영어만 기본으로 지원하지만, 다른 언어도 쉽게 추가할 수 있습니다!

#### 방법 1: 동적으로 언어 추가하기
```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function MyComponent() {
  const { addTranslation } = useSimpleI18n();
  
  // 일본어 추가
  useEffect(() => {
    addTranslation('ja', 'welcome', 'ようこそ');
    addTranslation('ja', 'hello', 'こんにちは');
    addTranslation('ja', 'goodbye', 'さようなら');
  }, []);
  
  return <div>{t('welcome')}</div>;
}
```

#### 방법 2: TypeScript 파일로 언어 추가하기
```tsx
// translations/japanese.ts
export const japaneseTranslations = {
  ja: {
    welcome: "ようこそ",
    hello: "こんにちは",
    goodbye: "さようなら",
    email: "メールアドレス",
    password: "パスワード",
    submit: "送信"
  }
} as const;

// 컴포넌트에서 사용
import { useTranslationsFromFile } from '@hua-labs/i18n-beginner';
import { japaneseTranslations } from './translations/japanese';

function MyComponent() {
  const { t } = useSimpleI18n();
  useTranslationsFromFile(japaneseTranslations);
  
  return <div>{t('welcome')}</div>;
}
```

#### 방법 3: 언어별 파일로 분리하기
```tsx
// translations/spanish.ts
export const spanishTranslations = {
  es: {
    welcome: "Bienvenido",
    hello: "Hola",
    goodbye: "Adiós"
  }
} as const;

// translations/french.ts
export const frenchTranslations = {
  fr: {
    welcome: "Bienvenue",
    hello: "Bonjour",
    goodbye: "Au revoir"
  }
} as const;

// translations/german.ts
export const germanTranslations = {
  de: {
    welcome: "Willkommen",
    hello: "Hallo",
    goodbye: "Auf Wiedersehen"
  }
} as const;
```

### 언어 코드 참고

| 언어 | 코드 | 예시 |
|------|------|------|
| 한국어 | `ko` | 안녕하세요 |
| 영어 | `en` | Hello |
| 일본어 | `ja` | こんにちは |
| 중국어 (간체) | `zh-CN` | 你好 |
| 중국어 (번체) | `zh-TW` | 你好 |
| 스페인어 | `es` | Hola |
| 프랑스어 | `fr` | Bonjour |
| 독일어 | `de` | Hallo |
| 이탈리아어 | `it` | Ciao |
| 포르투갈어 | `pt` | Olá |
| 러시아어 | `ru` | Привет |
| 아랍어 | `ar` | مرحبا |

### 언어 전환 기능 확장하기

여러 언어를 지원하려면 언어 선택 UI를 만들어보세요:

```tsx
function LanguageSelector() {
  const { setLanguage, language } = useSimpleI18n();
  
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];
  
  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 📝 기여하기

더 많은 언어를 기본으로 지원하고 싶다면:

1. **GitHub Issues**에 언어 추가 요청
2. **Pull Request**로 번역 파일 제출
3. **커뮤니티 기여**로 SDK 발전에 참여

> 팁: 언어별 번역 파일을 만들어서 공유하면 다른 개발자들도 쉽게 사용할 수 있어요!

---

## 📋 완전 초보자용 체크리스트

### 1단계: 설치 확인
```bash
# 터미널에서 이 명령어를 실행했나요?
npm install @hua-labs/i18n-beginner
```
> ❓ **확인 방법**: `package.json` 파일에 `"@hua-labs/i18n-beginner"`가 있는지 확인하세요.

### 2단계: Provider 설정 확인
```tsx
// 이 코드가 layout.tsx에 있나요?
import { SimpleI18n } from '@hua-labs/i18n-beginner';

<SimpleI18n>
  {children}
</SimpleI18n>
```
> ❓ **확인 방법**: 페이지가 로드될 때 오류가 없다면 성공이에요!

### 3단계: 컴포넌트에서 사용 확인
```tsx
// 이 코드가 컴포넌트에 있나요?
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

const { t, toggleLanguage, languageButtonText } = useSimpleI18n();
```
> ❓ **확인 방법**: 버튼을 클릭했을 때 언어가 바뀌나요?

---

## 🧪 실제 테스트 결과

### 테스트 완료 항목들:
- [x] 한국어 → 영어 전환
- [x] 영어 → 한국어 전환  
- [x] 페이지 새로고침 후 언어 유지
- [x] 기본 번역 키들 정상 작동
- [x] 커스텀 번역 추가 기능
- [x] TypeScript 파일 번역 로드
- [x] 하이드레이션 오류 없음
- [x] 무한 루프 오류 없음

### 테스트 환경:
- **프레임워크**: Next.js 15
- **언어**: 한국어, 영어, TypeScript 파일 번역
- **브라우저**: Chrome, Firefox, Safari
- **기기**: 데스크톱, 모바일

---

## 기본 제공 번역 키들

### 기본 인사말
```tsx
t('welcome')     // "환영합니다" / "Welcome"
t('hello')       // "안녕하세요" / "Hello"
t('click_me')    // "클릭하세요" / "Click me"
```

### 상태 메시지
```tsx
t('loading')     // "로딩 중..." / "Loading..."
t('error')       // "오류가 발생했습니다" / "An error occurred"
t('success')     // "성공했습니다" / "Success"
```

### 🎛️ 버튼 텍스트
```tsx
t('cancel')      // "취소" / "Cancel"
t('confirm')     // "확인" / "Confirm"
t('save')        // "저장" / "Save"
t('delete')      // "삭제" / "Delete"
t('edit')        // "편집" / "Edit"
t('add')         // "추가" / "Add"
```

### 🔍 검색 및 네비게이션
```tsx
t('search')      // "검색" / "Search"
t('back')        // "뒤로" / "Back"
t('next')        // "다음" / "Next"
t('home')        // "홈" / "Home"
t('about')       // "소개" / "About"
t('contact')     // "연락처" / "Contact"
```

### ⚙️ 설정 및 사용자
```tsx
t('settings')    // "설정" / "Settings"
t('profile')     // "프로필" / "Profile"
t('logout')      // "로그아웃" / "Logout"
t('login')       // "로그인" / "Login"
t('register')    // "회원가입" / "Register"
```

### 📝 폼 필드
```tsx
t('email')       // "이메일" / "Email"
t('password')    // "비밀번호" / "Password"
t('name')        // "이름" / "Name"
t('phone')       // "전화번호" / "Phone"
t('address')     // "주소" / "Address"
```

### 액션 버튼
```tsx
t('submit')      // "제출" / "Submit"
t('reset')       // "초기화" / "Reset"
t('close')       // "닫기" / "Close"
t('open')        // "열기" / "Open"
t('yes')         // "예" / "Yes"
t('no')          // "아니오" / "No"
t('ok')          // "확인" / "OK"
```

### 긴 메시지
```tsx
t('loading_text')        // "잠시만 기다려주세요..." / "Please wait..."
t('error_message')       // "문제가 발생했습니다. 다시 시도해주세요." / "An error occurred. Please try again."
t('success_message')     // "성공적으로 완료되었습니다!" / "Successfully completed!"
t('not_found')          // "찾을 수 없습니다" / "Not found"
t('unauthorized')       // "권한이 없습니다" / "Unauthorized"
t('forbidden')          // "접근이 거부되었습니다" / "Forbidden"
t('server_error')       // "서버 오류가 발생했습니다" / "Server error occurred"
```

> 사용 팁:  
> 이 키들을 그대로 복사해서 `t('키이름')` 형태로 사용하세요!  
> 예: `t('welcome')` → "환영합니다" 또는 "Welcome"

---

## 📝 커스텀 번역 추가하기

기본 번역 외에 추가 번역이 필요하다면 여러 가지 방법이 있어요!

### 방법 1: 동적으로 번역 추가하기
```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function MyComponent() {
  const { t, toggleLanguage, languageButtonText, addTranslation } = useSimpleI18n();
  
  // 번역 추가하기
  const addCustomTranslations = () => {
    addTranslation('ko', 'custom_message', '커스텀 메시지');
    addTranslation('en', 'custom_message', 'Custom message');
  };
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello')}</p>
      <p>{t('custom_message')}</p> {/* 커스텀 번역 사용 */}
      <button onClick={addCustomTranslations}>번역 추가</button>
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

### 📁 방법 2: TypeScript 파일로 번역 분리하기 (추천!)

**1단계: 번역 파일 만들기**
```tsx
// translations/myTranslations.ts
export const myTranslations = {
  ko: {
    welcome_message: "환영합니다",
    goodbye_message: "안녕히 가세요",
    custom_button: "커스텀 버튼",
    about_us: "우리에 대해",
    contact_info: "연락처 정보"
  },
  en: {
    welcome_message: "Welcome",
    goodbye_message: "Goodbye", 
    custom_button: "Custom Button",
    about_us: "About Us",
    contact_info: "Contact Information"
  }
} as const;
```

**2단계: 컴포넌트에서 사용하기**
```tsx
import { useSimpleI18n, loadTranslationsFromFile } from '@hua-labs/i18n-beginner';
import { myTranslations } from './translations/myTranslations';

function MyComponent() {
  const { t, addTranslation } = useSimpleI18n();
  
  // 컴포넌트 마운트 시 번역 파일 로드
  useEffect(() => {
    loadTranslationsFromFile(myTranslations, addTranslation);
  }, []);
  
  return (
    <div>
      <h1>{t('welcome_message')}</h1>
      <p>{t('about_us')}</p>
      <button>{t('custom_button')}</button>
    </div>
  );
}
```

### 방법 3: 더 간단한 훅 사용하기
```tsx
import { useSimpleI18n, useTranslationsFromFile } from '@hua-labs/i18n-beginner';
import { myTranslations } from './translations/myTranslations';

function MyComponent() {
  const { t } = useSimpleI18n();
  
  // 자동으로 번역 파일 로드
  useTranslationsFromFile(myTranslations);
  
  return (
    <div>
      <h1>{t('welcome_message')}</h1>
      <p>{t('contact_info')}</p>
    </div>
  );
}
```

> 이게 뭔가요?  
> - **TypeScript 파일**: 번역을 별도 파일로 관리할 수 있어요
> - **`loadTranslationsFromFile`**: 번역 파일을 자동으로 로드해요
> - **`useTranslationsFromFile`**: 더 간단하게 사용할 수 있는 훅이에요

### 번역 추가 규칙

- **언어 코드**: `ko` (한국어), `en` (영어)
- **키**: 문자열 (예: `'my_text'`)
- **값**: 문자열 (예: `'내 텍스트'`)
- **동적 추가**: `addTranslation(언어, 키, 값)`

> 추천하는 방법:  
> - **초보자**: TypeScript 파일로 번역 분리하기
> - **간단한 경우**: 동적으로 번역 추가하기
> - **복잡한 프로젝트**: 여러 번역 파일로 나누기

> 주의사항:  
> - 키는 따옴표로 감싸야 해요: `'my_text'` (O), `my_text` (X)
> - 값도 따옴표로 감싸야 해요: `'내 텍스트'` (O), `내 텍스트` (X)
> - TypeScript 파일 사용 시 `as const`를 붙이면 타입 안정성이 향상돼요!

이렇게 하면 번역을 체계적으로 관리할 수 있습니다!

---

## 고급 사용법

### 다양한 훅들

#### 1. `useSimpleI18n` (추천!)
```tsx
const { t, toggleLanguage, languageButtonText, isClient, addTranslation } = useSimpleI18n();
```
> 언제 사용? 대부분의 경우에 사용하세요. 가장 간단해요!

#### 2. `useTranslate` (번역만 필요할 때)
```tsx
const t = useTranslate();
```
> 언제 사용? 번역 함수만 필요할 때 사용하세요.

#### 3. `useLanguage` (언어 관련 기능만 필요할 때)
```tsx
const { language, setLanguage, toggleLanguage, addTranslation } = useLanguage();
```
> 언제 사용? 언어 변경 기능만 필요할 때 사용하세요.

#### 4. `useI18n` (모든 기능이 필요할 때)
```tsx
const { t, language, setLanguage, toggleLanguage, addTranslation, isClient } = useI18n();
```
> 언제 사용? 모든 기능이 필요할 때 사용하세요.

### 언어 직접 설정하기

```tsx
import { useLanguage } from '@hua-labs/i18n-beginner';

function LanguageSelector() {
  const { setLanguage } = useLanguage();
  
  return (
    <div>
      <button onClick={() => setLanguage('ko')}>한국어</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

> 이게 뭔가요?  
> `toggleLanguage()`는 한국어 ↔ 영어를 번갈아가며 바꾸고,  
> `setLanguage('ko')`는 무조건 한국어로, `setLanguage('en')`은 무조건 영어로 바꿔요.

---

## 주의사항

### 하이드레이션 문제 해결

Next.js에서 "hydration mismatch" 오류가 발생할 수 있어요. 이렇게 해결하세요:

```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function MyComponent() {
  const { t, toggleLanguage, languageButtonText, isClient } = useSimpleI18n();

  // 하이드레이션 방지
  if (!isClient) {
    return (
      <div>
        <h1>환영합니다</h1>
        <p>안녕하세요</p>
        <button>English</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello')}</p>
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

> 이게 뭔가요?  
> - `isClient`: 브라우저에서 실행 중인지 확인하는 플래그
> - `!isClient`: 서버에서 실행 중일 때는 고정된 한국어 텍스트를 보여줌
> - 이렇게 하면 서버와 클라이언트의 내용이 일치해서 오류가 발생하지 않아요.

### 무한 루프 방지

`useEffect`에서 `addTranslation`을 사용할 때는 의존성 배열을 비워야 해요:

```tsx
// 올바른 방법
useEffect(() => {
  addTranslation('ko', 'my_text', '내 텍스트');
  addTranslation('en', 'my_text', 'My text');
}, []); // 빈 배열

// ❌ 잘못된 방법 (무한 루프 발생!)
useEffect(() => {
  addTranslation('ko', 'my_text', '내 텍스트');
  addTranslation('en', 'my_text', 'My text');
}, [addTranslation]); // addTranslation을 의존성에 포함
```

> 이게 뭔가요?  
> - 빈 배열 `[]`: 컴포넌트가 처음 로드될 때 한 번만 실행
> - `[addTranslation]`: `addTranslation` 함수가 바뀔 때마다 실행 (무한 루프!)

---

## ❓ 자주 묻는 질문

### Q: 더 많은 언어를 지원하려면?
A: `addTranslation()` 함수를 사용해서 동적으로 추가할 수 있습니다.

```tsx
addTranslation('ja', 'welcome', 'ようこそ'); // 일본어
addTranslation('fr', 'welcome', 'Bienvenue'); // 프랑스어
addTranslation('es', 'welcome', 'Bienvenido'); // 스페인어
```

### Q: 번역이 안 나오면?
A: 번역 키가 올바른지 확인해주세요. 기본 번역 키는 "기본 제공 번역 키들" 섹션을 참고하세요.

### Q: 동적으로 번역을 추가할 수 있나요?
A: 네! `addTranslation()` 함수를 사용하면 런타임에 번역을 추가할 수 있습니다.

### Q: 언어가 바뀌지 않아요
A: `SimpleI18n` Provider가 제대로 설정되어 있는지 확인해주세요.

### Q: 하이드레이션 오류가 발생해요
A: "주의사항" 섹션의 하이드레이션 문제 해결 방법을 참고해주세요.

### Q: 성능에 문제가 있나요?
A: 번역을 너무 많이 추가하면 성능에 영향을 줄 수 있습니다. 필요한 번역만 추가하세요.

---

## 성능 최적화

### 불필요한 번역 키는 제거하세요
```tsx
// 나쁜 예: 사용하지 않는 번역 추가
addTranslation('ko', 'unused_text', '사용하지 않는 텍스트');

// 좋은 예: 필요한 번역만 추가
addTranslation('ko', 'important_text', '중요한 텍스트');
```

### 불필요한 리렌더링을 방지하세요
```tsx
import { useMemo } from 'react';

function MyComponent() {
  const { t } = useSimpleI18n();
  
  // 번역된 텍스트를 메모이제이션 (함수 자체는 메모이제이션 불필요)
  const welcomeText = useMemo(() => t('welcome'), [t]);
  const helloText = useMemo(() => t('hello'), [t]);
  
  return (
    <div>
      <h1>{welcomeText}</h1>
      <p>{helloText}</p>
    </div>
  );
}
```

### 동적 번역 추가는 필요한 시점에만 하세요
```tsx
// 나쁜 예: 매번 렌더링할 때마다 추가
function MyComponent() {
  const { addTranslation } = useSimpleI18n();
  
  addTranslation('ko', 'text', '텍스트'); // 매번 실행됨!
  
  return <div>...</div>;
}

// 좋은 예: 한 번만 추가
function MyComponent() {
  const { addTranslation } = useSimpleI18n();
  
  useEffect(() => {
    addTranslation('ko', 'text', '텍스트'); // 한 번만 실행됨!
  }, []);
  
  return <div>...</div>;
}
```

---

## 보안

### 번역 키는 신뢰할 수 있는 소스에서만 가져오세요
```tsx
// 나쁜 예: 사용자 입력을 그대로 사용
const userKey = userInput; // 위험!
t(userKey);

// 좋은 예: 허용된 키만 사용
const allowedKeys = ['welcome', 'hello', 'goodbye'];
if (allowedKeys.includes(userKey)) {
  t(userKey);
}
```

---

## 다음 단계

### 더 많은 기능이 필요하다면:
- [HUA i18n SDK](https://github.com/hua-labs/hua-i18n-sdk): 고급 기능이 있는 완전한 i18n SDK
- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing): Next.js 공식 다국어 지원

### 커뮤니티:
- [GitHub Issues](https://github.com/hua-labs/hua-platform/issues): 버그 리포트 및 기능 요청
- [Discussions](https://github.com/hua-labs/hua-platform/discussions): 질문 및 토론

---

## 라이선스

MIT License - 자유롭게 사용하세요!

---

## 기여하기

버그를 발견하거나 개선 아이디어가 있으시면 언제든지 기여해주세요!

1. [Fork](https://github.com/hua-labs/hua-platform/fork) this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a [Pull Request](https://github.com/hua-labs/hua-platform/pulls)

---

**정말 한 줄로 시작하는 다국어 지원, 지금 바로 시작해보세요!** 