# @hua-labs/i18n-currency

HUA Labs - 화폐 포맷팅 및 현지화 유틸리티

`@hua-labs/i18n-core`와 통합하여 언어별 화폐 포맷팅 기능을 제공하는 패키지입니다.

## 설치

```bash
pnpm add @hua-labs/i18n-currency @hua-labs/i18n-core
# 또는
npm install @hua-labs/i18n-currency @hua-labs/i18n-core
# 또는
yarn add @hua-labs/i18n-currency @hua-labs/i18n-core
```

## 기본 사용법

### React 훅 사용

```tsx
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';
import { I18nProvider } from '@hua-labs/i18n-core';

function PriceDisplay() {
  const { formatCurrency, defaultCurrency } = useCurrencyFormatter();
  
  return (
    <div>
      <p>기본 통화: {defaultCurrency}</p>
      <p>가격: {formatCurrency(10000)}</p>
      {/* 한국어: ₩10,000 */}
      {/* 영어: $10,000.00 */}
      {/* 일본어: ¥10,000 */}
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <PriceDisplay />
    </I18nProvider>
  );
}
```

### 유틸리티 함수 사용

```tsx
import { formatCurrency, getDefaultCurrency } from '@hua-labs/i18n-currency';

// 기본 사용 (한국어 기본)
formatCurrency(10000); // "₩10,000"

// 통화 지정
formatCurrency(10000, { currency: 'USD' }); // "$10,000.00"
formatCurrency(10000, { currency: 'JPY' }); // "¥10,000"

// 통화 기호 위치 변경
formatCurrency(10000, { symbolPosition: 'after' }); // "10,000₩"

// 소수점 자리수 제어
formatCurrency(10000, { 
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}); // "$10,000.00"

// 통화 기호 숨기기
formatCurrency(10000, { showSymbol: false }); // "10,000"
```

## API 레퍼런스

### `useCurrencyFormatter()`

화폐 포맷터 훅입니다.

#### 반환값

```typescript
interface CurrencyFormatterReturn {
  /**
   * 화폐 포맷팅 함수
   */
  formatCurrency: (value: number, options?: CurrencyFormatterOptions) => string;
  
  /**
   * 현재 언어 코드
   */
  currentLanguage: string;
  
  /**
   * 현재 언어의 기본 통화 코드
   */
  defaultCurrency: string;
}
```

#### 예제

```tsx
function MyComponent() {
  const { formatCurrency, defaultCurrency, currentLanguage } = useCurrencyFormatter();
  
  return (
    <div>
      <p>현재 언어: {currentLanguage}</p>
      <p>기본 통화: {defaultCurrency}</p>
      <p>가격: {formatCurrency(10000)}</p>
    </div>
  );
}
```

### `formatCurrency(value, options?, locale?)`

화폐를 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `value` (number): 포맷팅할 금액
- `options` (CurrencyFormatterOptions, 선택): 포맷 옵션
- `locale` (string, 선택): 로케일 (기본값: 'ko')

#### 옵션

```typescript
interface CurrencyFormatterOptions {
  /**
   * 통화 코드 ('KRW', 'USD', 'JPY', 'EUR' 등)
   * 지정하지 않으면 언어별 기본 통화 사용
   */
  currency?: string;
  
  /**
   * 최소 소수점 자리수
   */
  minimumFractionDigits?: number;
  
  /**
   * 최대 소수점 자리수
   */
  maximumFractionDigits?: number;
  
  /**
   * 통화 기호 표시 여부
   */
  showSymbol?: boolean;
  
  /**
   * 통화 기호 위치
   * - 'before': ₩1,000
   * - 'after': 1,000₩
   */
  symbolPosition?: 'before' | 'after';
}
```

#### 예제

```typescript
import { formatCurrency } from '@hua-labs/i18n-currency';

formatCurrency(10000); // "₩10,000" (한국어 기본)
formatCurrency(10000, { currency: 'USD' }); // "$10,000.00"
formatCurrency(10000, { currency: 'JPY' }); // "¥10,000"
formatCurrency(10000, { symbolPosition: 'after' }); // "10,000₩"
formatCurrency(10000, { showSymbol: false }); // "10,000"
```

### `getDefaultCurrency(language)`

언어 코드에서 기본 통화를 가져옵니다.

#### 파라미터

- `language` (string): 언어 코드

#### 반환값

통화 코드 (string)

#### 예제

```typescript
import { getDefaultCurrency } from '@hua-labs/i18n-currency';

getDefaultCurrency('ko'); // "KRW"
getDefaultCurrency('en'); // "USD"
getDefaultCurrency('ja'); // "JPY"
```

## 언어별 기본 통화

| 언어 | 통화 코드 | 예시 |
|------|----------|------|
| 한국어 (ko) | KRW | ₩10,000 |
| 영어 (en) | USD | $10,000.00 |
| 일본어 (ja) | JPY | ¥10,000 |

## 통화별 소수점 자리수

| 통화 | 소수점 자리수 |
|------|--------------|
| KRW | 0 |
| JPY | 0 |
| USD | 2 |
| EUR | 2 |
| GBP | 2 |
| CNY | 2 |

## 사용 예시

### 다양한 통화 표시

```tsx
function MultiCurrencyDisplay() {
  const { formatCurrency } = useCurrencyFormatter();
  
  const prices = [
    { value: 10000, currency: 'KRW' },
    { value: 100, currency: 'USD' },
    { value: 10000, currency: 'JPY' },
  ];
  
  return (
    <div>
      {prices.map((price, i) => (
        <p key={i}>
          {formatCurrency(price.value, { currency: price.currency })}
        </p>
      ))}
    </div>
  );
}
```

### 통화 변환 UI

```tsx
function CurrencyConverter() {
  const { formatCurrency, defaultCurrency } = useCurrencyFormatter();
  const [amount, setAmount] = useState(10000);
  const [currency, setCurrency] = useState(defaultCurrency);
  
  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="KRW">KRW</option>
        <option value="USD">USD</option>
        <option value="JPY">JPY</option>
      </select>
      <p>{formatCurrency(amount, { currency })}</p>
    </div>
  );
}
```

## i18n-core와의 통합

이 패키지는 `@hua-labs/i18n-core`의 `useI18n` 훅을 사용하여 현재 언어를 자동으로 감지합니다. 언어가 변경되면 포맷팅도 자동으로 업데이트됩니다.

```tsx
import { I18nProvider, useTranslation } from '@hua-labs/i18n-core';
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';

function App() {
  return (
    <I18nProvider>
      <PriceDisplay />
    </I18nProvider>
  );
}

function PriceDisplay() {
  const { changeLanguage } = useTranslation();
  const { formatCurrency, currentLanguage } = useCurrencyFormatter();
  
  return (
    <div>
      <p>현재 언어: {currentLanguage}</p>
      <p>가격: {formatCurrency(10000)}</p>
      <button onClick={() => changeLanguage('ko')}>한국어</button>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ja')}>日本語</button>
    </div>
  );
}
```

## 성능 최적화

`useCurrencyFormatter` 훅은 `useMemo`를 사용하여 최적화되어 있습니다. 언어가 변경되지 않는 한 포맷팅 함수는 재생성되지 않습니다.

## 관련 패키지

- [`@hua-labs/i18n-core`](../hua-i18n-core/README.md) - i18n 핵심 패키지
- [`@hua-labs/i18n-date`](../hua-i18n-date/README.md) - 날짜 포맷팅
- [`@hua-labs/i18n-number`](../hua-i18n-number/README.md) - 숫자 포맷팅

## 라이선스

MIT
