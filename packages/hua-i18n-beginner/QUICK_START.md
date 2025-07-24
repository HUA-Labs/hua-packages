# 🚀 HUA i18n Beginner SDK - 5분 완성 가이드

**정말 한 줄로 시작하는 다국어 지원 라이브러리**

> 💡 **이 가이드가 뭔가요?**  
> 이 가이드는 여러분이 5분 안에 웹사이트에 한국어/영어 번역 기능을 추가할 수 있도록 도와줘요.  
> 마치 요리 레시피처럼, 단계별로 따라하시면 됩니다!

---

## 📋 준비물

### 필요한 것들:
- ✅ Node.js가 설치된 컴퓨터
- ✅ React 프로젝트 (Next.js, Create React App 등)
- ✅ 코드 편집기 (VS Code 추천!)
- ✅ 5분의 시간

### 선택사항:
- ☕ 커피나 차 (편안하게 마시면서 따라하세요!)

---

## 🎯 1단계: 설치하기 (30초)

### 터미널에서 실행하기
```bash
npm install @hua-labs/i18n-beginner
```

> 💡 **이게 뭔가요?**  
> 이 명령어는 마치 앱스토어에서 앱을 다운로드하는 것과 같아요.  
> 우리가 만든 다국어 지원 도구를 여러분의 프로젝트에 설치해요.

### 설치 확인하기
```bash
# package.json 파일에 이 줄이 있는지 확인하세요
"@hua-labs/i18n-beginner": "^1.0.0"
```

> ❓ **확인 방법**:  
> 1. 프로젝트 폴더에서 `package.json` 파일을 열어보세요
> 2. `"dependencies"` 섹션에 `"@hua-labs/i18n-beginner"`가 있는지 확인하세요

---

## 🎯 2단계: 설정하기 (1분)

### Next.js App Router 사용하는 경우
```tsx
// app/layout.tsx 파일을 열어주세요
import { SimpleI18n } from '@hua-labs/i18n-beginner';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <SimpleI18n>
          {children}
        </SimpleI18n>
      </body>
    </html>
  );
}
```

### Next.js Pages Router 사용하는 경우
```tsx
// pages/_app.tsx 파일을 열어주세요
import { SimpleI18n } from '@hua-labs/i18n-beginner';

export default function App({ Component, pageProps }) {
  return (
    <SimpleI18n>
      <Component {...pageProps} />
    </SimpleI18n>
  );
}
```

### Create React App 사용하는 경우
```tsx
// src/App.tsx 파일을 열어주세요
import { SimpleI18n } from '@hua-labs/i18n-beginner';

function App() {
  return (
    <SimpleI18n>
      <div>
        {/* 여러분의 앱 내용 */}
      </div>
    </SimpleI18n>
  );
}

export default App;
```

> 💡 **이게 뭔가요?**  
> `SimpleI18n`은 마치 전기 콘센트와 같아요.  
> 이걸 설치해야 다국어 기능을 사용할 수 있어요.

> ⚠️ **중요**:  
> - `SimpleI18n`은 반드시 앱의 최상위 레벨에 있어야 해요
> - 모든 컴포넌트를 감싸야 해요
> - 한 번만 설정하면 됩니다!

---

## 🎯 3단계: 사용하기 (2분)

### 컴포넌트 만들기
```tsx
// app/components/MyComponent.tsx (또는 원하는 위치)
'use client'; // Next.js App Router 사용하는 경우에만

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

### 페이지에서 사용하기
```tsx
// app/page.tsx (또는 원하는 페이지)
import MyComponent from './components/MyComponent';

export default function HomePage() {
  return (
    <div>
      <h2>내 첫 번째 다국어 앱</h2>
      <MyComponent />
    </div>
  );
}
```

> 💡 **이게 뭔가요?**  
> - `t('welcome')`: "환영합니다" 또는 "Welcome"을 자동으로 보여줘요
> - `toggleLanguage`: 버튼을 누르면 한국어 ↔ 영어가 바뀌어요
> - `languageButtonText`: 버튼에 "English" 또는 "한국어"가 자동으로 표시돼요

---

## 🎯 4단계: 테스트하기 (30초)

### 개발 서버 실행하기
```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

