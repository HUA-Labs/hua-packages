# @hua-labs/i18n-number

숫자 포맷팅 및 현지화 유틸리티 패키지입니다. `@hua-labs/i18n-core`와 통합하여 언어별 숫자 포맷팅 기능을 제공합니다.

## 설치

```bash
pnpm add @hua-labs/i18n-number
# 또는
npm install @hua-labs/i18n-number
```

## 빠른 시작

### 기본 사용법

```tsx
import { useNumberFormatter } from '@hua-labs/i18n-number';

function Stats() {
  const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
  
  return (
    <div>
      <p>사용자 수: {formatNumber(1234567)}</p>
      <p>성공률: {formatPercent(0.95)}</p>
      <p>조회수: {formatCompact(1000000)}</p>
    </div>
  );
}
```

## 주요 기능

### 1. 기본 숫자 포맷팅

천 단위 구분자와 소수점 자리수를 제어할 수 있습니다.

```tsx
const { formatNumber } = useNumberFormatter();

formatNumber(1234567); // "1,234,567" (한국어)
formatNumber(1234567.89); // "1,234,567.89"
formatNumber(1234567.89, { maximumFractionDigits: 1 }); // "1,234,567.9"
formatNumber(1234567, { useGrouping: false }); // "1234567"
```

### 2. 퍼센트 포맷팅

소수값을 퍼센트로 변환합니다.

```tsx
const { formatPercent } = useNumberFormatter();

formatPercent(0.1); // "10%"
formatPercent(0.95); // "95%"
formatPercent(0.1234, { maximumFractionDigits: 2 }); // "12.34%"
```

### 3. 컴팩트 표기

큰 숫자를 간단하게 표시합니다.

```tsx
const { formatCompact } = useNumberFormatter();

formatCompact(1000); // "1천" (한국어) 또는 "1K" (영어)
formatCompact(1000000); // "1백만" (한국어) 또는 "1M" (영어)
```

## API 레퍼런스

### useNumberFormatter

숫자 포맷터 훅입니다.

#### 반환값

```typescript
interface NumberFormatterReturn {
  formatNumber: (value: number, options?: NumberFormatterOptions) => string;
  formatPercent: (value: number, options?: PercentFormatterOptions) => string;
  formatCompact: (value: number, options?: NumberFormatterOptions) => string;
  currentLanguage: string;
}
```

#### 예제

```tsx
function MyComponent() {
  const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
  
  return (
    <div>
      <p>숫자: {formatNumber(1234567.89)}</p>
      <p>퍼센트: {formatPercent(0.95)}</p>
      <p>컴팩트: {formatCompact(1000000)}</p>
    </div>
  );
}
```

## 옵션

### NumberFormatterOptions

```typescript
interface NumberFormatterOptions {
  minimumFractionDigits?: number; // 최소 소수점 자리수
  maximumFractionDigits?: number; // 최대 소수점 자리수
  useGrouping?: boolean; // 천 단위 구분자 사용 여부
  notation?: 'standard' | 'compact'; // 표기법
}
```

### PercentFormatterOptions

```typescript
interface PercentFormatterOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: 'auto' | 'always' | 'never'; // 부호 표시 방식
}
```

## 언어별 동작

패키지는 현재 언어 설정에 따라 자동으로 포맷을 조정합니다:

- **한국어 (ko)**: 1,234,567.89
- **영어 (en)**: 1,234,567.89
- **일본어 (ja)**: 1,234,567.89

컴팩트 표기의 경우:
- **한국어**: 1천, 1만, 1백만
- **영어**: 1K, 1M, 1B
- **일본어**: 1千, 1万, 1百万

## 관련 문서

- [i18n 패키지 개요](../i18n/README.md)
- [포맷터 통합 가이드](../i18n/FORMATTERS_GUIDE.md)
- [API 레퍼런스](./API.md)

## 라이선스

MIT

