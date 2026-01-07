# @hua-labs/i18n-beginner

[한국어](./README.md) | [English](#english)

## This SDK is for Beginners!

> Contributing: [SDK Repo](https://github.com/HUA-Labs/HUA-Labs-public)

> Need advanced features?  
> - **Beginner**: `@hua-labs/i18n-beginner` (current package) - Simple and intuitive
> - **Advanced**: `@hua-labs/i18n-sdk` - Full features, plugins, advanced settings
> - **Enterprise**: `@hua-labs/i18n-advanced` - Custom loaders, performance optimization, enterprise features

**This SDK is designed to get you started in 30 seconds!**

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

### Complete Beginner Checklist

#### Step 1: Installation Check
```bash
# Did you run this command in terminal?
npm install @hua-labs/i18n-beginner
```
> Check: Verify that `"@hua-labs/i18n-beginner"` exists in your `package.json`.

#### Step 2: Provider Setup Check
```tsx
// Is this code in your layout.tsx?
import { SimpleI18n } from '@hua-labs/i18n-beginner';

<SimpleI18n>
  {children}
</SimpleI18n>
```
> Check: If the page loads without errors, you're successful!

#### Step 3: Component Usage Check
```tsx
// Is this code in your component?
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

const { t, toggleLanguage, languageButtonText } = useSimpleI18n();
```
> Check: Does the language change when you click the button?

### Built-in Translation Keys

#### Basic Greetings
```tsx
t('welcome')     // "Welcome"
t('hello')       // "Hello"
t('click_me')    // "Click me"
```

#### Status Messages
```tsx
t('loading')     // "Loading..."
t('error')       // "An error occurred"
t('success')     // "Success"
```

#### Button Text
```tsx
t('cancel')      // "Cancel"
t('confirm')     // "Confirm"
t('save')        // "Save"
t('delete')      // "Delete"
t('edit')        // "Edit"
t('add')         // "Add"
```

#### Search & Navigation
```tsx
t('search')      // "Search"
t('back')        // "Back"
t('next')        // "Next"
t('home')        // "Home"
t('about')       // "About"
t('contact')     // "Contact"
```

#### Settings & User
```tsx
t('settings')    // "Settings"
t('profile')     // "Profile"
t('logout')      // "Logout"
t('login')       // "Login"
t('register')    // "Register"
```

#### Form Fields
```tsx
t('email')       // "Email"
t('password')    // "Password"
t('name')        // "Name"
t('phone')       // "Phone"
t('address')     // "Address"
```

#### Action Buttons
```tsx
t('submit')      // "Submit"
t('reset')       // "Reset"
t('close')       // "Close"
t('open')        // "Open"
t('yes')         // "Yes"
t('no')          // "No"
t('ok')          // "OK"
```

#### Long Messages
```tsx
t('loading_text')        // "Please wait..."
t('error_message')       // "An error occurred. Please try again."
t('success_message')     // "Successfully completed!"
t('not_found')          // "Not found"
t('unauthorized')       // "Unauthorized"
t('forbidden')          // "Forbidden"
t('server_error')       // "Server error occurred"
```

### Custom Translation Methods

#### Method 1: Dynamic Translation Addition
```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function MyComponent() {
  const { t, toggleLanguage, languageButtonText, addTranslation } = useSimpleI18n();
  
  // Add translations
  const addCustomTranslations = () => {
    addTranslation('ko', 'custom_message', '커스텀 메시지');
    addTranslation('en', 'custom_message', 'Custom message');
  };
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello')}</p>
      <p>{t('custom_message')}</p> {/* Use custom translation */}
      <button onClick={addCustomTranslations}>Add Translation</button>
      <button onClick={toggleLanguage}>{languageButtonText}</button>
    </div>
  );
}
```

#### Method 2: TypeScript File Translation Separation (Recommended!)

**Step 1: Create translation file**
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

**Step 2: Use in component**
```tsx
import { useSimpleI18n, loadTranslationsFromFile } from '@hua-labs/i18n-beginner';
import { myTranslations } from './translations/myTranslations';

function MyComponent() {
  const { t, addTranslation } = useSimpleI18n();
  
  // Load translation file on component mount
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

#### Method 3: Simpler Hook Usage
```tsx
import { useSimpleI18n, useTranslationsFromFile } from '@hua-labs/i18n-beginner';
import { myTranslations } from './translations/myTranslations';

function MyComponent() {
  const { t } = useSimpleI18n();
  
  // Automatically load translation file
  useTranslationsFromFile(myTranslations);
  
  return (
    <div>
      <h1>{t('welcome_message')}</h1>
      <p>{t('contact_info')}</p>
    </div>
  );
}
```

### Advanced Usage

#### Various Hooks

##### 1. `useSimpleI18n` (Recommended!)
```tsx
const { t, toggleLanguage, languageButtonText, isClient, addTranslation } = useSimpleI18n();
```
> When to use: Use in most cases. It's the simplest!

##### 2. `useTranslate` (When you only need translation)
```tsx
const t = useTranslate();
```
> When to use: Use when you only need the translation function.

##### 3. `useLanguage` (When you only need language features)
```tsx
const { language, setLanguage, toggleLanguage, addTranslation } = useLanguage();
```
> When to use: Use when you only need language switching features.

##### 4. `useI18n` (When you need all features)
```tsx
const { t, language, setLanguage, toggleLanguage, addTranslation, isClient } = useI18n();
```
> When to use: Use when you need all features.

#### Direct Language Setting

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

### Important Notes

#### Hydration Problem Solution

You might encounter "hydration mismatch" errors in Next.js. Solve them like this:

```tsx
import { useSimpleI18n } from '@hua-labs/i18n-beginner';

function MyComponent() {
  const { t, toggleLanguage, languageButtonText, isClient } = useSimpleI18n();

  // Prevent hydration
  if (!isClient) {
    return (
      <div>
        <h1>Welcome</h1>
        <p>Hello</p>
        <button>한국어</button>
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

#### Infinite Loop Prevention

When using `addTranslation` in `useEffect`, keep the dependency array empty:

```tsx
// Correct method
useEffect(() => {
  addTranslation('ko', 'my_text', '내 텍스트');
  addTranslation('en', 'my_text', 'My text');
}, []); // Empty array

// Wrong method (causes infinite loop!)
useEffect(() => {
  addTranslation('ko', 'my_text', '내 텍스트');
  addTranslation('en', 'my_text', 'My text');
}, [addTranslation]); // Including addTranslation in dependencies
```

### Performance Optimization

#### Remove unnecessary translation keys
```tsx
// Bad example: Adding unused translations
addTranslation('ko', 'unused_text', '사용하지 않는 텍스트');

// Good example: Only add necessary translations
addTranslation('ko', 'important_text', '중요한 텍스트');
```

#### Prevent unnecessary re-renders
```tsx
import { useMemo } from 'react';

function MyComponent() {
  const { t } = useSimpleI18n();
  
  // Memoize translated text (function itself doesn't need memoization)
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

#### Add dynamic translations only when needed
```tsx
// Bad example: Adding every render
function MyComponent() {
  const { addTranslation } = useSimpleI18n();
  
  addTranslation('ko', 'text', '텍스트'); // Runs every time!
  
  return <div>...</div>;
}

// Good example: Add only once
function MyComponent() {
  const { addTranslation } = useSimpleI18n();
  
  useEffect(() => {
    addTranslation('ko', 'text', '텍스트'); // Runs only once!
  }, []);
  
  return <div>...</div>;
}
```

### Security

#### Only get translation keys from trusted sources
```tsx
// Bad example: Using user input directly
const userKey = userInput; // Dangerous!
t(userKey);

// Good example: Only use allowed keys
const allowedKeys = ['welcome', 'hello', 'goodbye'];
if (allowedKeys.includes(userKey)) {
  t(userKey);
}
```

### FAQ

#### Q: How to support more languages?
A: Use the `addTranslation()` function to add them dynamically.

```tsx
addTranslation('ja', 'welcome', 'ようこそ'); // Japanese
addTranslation('fr', 'welcome', 'Bienvenue'); // French
addTranslation('es', 'welcome', 'Bienvenido'); // Spanish
```

#### Q: Translation not showing?
A: Check if the translation key is correct. Refer to the "Built-in Translation Keys" section.

#### Q: Can I add translations dynamically?
A: Yes! Use the `addTranslation()` function to add translations at runtime.

#### Q: Language not changing
A: Check if the `SimpleI18n` Provider is set up correctly.

#### Q: Hydration error occurring
A: Refer to the "Important Notes" section for hydration problem solutions.

#### Q: Performance issues?
A: Adding too many translations can affect performance. Only add necessary translations.

### Next Steps

#### Need more features?
- [HUA i18n SDK](https://github.com/hua-labs/hua-i18n-sdk): Complete i18n SDK with advanced features
- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing): Next.js official internationalization

#### Community
- [GitHub Issues](https://github.com/HUA-Labs/HUA-Labs-public/issues): Bug reports and feature requests
- [Discussions](https://github.com/HUA-Labs/HUA-Labs-public/discussions): Questions and discussions

### License

MIT License - Use freely!

### Contributing

If you find bugs or have improvement ideas, feel free to contribute anytime!

1. [Fork](https://github.com/HUA-Labs/HUA-Labs-public/fork) this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a [Pull Request](https://github.com/HUA-Labs/HUA-Labs-public/pulls)

---

**Start internationalization with just one line - start now!** 