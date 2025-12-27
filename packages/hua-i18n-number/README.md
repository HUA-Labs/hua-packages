# @hua-labs/i18n-number

HUA Labs - 숫자 포맷팅 및 현지화 유틸리티

`@hua-labs/i18n-core`와 통합하여 언어별 숫자 포맷팅 기능을 제공하는 패키지입니다.

## 설치

```bash
pnpm add @hua-labs/i18n-number @hua-labs/i18n-core
# 또는
npm install @hua-labs/i18n-number @hua-labs/i18n-core
# 또는
yarn add @hua-labs/i18n-number @hua-labs/i18n-core
```

## 기본 사용법

### React 훅 사용

```tsx
import { useNumberFormatter } from '@hua-labs/i18n-number';
import { I18nProvider } from '@hua-labs/i18n-core';

function Stats() {
  const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
  
  return (
    <div>
      <p>사용자 수: {formatNumber(1234567)}</p>
      {/* 한국어: 1,234,567 */}
      {/* 영어: 1,234,567 */}
      
      <p>성공률: {formatPercent(0.95)}</p>
      {/* 95% */}
      
      <p>조회수: {formatCompact(1000000)}</p>
      {/* 한국어: 100만 */}
      {/* 영어: 1M */}
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <Stats />
    </I18nProvider>
  );
}
```

### 유틸리티 함수 사용

```tsx
import { formatNumber, formatPercent, formatCompact } from '@hua-labs/i18n-number';

// 기본 숫자 포맷
formatNumber(1234567); // "1,234,567"

// 소수점 제어
formatNumber(1234.567, { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}); // "1,234.57"

// 컴팩트 표기
formatCompact(1000000); // "1M" (영어) 또는 "100만" (한국어)

// 퍼센트 포맷
formatPercent(0.95); // "95%"
formatPercent(0.1234, { maximumFractionDigits: 1 }); // "12.3%"
```

## API 레퍼런스

### `useNumberFormatter()`

숫자 포맷터 훅입니다.

#### 반환값

```typescript
interface NumberFormatterReturn {
  /**
   * 숫자 포맷팅 함수
   */
  formatNumber: (value: number, options?: NumberFormatterOptions) => string;
  
  /**
   * 퍼센트 포맷팅 함수
   */
  formatPercent: (value: number, options?: PercentFormatterOptions) => string;
  
  /**
   * 컴팩트 표기 포맷팅 함수
   */
  formatCompact: (value: number, options?: NumberFormatterOptions) => string;
  
  /**
   * 현재 언어 코드
   */
  currentLanguage: string;
}
```

#### 예제

```tsx
function MyComponent() {
  const { 
    formatNumber, 
    formatPercent, 
    formatCompact,
    currentLanguage 
  } = useNumberFormatter();
  
  return (
    <div>
      <p>현재 언어: {currentLanguage}</p>
      <p>숫자: {formatNumber(1234567)}</p>
      <p>퍼센트: {formatPercent(0.95)}</p>
      <p>컴팩트: {formatCompact(1000000)}</p>
    </div>
  );
}
```

### `formatNumber(value, options?, locale?)`

숫자를 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `value` (number): 포맷팅할 숫자
- `options` (NumberFormatterOptions, 선택): 포맷 옵션
- `locale` (string, 선택): 로케일 (기본값: 'ko')

#### 옵션

```typescript
interface NumberFormatterOptions {
  /**
   * 최소 소수점 자리수
   */
  minimumFractionDigits?: number;
  
  /**
   * 최대 소수점 자리수
   */
  maximumFractionDigits?: number;
  
  /**
   * 천 단위 구분자 사용 여부
   */
  useGrouping?: boolean;
  
  /**
   * 표기법
   * - 'standard': 일반 표기 (1,000)
   * - 'compact': 컴팩트 표기 (1K, 1M)
   */
  notation?: 'standard' | 'compact';
}
```

#### 예제

```typescript
import { formatNumber } from '@hua-labs/i18n-number';

formatNumber(1234567); // "1,234,567"
formatNumber(1234.567, { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}); // "1,234.57"
formatNumber(1234567, { useGrouping: false }); // "1234567"
```

### `formatPercent(value, options?, locale?)`

퍼센트를 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `value` (number): 포맷팅할 퍼센트 값 (0.95 = 95%)
- `options` (PercentFormatterOptions, 선택): 포맷 옵션
- `locale` (string, 선택): 로케일 (기본값: 'ko')

#### 옵션

```typescript
interface PercentFormatterOptions {
  /**
   * 최소 소수점 자리수
   */
  minimumFractionDigits?: number;
  
  /**
   * 최대 소수점 자리수
   */
  maximumFractionDigits?: number;
  
  /**
   * 부호 표시 방식
   * - 'auto': 필요시만 표시
   * - 'always': 항상 표시
   * - 'never': 표시하지 않음
   */
  signDisplay?: 'auto' | 'always' | 'never';
}
```

#### 예제

