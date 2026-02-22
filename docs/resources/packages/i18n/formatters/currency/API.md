# @hua-labs/i18n-currency API 레퍼런스

## 훅

### useCurrencyFormatter

화폐 포맷터 훅입니다.

#### 시그니처

```typescript
function useCurrencyFormatter(): CurrencyFormatterReturn
```

#### 반환값

`CurrencyFormatterReturn` 타입의 객체를 반환합니다.

#### 예제

```tsx
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';

function MyComponent() {
  const { formatCurrency, defaultCurrency } = useCurrencyFormatter();
  
  return (
    <div>
      <p>기본 통화: {defaultCurrency}</p>
      <p>가격: {formatCurrency(10000)}</p>
    </div>
  );
}
```

## 유틸리티 함수

### formatCurrency

화폐를 포맷팅합니다.

#### 시그니처

```typescript
function formatCurrency(
  value: number,
  options?: CurrencyFormatterOptions,
  locale?: string
): string
```

#### 파라미터

- `value`: 포맷팅할 금액
- `options`: 포맷 옵션 (선택)
- `locale`: 로케일 (선택, 기본값: 'ko')

#### 반환값

포맷팅된 화폐 문자열

#### 예제

```typescript
import { formatCurrency } from '@hua-labs/i18n-currency';

formatCurrency(10000); // "₩10,000" (한국어 기본)
formatCurrency(10000, { currency: 'USD' }); // "$10,000.00"
formatCurrency(10000, { symbolPosition: 'after' }); // "10,000₩"
```

### getDefaultCurrency

언어 코드에서 기본 통화를 가져옵니다.

#### 시그니처

```typescript
function getDefaultCurrency(language: string): string
```

#### 예제

```typescript
import { getDefaultCurrency } from '@hua-labs/i18n-currency';

getDefaultCurrency('ko'); // "KRW"
getDefaultCurrency('en'); // "USD"
getDefaultCurrency('ja'); // "JPY"
```

### getCurrencyDecimals

통화의 기본 소수점 자리수를 가져옵니다. 이 함수는 내부적으로 사용되며, 직접 호출할 필요는 없습니다.

#### 시그니처

```typescript
function getCurrencyDecimals(currency: string): number
```

#### 파라미터

- `currency`: 통화 코드 (예: 'KRW', 'USD', 'JPY')

#### 반환값

통화의 기본 소수점 자리수 (0 또는 2)

#### 예제

```typescript
import { getCurrencyDecimals } from '@hua-labs/i18n-currency';

getCurrencyDecimals('KRW'); // 0
getCurrencyDecimals('USD'); // 2
getCurrencyDecimals('JPY'); // 0
getCurrencyDecimals('EUR'); // 2
```

## 타입

### CurrencyFormatterReturn

```typescript
interface CurrencyFormatterReturn {
  formatCurrency: (value: number, options?: CurrencyFormatterOptions) => string;
  currentLanguage: string;
  defaultCurrency: string;
}
```

### CurrencyFormatterOptions

```typescript
interface CurrencyFormatterOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  symbolPosition?: 'before' | 'after';
}
```

## 내부 상수

다음 상수들은 패키지 내부에서 사용되며, 직접 접근할 필요는 없습니다. 참고용으로만 제공됩니다.

### LANGUAGE_TO_CURRENCY

언어별 기본 통화 매핑입니다. `getDefaultCurrency` 함수에서 사용됩니다.

```typescript
const LANGUAGE_TO_CURRENCY: Record<string, string> = {
  ko: 'KRW',
  en: 'USD',
  ja: 'JPY',
};
```

### CURRENCY_DECIMALS

통화별 기본 소수점 자리수입니다. `formatCurrency` 함수에서 자동으로 사용됩니다.

```typescript
const CURRENCY_DECIMALS: Record<string, number> = {
  KRW: 0,
  JPY: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  CNY: 2,
};
```

