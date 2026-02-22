# i18n 포맷터 통합 가이드

이 가이드는 `@hua-labs/i18n-core`와 함께 사용할 수 있는 포맷터 패키지들을 소개합니다.

## 포맷터 패키지 목록

### 1. @hua-labs/i18n-date

날짜 포맷팅 및 현지화 유틸리티입니다.

**주요 기능:**
- 월/요일 이름 자동 추출
- 날짜 포맷팅 (YYYY-MM-DD, YYYY년 MM월 DD일 등)
- 타임존 처리
- 상대 시간 포맷팅 ("3분 전", "2시간 전" 등)

**문서:** [i18n-date README](../i18n-date/README.md)

### 2. @hua-labs/i18n-number

숫자 포맷팅 및 현지화 유틸리티입니다.

**주요 기능:**
- 천 단위 구분자 (1,000)
- 소수점 자리수 제어
- 퍼센트 포맷팅 (10%)
- 컴팩트 표기 (1K, 1M)

**문서:** [i18n-number README](../i18n-number/README.md)

### 3. @hua-labs/i18n-currency

화폐 포맷팅 및 현지화 유틸리티입니다.

**주요 기능:**
- 언어별 통화 자동 감지 (ko → KRW, en → USD, ja → JPY)
- 통화별 포맷팅 (₩1,000, $1,000.00 등)
- 통화 기호 위치 제어
- 소수점 자리수 자동 설정

**문서:** [i18n-currency README](../i18n-currency/README.md)

## 통합 사용 예시

### 여러 포맷터 함께 사용

```tsx
import { useTranslation } from '@hua-labs/i18n-core';
import { useDateFormatter } from '@hua-labs/i18n-date';
import { useNumberFormatter } from '@hua-labs/i18n-number';
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';

function Dashboard() {
  const { t } = useTranslation();
  const { formatDate, formatRelativeTime } = useDateFormatter();
  const { formatNumber, formatPercent } = useNumberFormatter();
  const { formatCurrency } = useCurrencyFormatter();
  
  const stats = {
    users: 1234567,
    revenue: 1000000,
    growth: 0.15,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
  };
  
  return (
    <div>
      <h1>{t('dashboard:title')}</h1>
      <div>
        <p>사용자 수: {formatNumber(stats.users)}</p>
        <p>매출: {formatCurrency(stats.revenue)}</p>
        <p>성장률: {formatPercent(stats.growth)}</p>
        <p>최종 업데이트: {formatRelativeTime(stats.lastUpdated)}</p>
      </div>
    </div>
  );
}
```

### 캘린더 컴포넌트

```tsx
import { useDateFormatter } from '@hua-labs/i18n-date';

function Calendar() {
  const { monthNames, dayNames, formatDate } = useDateFormatter();
  
  return (
    <div>
      <div className="month-names">
        {monthNames.map((month, i) => (
          <span key={i}>{month}</span>
        ))}
      </div>
      <div className="day-names">
        {dayNames.map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>
    </div>
  );
}
```

### 가격 표시

```tsx
import { useCurrencyFormatter } from '@hua-labs/i18n-currency';

function ProductCard({ price }: { price: number }) {
  const { formatCurrency, defaultCurrency } = useCurrencyFormatter();
  
  return (
    <div>
      <p className="price">{formatCurrency(price)}</p>
      <p className="currency-info">통화: {defaultCurrency}</p>
    </div>
  );
}
```

### 통계 대시보드

```tsx
import { useNumberFormatter } from '@hua-labs/i18n-number';

function Stats() {
  const { formatNumber, formatPercent, formatCompact } = useNumberFormatter();
  
  const data = {
    totalUsers: 1234567,
    activeUsers: 987654,
    conversionRate: 0.032,
    pageViews: 5000000,
  };
  
  return (
    <div>
      <div>
        <p>전체 사용자: {formatNumber(data.totalUsers)}</p>
        <p>활성 사용자: {formatNumber(data.activeUsers)}</p>
        <p>전환율: {formatPercent(data.conversionRate)}</p>
        <p>페이지뷰: {formatCompact(data.pageViews)}</p>
      </div>
    </div>
  );
}
```

## 패키지 선택 가이드

### 날짜 관련이 필요한 경우
→ `@hua-labs/i18n-date`

- 캘린더 컴포넌트
- 날짜 표시
- 상대 시간 표시 ("3분 전")

### 숫자 관련이 필요한 경우
→ `@hua-labs/i18n-number`

- 통계 표시
- 퍼센트 표시
- 큰 숫자 컴팩트 표기

### 화폐 관련이 필요한 경우
→ `@hua-labs/i18n-currency`

- 가격 표시
- 결제 금액
- 통화 변환

### 모두 필요한 경우
→ 모든 패키지 설치

```bash
pnpm add @hua-labs/i18n-date @hua-labs/i18n-number @hua-labs/i18n-currency
```

## 언어별 동작

모든 포맷터는 `@hua-labs/i18n-core`의 현재 언어 설정을 자동으로 사용합니다:

- **한국어 (ko)**: 한국 스타일 포맷
- **영어 (en)**: 미국 스타일 포맷
- **일본어 (ja)**: 일본 스타일 포맷

언어 변경 시 모든 포맷터가 자동으로 업데이트됩니다.

## 성능 고려사항

모든 포맷터 훅은 `useMemo`를 사용하여 최적화되어 있습니다. 언어가 변경되지 않는 한 포맷팅 함수는 재생성되지 않습니다.

## 관련 문서

- [i18n 패키지 개요](./README.md)
- [날짜 포맷터](../i18n-date/README.md)
- [숫자 포맷터](../i18n-number/README.md)
- [화폐 포맷터](../i18n-currency/README.md)