### 브라우저에서 확인하기
1. 브라우저를 열어주세요
2. `http://localhost:3000` (또는 표시된 주소)로 이동하세요
3. "환영합니다"와 "안녕하세요"가 보이는지 확인하세요
4. 버튼을 클릭해서 언어가 바뀌는지 확인하세요

> 🎉 **성공!**  
> 버튼을 클릭했을 때 언어가 바뀐다면 성공이에요!

---

## 🎯 5단계: 커스터마이징 (1분)

### 방법 1: 동적으로 번역 추가하기

```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';
import { useEffect } from 'react';

function MyComponent() {
  const { t, addTranslation } = useSimpleI18n();
  
  // 컴포넌트가 처음 로드될 때 번역 추가
  useEffect(() => {
    addTranslation('ko', 'my_custom_text', '내 커스텀 텍스트');
    addTranslation('en', 'my_custom_text', 'My custom text');
  }, []); // 빈 배열 = 한 번만 실행
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('my_custom_text')}</p> {/* 커스텀 번역 사용 */}
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
    custom_button: "커스텀 버튼"
  },
  en: {
    welcome_message: "Welcome",
    goodbye_message: "Goodbye",
    custom_button: "Custom Button"
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
      <p>{t('goodbye_message')}</p>
      <button>{t('custom_button')}</button>
    </div>
  );
}
```

### 🎯 방법 3: 더 간단한 훅 사용하기
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
      <p>{t('goodbye_message')}</p>
    </div>
  );
}
```

### 더 예쁘게 만들기
```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function BeautifulComponent() {
  const { t, toggleLanguage, languageButtonText } = useSimpleI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('welcome')}
            </h1>
            <button 
              onClick={toggleLanguage}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {languageButtonText}
            </button>
          </div>
          
          <p className="text-xl text-gray-700 mb-6">{t('hello')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{t('email')}</h3>
              <input 
                type="email" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('email')}
              />
            </div>
            
            <div className="p-6 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{t('password')}</h3>
              <input 
                type="password" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('password')}
              />
            </div>
          </div>
          
          <button className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl">
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

> 💡 **이게 뭔가요?**  
> - **동적 추가**: `addTranslation('ko', '키', '한국어값')` - 한국어 번역 추가
> - **TypeScript 파일**: 번역을 별도 파일로 관리할 수 있어요
> - **`loadTranslationsFromFile`**: 번역 파일을 자동으로 로드해요
> - **`useTranslationsFromFile`**: 더 간단하게 사용할 수 있는 훅이에요
> - **CSS 클래스들**: Tailwind CSS를 사용해서 예쁘게 만든 거예요

---

## ⚠️ 주의사항

### 🔄 하이드레이션 문제 해결

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

> 💡 **이게 뭔가요?**  
> - `isClient`: 브라우저에서 실행 중인지 확인하는 플래그
> - `!isClient`: 서버에서 실행 중일 때는 고정된 한국어 텍스트를 보여줌
> - 이렇게 하면 서버와 클라이언트의 내용이 일치해서 오류가 발생하지 않아요.

### 🔄 무한 루프 방지

`useEffect`에서 `addTranslation`을 사용할 때는 의존성 배열을 비워야 해요:

