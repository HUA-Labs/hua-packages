# @hua-labs/i18n-number API 레퍼런스

## 훅

### useNumberFormatter

숫자 포맷터 훅입니다.

#### 시그니처

```typescript
function useNumberFormatter(): NumberFormatterReturn
```

#### 반환값

`NumberFormatterReturn` 타입의 객체를 반환합니다.

#### 예제

```tsx
import { useNumberFormatter } from '@hua-labs/i18n-number';

function MyComponent() {
  const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
  
  return (
    <div>
      <p>{formatNumber(1234567)}</p>
      <p>{formatPercent(0.95)}</p>
      <p>{formatCompact(1000000)}</p>
    </div>
  );
}
```

## 유틸리티 함수

### formatNumber

숫자를 포맷팅합니다.

#### 시그니처

```typescript
function formatNumber(
  value: number,
  options?: NumberFormatterOptions,
  locale?: string
): string
```

#### 파라미터

- `value`: 포맷팅할 숫자
- `options`: 포맷 옵션 (선택)
- `locale`: 로케일 (선택, 기본값: 'ko')

#### 반환값

포맷팅된 숫자 문자열

#### 예제

```typescript
import { formatNumber } from '@hua-labs/i18n-number';

formatNumber(1234567); // "1,234,567"
formatNumber(1234567.89, { maximumFractionDigits: 1 }); // "1,234,567.9"
```

### formatPercent

퍼센트를 포맷팅합니다.

#### 시그니처

```typescript
function formatPercent(
  value: number,
  options?: PercentFormatterOptions,
  locale?: string
): string
```

#### 예제

```typescript
import { formatPercent } from '@hua-labs/i18n-number';

formatPercent(0.1); // "10%"
formatPercent(0.95, { maximumFractionDigits: 2 }); // "95%"
```

### formatCompact

컴팩트 표기로 포맷팅합니다.

#### 시그니처

```typescript
function formatCompact(
  value: number,
  options?: NumberFormatterOptions,
  locale?: string
): string
```

#### 예제

```typescript
import { formatCompact } from '@hua-labs/i18n-number';

formatCompact(1000); // "1천" (한국어) 또는 "1K" (영어)
formatCompact(1000000); // "1백만" (한국어) 또는 "1M" (영어)
```

## 타입

### NumberFormatterReturn

```typescript
interface NumberFormatterReturn {
  formatNumber: (value: number, options?: NumberFormatterOptions) => string;
  formatPercent: (value: number, options?: PercentFormatterOptions) => string;
  formatCompact: (value: number, options?: NumberFormatterOptions) => string;
  currentLanguage: string;
}
```

### NumberFormatterOptions

```typescript
interface NumberFormatterOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  notation?: 'standard' | 'compact';
}
```

### PercentFormatterOptions

```typescript
interface PercentFormatterOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: 'auto' | 'always' | 'never';
}
```

