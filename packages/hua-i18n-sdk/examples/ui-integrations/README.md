# UI 라이브러리 통합 가이드

HUA i18n SDK를 다양한 서드파티 UI 라이브러리와 함께 사용하는 베스트 프랙티스 가이드입니다.

## 📚 지원하는 UI 라이브러리

- **Material-UI (MUI)**
- **Chakra UI**
- **Ant Design**
- **Tailwind CSS**
- **Styled Components**
- **Emotion**

## 🎯 공통 베스트 프랙티스

### 1. 언어 전환 컴포넌트 통합

```typescript
// 공통 언어 전환 훅
import { useTranslation } from '@hua-labs/i18n-core';

export const useLanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation();
  
  return {
    currentLanguage: language,
    changeLanguage,
    languages: [
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' }
    ]
  };
};
```

### 2. 번역 키 네이밍 컨벤션

```typescript
// 일관된 키 네이밍
const translationKeys = {
  // UI 컴포넌트 관련
  'ui.button.submit': 'Submit',
  'ui.button.cancel': 'Cancel',
  'ui.input.placeholder': 'Enter text...',
  
  // 페이지별
  'page.home.title': 'Welcome',
  'page.auth.login': 'Login',
  
  // 메시지
  'message.success.saved': 'Successfully saved',
  'message.error.network': 'Network error occurred'
};
```

## 🎨 Material-UI (MUI) 통합

### 설치

```bash
npm install @mui/material @emotion/react @emotion/styled
```

### 언어 전환 컴포넌트

```typescript
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { useLanguageSwitcher } from './hooks/useLanguageSwitcher';

export const MuiLanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguageSwitcher();

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Language</InputLabel>
      <Select
        value={currentLanguage}
        label="Language"
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
```

### 번역된 컴포넌트 래퍼

```typescript
import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useTranslation } from '@hua-labs/i18n-core';

interface TranslatedButtonProps extends ButtonProps {
  translationKey: string;
  namespace?: string;
}

export const TranslatedButton: React.FC<TranslatedButtonProps> = ({
  translationKey,
  namespace = 'ui',
  children,
  ...props
}) => {
  const { t } = useTranslation(namespace);
  
  return (
    <Button {...props}>
      {t(translationKey) || children}
    </Button>
  );
};

// 사용 예시
<TranslatedButton 
  translationKey="button.submit" 
  variant="contained" 
  color="primary"
/>
```

### 폼 컴포넌트 통합

```typescript
import React from 'react';
import { 
  TextField, 
  FormControl, 
  FormLabel, 
  FormHelperText 
} from '@mui/material';
import { useTranslation } from '@hua-labs/i18n-core';

interface TranslatedTextFieldProps {
  translationKey: string;
  namespace?: string;
  labelKey?: string;
  placeholderKey?: string;
  helperTextKey?: string;
  [key: string]: any;
}

export const TranslatedTextField: React.FC<TranslatedTextFieldProps> = ({
  translationKey,
  namespace = 'ui',
  labelKey,
  placeholderKey,
  helperTextKey,
  ...props
}) => {
  const { t } = useTranslation(namespace);
  
  return (
    <TextField
      label={labelKey ? t(labelKey) : undefined}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      helperText={helperTextKey ? t(helperTextKey) : undefined}
      {...props}
    />
  );
};
```

## 🌈 Chakra UI 통합

### 설치

```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

### 언어 전환 컴포넌트

```typescript
import React from 'react';
import { 
  Select, 
  HStack, 
  Text, 
  Icon 
} from '@chakra-ui/react';
import { useLanguageSwitcher } from './hooks/useLanguageSwitcher';

