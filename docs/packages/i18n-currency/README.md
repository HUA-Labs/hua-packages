# @hua-labs/i18n-currency

화폐 포맷팅 및 현지화 유틸리티 패키지입니다. `@hua-labs/i18n-core`와 통합하여 언어별 화폐 포맷팅 기능을 제공합니다.

## 설치

```bash
pnpm add @hua-labs/i18n-currency
# 또는
npm install @hua-labs/i18n-currency
```

## 빠른 시작

### 기본 사용법

```tsx
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';

function Price() {
  const { formatCurrency } = useCurrencyFormatter();
  
  return (
    <div>
      <p>가격: {formatCurrency(10000)}</p>
      <p>USD: {formatCurrency(10000, { currency: 'USD' })}</p>
    </div>
  );
}
```

## 주요 기능

### 1. 언어별 자동 통화 감지

현재 언어에 따라 기본 통화가 자동으로 설정됩니다.

- **한국어 (ko)**: KRW (₩)
- **영어 (en)**: USD ($)
- **일본어 (ja)**: JPY (¥)

```tsx
const { formatCurrency, defaultCurrency } = useCurrencyFormatter();

formatCurrency(10000); // 현재 언어의 기본 통화로 포맷팅
// 한국어: "₩10,000"
// 영어: "$10,000.00"
// 일본어: "¥10,000"
```

### 2. 통화별 포맷팅

각 통화는 고유한 포맷을 가집니다.

```tsx
const { formatCurrency } = useCurrencyFormatter();

formatCurrency(10000, { currency: 'KRW' }); // "₩10,000" (소수점 없음)
formatCurrency(10000, { currency: 'USD' }); // "$10,000.00" (소수점 2자리)
formatCurrency(10000, { currency: 'JPY' }); // "¥10,000" (소수점 없음)
formatCurrency(10000, { currency: 'EUR' }); // "€10,000.00"
```

### 3. 통화 기호 위치 제어

통화 기호를 앞이나 뒤에 배치할 수 있습니다.

```tsx
const { formatCurrency } = useCurrencyFormatter();

formatCurrency(10000, { symbolPosition: 'before' }); // "₩10,000"
formatCurrency(10000, { symbolPosition: 'after' }); // "10,000₩"
```

### 4. 통화 기호 숨기기

통화 기호 없이 숫자만 표시할 수 있습니다.

```tsx
const { formatCurrency } = useCurrencyFormatter();

formatCurrency(10000, { showSymbol: false }); // "10,000"
```

## API 레퍼런스

### useCurrencyFormatter

화폐 포맷터 훅입니다.

#### 반환값

```typescript
interface CurrencyFormatterReturn {
  formatCurrency: (value: number, options?: CurrencyFormatterOptions) => string;
  currentLanguage: string;
  defaultCurrency: string;
}
```

#### 예제

```tsx
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

## 옵션

### CurrencyFormatterOptions

```typescript
interface CurrencyFormatterOptions {
  currency?: string; // 'KRW', 'USD', 'JPY' 등
  minimumFractionDigits?: number; // 최소 소수점 자리수
  maximumFractionDigits?: number; // 최대 소수점 자리수
  showSymbol?: boolean; // 통화 기호 표시 여부
  symbolPosition?: 'before' | 'after'; // 통화 기호 위치
}
```

## 지원 통화

- **KRW**: 원화 (₩) - 소수점 없음
- **USD**: 달러 ($) - 소수점 2자리
- **JPY**: 엔화 (¥) - 소수점 없음
- **EUR**: 유로 (€) - 소수점 2자리
- **GBP**: 파운드 (£) - 소수점 2자리
- **CNY**: 위안 (¥) - 소수점 2자리

## 언어별 동작

패키지는 현재 언어 설정에 따라 자동으로 통화를 선택합니다:

- **한국어 (ko)**: KRW (₩10,000)
- **영어 (en)**: USD ($10,000.00)
- **일본어 (ja)**: JPY (¥10,000)

## 실제 사용 사례

### 가격 표시

```tsx
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';

function ProductCard({ price }: { price: number }) {
  const { formatCurrency } = useCurrencyFormatter();
  
  return (
    <div>
      <p className="text-2xl font-bold">{formatCurrency(price)}</p>
    </div>
  );
}
```

### 여러 통화 표시

```tsx
function PriceComparison() {
  const { formatCurrency } = useCurrencyFormatter();
  
  return (
    <div>
      <p>KRW: {formatCurrency(10000, { currency: 'KRW' })}</p>
      <p>USD: {formatCurrency(10000, { currency: 'USD' })}</p>
      <p>JPY: {formatCurrency(10000, { currency: 'JPY' })}</p>
    </div>
  );
}
```

## 관련 문서

- [i18n 패키지 개요](../i18n/README.md)
- [포맷터 통합 가이드](../i18n/FORMATTERS_GUIDE.md)
- [API 레퍼런스](./API.md)

## 라이선스

MIT