```typescript
import { formatPercent } from '@hua-labs/i18n-number';

formatPercent(0.95); // "95%"
formatPercent(0.1234, { maximumFractionDigits: 1 }); // "12.3%"
formatPercent(0.05, { minimumFractionDigits: 2 }); // "5.00%"
```

### `formatCompact(value, options?, locale?)`

컴팩트 표기로 숫자를 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `value` (number): 포맷팅할 숫자
- `options` (NumberFormatterOptions, 선택): 포맷 옵션
- `locale` (string, 선택): 로케일 (기본값: 'ko')

#### 예제

```typescript
import { formatCompact } from '@hua-labs/i18n-number';

formatCompact(1000); // "1K" (영어) 또는 "1천" (한국어)
formatCompact(1000000); // "1M" (영어) 또는 "100만" (한국어)
formatCompact(1000000000); // "1B" (영어) 또는 "10억" (한국어)
```

## 사용 예시

### 통계 대시보드

```tsx
function Dashboard() {
  const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
  
  const stats = {
    totalUsers: 1234567,
    activeUsers: 987654,
    conversionRate: 0.032,
    pageViews: 5000000,
  };
  
  return (
    <div>
      <div>
        <h3>전체 사용자</h3>
        <p>{formatNumber(stats.totalUsers)}</p>
      </div>
      <div>
        <h3>활성 사용자</h3>
        <p>{formatNumber(stats.activeUsers)}</p>
      </div>
      <div>
        <h3>전환율</h3>
        <p>{formatPercent(stats.conversionRate)}</p>
      </div>
      <div>
        <h3>페이지뷰</h3>
        <p>{formatCompact(stats.pageViews)}</p>
      </div>
    </div>
  );
}
```

### 숫자 입력 포맷팅

```tsx
function NumberInput() {
  const { formatNumber } = useNumberFormatter();
  const [value, setValue] = useState(0);
  
  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <p>포맷팅된 값: {formatNumber(value)}</p>
    </div>
  );
}
```

### 퍼센트 표시

```tsx
function ProgressBar({ value, max }: { value: number; max: number }) {
  const { formatPercent } = useNumberFormatter();
  const percentage = value / max;
  
  return (
    <div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage * 100}%` }}
        />
      </div>
      <p>{formatPercent(percentage)}</p>
    </div>
  );
}
```

### 큰 숫자 컴팩트 표기

```tsx
function SocialStats() {
  const { formatCompact } = useNumberFormatter();
  
  const stats = [
    { label: '팔로워', value: 1234567 },
    { label: '좋아요', value: 987654 },
    { label: '댓글', value: 54321 },
  ];
  
  return (
    <div>
      {stats.map((stat, i) => (
        <div key={i}>
          <span>{stat.label}: </span>
          <span>{formatCompact(stat.value)}</span>
        </div>
      ))}
    </div>
  );
}
```

## 언어별 동작

### 한국어 (ko)

- 천 단위 구분자: 쉼표 (1,234,567)
- 컴팩트 표기: 만, 억 단위 사용 (100만, 10억)

### 영어 (en)

- 천 단위 구분자: 쉼표 (1,234,567)
- 컴팩트 표기: K, M, B 사용 (1K, 1M, 1B)

### 일본어 (ja)

- 천 단위 구분자: 쉼표 (1,234,567)
- 컴팩트 표기: 만, 억 단위 사용 (100万, 1億)

## i18n-core와의 통합

이 패키지는 `@hua-labs/i18n-core`의 `useI18n` 훅을 사용하여 현재 언어를 자동으로 감지합니다. 언어가 변경되면 포맷팅도 자동으로 업데이트됩니다.

```tsx
import { I18nProvider, useTranslation } from '@hua-labs/i18n-core';
import { useNumberFormatter } from '@hua-labs/i18n-number';

function App() {
  return (
    <I18nProvider>
      <NumberDisplay />
    </I18nProvider>
  );
}

function NumberDisplay() {
  const { changeLanguage } = useTranslation();
  const { formatNumber, formatCompact, currentLanguage } = useNumberFormatter();
  
  return (
    <div>
      <p>현재 언어: {currentLanguage}</p>
      <p>숫자: {formatNumber(1234567)}</p>
      <p>컴팩트: {formatCompact(1000000)}</p>
      <button onClick={() => changeLanguage('ko')}>한국어</button>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ja')}>日本語</button>
    </div>
  );
}
```

## 성능 최적화

`useNumberFormatter` 훅은 `useMemo`를 사용하여 최적화되어 있습니다. 언어가 변경되지 않는 한 포맷팅 함수는 재생성되지 않습니다.

## 관련 패키지

- [`@hua-labs/i18n-core`](../hua-i18n-core/README.md) - i18n 핵심 패키지
- [`@hua-labs/i18n-currency`](../hua-i18n-currency/README.md) - 화폐 포맷팅
- [`@hua-labs/i18n-date`](../hua-i18n-date/README.md) - 날짜 포맷팅

## 라이선스

MIT