export const ChakraLanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguageSwitcher();

  return (
    <HStack spacing={2}>
      <Text fontSize="sm">Language:</Text>
      <Select
        size="sm"
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        w="auto"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
```

### 번역된 컴포넌트 래퍼

```typescript
import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import { useTranslation } from '@hua-labs/i18n-core';

interface TranslatedButtonProps extends ButtonProps {
  translationKey: string;
  namespace?: string;
}

export const TranslatedButton: React.FC<TranslatedButtonProps> = ({
  translationKey,
  namespace = 'ui',
  children,
  ...props
}) => {
  const { t } = useTranslation(namespace);
  
  return (
    <Button {...props}>
      {t(translationKey) || children}
    </Button>
  );
};
```

### 토스트 메시지 통합

```typescript
import { useToast } from '@chakra-ui/react';
import { useTranslation } from '@hua-labs/i18n-core';

export const useTranslatedToast = () => {
  const toast = useToast();
  const { t } = useTranslation('messages');

  return {
    success: (key: string, options?: any) => {
      toast({
        title: t(key),
        status: 'success',
        ...options
      });
    },
    error: (key: string, options?: any) => {
      toast({
        title: t(key),
        status: 'error',
        ...options
      });
    },
    warning: (key: string, options?: any) => {
      toast({
        title: t(key),
        status: 'warning',
        ...options
      });
    }
  };
};
```

## 🎯 Ant Design 통합

### 설치

```bash
npm install antd
```

### 언어 전환 컴포넌트

```typescript
import React from 'react';
import { Select, Space, Typography } from 'antd';
import { useLanguageSwitcher } from './hooks/useLanguageSwitcher';

const { Text } = Typography;

export const AntLanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguageSwitcher();

  return (
    <Space>
      <Text>Language:</Text>
      <Select
        size="small"
        value={currentLanguage}
        onChange={changeLanguage}
        style={{ width: 120 }}
      >
        {languages.map((lang) => (
          <Select.Option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
};
```

### 메시지 통합

```typescript
import { message } from 'antd';
import { useTranslation } from '@hua-labs/i18n-core';

export const useTranslatedMessage = () => {
  const { t } = useTranslation('messages');

  return {
    success: (key: string) => message.success(t(key)),
    error: (key: string) => message.error(t(key)),
    warning: (key: string) => message.warning(t(key)),
    info: (key: string) => message.info(t(key))
  };
};
```

## 🎨 Tailwind CSS 통합

### 커스텀 클래스 생성

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // 언어별 폰트 설정
      fontFamily: {
        'ko': ['Noto Sans KR', 'sans-serif'],
        'en': ['Inter', 'sans-serif'],
        'ja': ['Noto Sans JP', 'sans-serif']
      }
    }
  }
};
```

### 언어별 스타일 적용

```typescript
import React from 'react';
import { useTranslation } from '@hua-labs/i18n-core';

export const LanguageAwareComponent: React.FC = () => {
  const { language } = useTranslation();
  
  const getLanguageClass = () => {
    switch (language) {
      case 'ko': return 'font-ko';
      case 'ja': return 'font-ja';
      default: return 'font-en';
    }
  };

  return (
    <div className={`${getLanguageClass()} text-lg`}>
      {/* 컴포넌트 내용 */}
    </div>
  );
};
```

## 🎭 Styled Components 통합

### 언어별 테마

```typescript
import { createGlobalStyle } from 'styled-components';
import { useTranslation } from '@hua-labs/i18n-core';

export const LanguageAwareGlobalStyle = createGlobalStyle<{ language: string }>`
  body {
    font-family: ${({ language }) => {
      switch (language) {
        case 'ko': return '"Noto Sans KR", sans-serif';
        case 'ja': return '"Noto Sans JP", sans-serif';
        default: return '"Inter", sans-serif';
      }
    }};
    
    line-height: ${({ language }) => {
      switch (language) {
        case 'ko': return '1.6';
        case 'ja': return '1.8';
        default: return '1.5';
      }
    }};
  }
`;

export const GlobalStyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useTranslation();
  
  return (
    <>
      <LanguageAwareGlobalStyle language={language} />
      {children}
    </>
  );
};
```

## 🔧 공통 유틸리티

### 번역 키 검증

```typescript
import { useTranslation } from '@hua-labs/i18n-core';

export const useTranslationValidation = () => {
  const { t } = useTranslation();
  
  const validateKey = (key: string, namespace?: string) => {
    const translation = t(key, { ns: namespace });
    return translation !== key; // 키와 번역이 다르면 유효
  };
  
  const getMissingKeys = (keys: string[], namespace?: string) => {
    return keys.filter(key => !validateKey(key, namespace));
  };
  
  return { validateKey, getMissingKeys };
};
```

### 자동 번역 키 생성

```typescript
export const generateTranslationKey = (text: string, namespace: string) => {
  // 텍스트를 키로 변환하는 로직
  return `${namespace}.${text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')}`;
};
```

### 성능 최적화

```typescript
import { memo } from 'react';
import { useTranslation } from '@hua-labs/i18n-core';

// 번역된 컴포넌트 메모이제이션
export const TranslatedText = memo<{
  translationKey: string;
  namespace?: string;
  className?: string;
}>(({ translationKey, namespace = 'common', className }) => {
  const { t } = useTranslation(namespace);
  
  return (
    <span className={className}>
      {t(translationKey)}
    </span>
  );
});

TranslatedText.displayName = 'TranslatedText';
```

## 📝 번역 파일 구조 예시

```json
// translations/ko/ui.json
{
  "button": {
    "submit": "제출",
    "cancel": "취소",
    "save": "저장",
    "delete": "삭제"
  },
  "input": {
    "placeholder": "텍스트를 입력하세요...",
    "required": "필수 입력 항목입니다"
  },
  "message": {
    "success": "성공했습니다",
    "error": "오류가 발생했습니다"
  }
}

// translations/en/ui.json
{
  "button": {
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete"
  },
  "input": {
    "placeholder": "Enter text...",
    "required": "This field is required"
  },
  "message": {
    "success": "Success",
    "error": "An error occurred"
  }
}
```

## 🚀 고급 패턴

### 조건부 번역

```typescript
import { useTranslation } from '@hua-labs/i18n-core';

export const ConditionalTranslation: React.FC<{
  condition: boolean;
  trueKey: string;
  falseKey: string;
}> = ({ condition, trueKey, falseKey }) => {
  const { t } = useTranslation();
  
  return <span>{t(condition ? trueKey : falseKey)}</span>;
};
```

### 복수형 처리

```typescript
export const PluralTranslation: React.FC<{
  count: number;
  singularKey: string;
  pluralKey: string;
}> = ({ count, singularKey, pluralKey }) => {
  const { t } = useTranslation();
  
  return <span>{t(count === 1 ? singularKey : pluralKey, { count })}</span>;
};
```

### 동적 키 생성

```typescript
export const DynamicTranslation: React.FC<{
  baseKey: string;
  dynamicPart: string;
}> = ({ baseKey, dynamicPart }) => {
  const { t } = useTranslation();
  
  const fullKey = `${baseKey}.${dynamicPart}`;
  return <span>{t(fullKey)}</span>;
};
```

이 가이드를 통해 HUA i18n SDK를 다양한 UI 라이브러리와 효과적으로 통합할 수 있습니다! 🎉 