```tsx
// ✅ 올바른 방법
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

> 💡 **이게 뭔가요?**  
> - 빈 배열 `[]`: 컴포넌트가 처음 로드될 때 한 번만 실행
> - `[addTranslation]`: `addTranslation` 함수가 바뀔 때마다 실행 (무한 루프!)

---

## 🎯 번역 추가 규칙

- **언어 코드**: `ko` (한국어), `en` (영어)
- **키**: 문자열 (예: `'my_text'`)
- **값**: 문자열 (예: `'내 텍스트'`)
- **동적 추가**: `addTranslation(언어, 키, 값)`

> ⚠️ **주의사항**:  
> - 키는 따옴표로 감싸야 해요: `'my_text'` (O), `my_text` (X)
> - 값도 따옴표로 감싸야 해요: `'내 텍스트'` (O), `내 텍스트` (X)

---

## 📚 기본 제공 번역 키들

### 🏠 기본 인사말
```tsx
t('welcome')     // "환영합니다" / "Welcome"
t('hello')       // "안녕하세요" / "Hello"
t('click_me')    // "클릭하세요" / "Click me"
```

### 🔄 상태 메시지
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

### 🎯 액션 버튼
```tsx
t('submit')      // "제출" / "Submit"
t('reset')       // "초기화" / "Reset"
t('close')       // "닫기" / "Close"
t('open')        // "열기" / "Open"
t('yes')         // "예" / "Yes"
t('no')          // "아니오" / "No"
t('ok')          // "확인" / "OK"
```

### 📱 긴 메시지
```tsx
t('loading_text')        // "잠시만 기다려주세요..." / "Please wait..."
t('error_message')       // "문제가 발생했습니다. 다시 시도해주세요." / "An error occurred. Please try again."
t('success_message')     // "성공적으로 완료되었습니다!" / "Successfully completed!"
t('not_found')          // "찾을 수 없습니다" / "Not found"
t('unauthorized')       // "권한이 없습니다" / "Unauthorized"
t('forbidden')          // "접근이 거부되었습니다" / "Forbidden"
t('server_error')       // "서버 오류가 발생했습니다" / "Server error occurred"
```

> 💡 **사용 팁**:  
> 이 키들을 그대로 복사해서 `t('키이름')` 형태로 사용하세요!  
> 예: `t('welcome')` → "환영합니다" 또는 "Welcome"

---

## ❓ 문제 해결

### Q: 번역이 안 나와요
A: 번역 키가 올바른지 확인하세요. 기본 번역 키는 위의 "기본 제공 번역 키들" 섹션을 참고하세요.

### Q: 언어가 바뀌지 않아요
A: `SimpleI18n` Provider가 제대로 설정되어 있는지 확인해주세요.

### Q: 하이드레이션 오류가 발생해요
A: "주의사항" 섹션의 하이드레이션 문제 해결 방법을 참고해주세요.

### Q: 무한 루프가 발생해요
A: `useEffect`의 의존성 배열이 `[]`로 설정되어 있는지 확인해주세요.

### Q: 더 많은 언어를 지원하려면?
A: `addTranslation()` 함수를 사용해서 동적으로 추가할 수 있습니다.

```tsx
addTranslation('ja', 'welcome', 'ようこそ'); // 일본어
addTranslation('fr', 'welcome', 'Bienvenue'); // 프랑스어
addTranslation('es', 'welcome', 'Bienvenido'); // 스페인어
```

---

## 🎉 축하합니다!

**5분 만에 다국어 지원 앱을 완성하셨네요!** 🎊

### 지금까지 배운 것들:
- ✅ 다국어 지원 라이브러리 설치
- ✅ Provider 설정
- ✅ 기본 번역 사용
- ✅ 언어 전환 기능
- ✅ 커스텀 번역 추가
- ✅ 하이드레이션 문제 해결

### 다음에 할 수 있는 것들:
- 🎨 더 예쁜 UI 만들기
- 📱 모바일 반응형 디자인
- 🌍 더 많은 언어 추가하기
- ⚡ 성능 최적화
- 🔧 고급 기능 사용하기

---

## 📚 더 배우고 싶다면

### 공식 문서:
- [README.md](./README.md): 더 자세한 사용법과 예제
- [GitHub Repository](https://github.com/hua-labs/hua-platform): 소스 코드와 이슈

### 커뮤니티:
- [GitHub Issues](https://github.com/hua-labs/hua-platform/issues): 버그 리포트 및 기능 요청
- [Discussions](https://github.com/hua-labs/hua-platform/discussions): 질문 및 토론

---

**정말 한 줄로 시작하는 다국어 지원, 지금 바로 시작해보세요! 🚀**

> 💝 **이 가이드가 도움이 되었다면**  
> GitHub에서 ⭐ 스타를 눌러주세요! 여러분의 지원이 더 좋은 도구를 만드는 원동력이 됩니다! 