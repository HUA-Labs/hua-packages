# @hua-labs/i18n-date

날짜 포맷팅 및 현지화 유틸리티 패키지입니다. `@hua-labs/i18n-core`와 통합하여 번역 데이터에서 월/요일 이름을 자동으로 가져오고, 날짜 포맷팅 기능을 제공합니다.

## 설치

```bash
pnpm add @hua-labs/i18n-date
# 또는
npm install @hua-labs/i18n-date
```

## 빠른 시작

### 기본 사용법

```tsx
import { useDateFormatter } from '@hua-labs/i18n-date';

function Calendar() {
  const { monthNames, dayNames, formatDate } = useDateFormatter();
  
  return (
    <div>
      <h2>월 이름</h2>
      {monthNames.map((month, i) => (
        <span key={i}>{month}</span>
      ))}
      
      <h2>요일 이름</h2>
      {dayNames.map((day, i) => (
        <span key={i}>{day}</span>
      ))}
      
      <p>오늘: {formatDate(new Date())}</p>
    </div>
  );
}
```

### 번역 파일 설정

`useDateFormatter`는 번역 데이터에서 `month_names`와 `day_names` 배열을 자동으로 가져옵니다.

**translations/ko/common.json:**
```json
{
  "month_names": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  "day_names": ["일", "월", "화", "수", "목", "금", "토"]
}
```

**translations/en/common.json:**
```json
{
  "month_names": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "day_names": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
}
```

## API 레퍼런스

### useDateFormatter

날짜 포맷터 훅입니다. 번역 데이터에서 월/요일 이름을 자동으로 추출하고, 날짜 포맷팅 함수들을 제공합니다.

#### 반환값

```typescript
interface DateFormatterReturn {
  /** 월 이름 배열 (현재 언어 기준) */
  monthNames: string[];
  
  /** 요일 이름 배열 (현재 언어 기준) */
  dayNames: string[];
  
  /** 날짜 포맷팅 함수 */
  formatDate: (date: Date, options?: DateFormatterOptions) => string;
  
  /** 날짜+시간 포맷팅 함수 */
  formatDateTime: (date: Date, options?: DateFormatterOptions) => string;
  
  /** 상대 시간 포맷팅 함수 ("3분 전", "2시간 전" 등) */
  formatRelativeTime: (date: Date, options?: RelativeTimeOptions) => string;
  
  /** 현재 언어 코드 */
  currentLanguage: string;
}
```

#### 예제

```tsx
function MyComponent() {
  const { monthNames, dayNames, formatDate, formatDateTime, formatRelativeTime } = useDateFormatter();
  
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return (
    <div>
      <p>오늘: {formatDate(now)}</p>
      <p>어제: {formatRelativeTime(yesterday)}</p>
      <p>현재 시간: {formatDateTime(now)}</p>
    </div>
  );
}
```

## 유틸리티 함수

### 날짜 포맷팅

```typescript
import { formatDate, formatDateTime, formatDateReadable } from '@hua-labs/i18n-date';

// 기본 포맷 (YYYY-MM-DD)
formatDate(new Date());

// 커스텀 포맷
formatDate(new Date(), { format: 'YYYY년 MM월 DD일' });

// 날짜+시간
formatDateTime(new Date(), { format: 'YYYY-MM-DD HH:mm:ss' });

// 읽기 쉬운 형식 (한국어)
formatDateReadable(new Date());
```

### 타임존 처리

```typescript
import { getKoreanDate, getKoreanDateString, KST_OFFSET } from '@hua-labs/i18n-date';

// 한국 시간 기준 Date 객체
const koreanDate = getKoreanDate();

// 한국 시간 기준 날짜 문자열
const dateString = getKoreanDateString();

// 커스텀 타임존
import { convertToTimezone } from '@hua-labs/i18n-date';
const jstDate = convertToTimezone(new Date(), { offset: 9 * 60 }); // JST
```

### 상대 시간

```typescript
import { formatRelativeTime } from '@hua-labs/i18n-date';

const date = new Date(Date.now() - 3 * 60 * 1000); // 3분 전
formatRelativeTime(date); // "3분 전"

// 옵션 설정
formatRelativeTime(date, {
  minUnit: 'minute',
  maxUnit: 'hour',
  numeric: true,
});
```

## 타입 정의

### DateFormatterOptions

```typescript
interface DateFormatterOptions {
  /** 날짜 포맷 문자열 */
  format?: string;
  
  /** 타임존 설정 */
  timezone?: TimezoneConfig;
}
```

### TimezoneConfig

```typescript
interface TimezoneConfig {
  /** 타임존 오프셋 (분 단위) */
  offset?: number;
  
  /** 타임존 이름 */
  name?: string;
}
```

### RelativeTimeOptions

```typescript
interface RelativeTimeOptions {
  /** 최소 단위 */
  minUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /** 최대 단위 */
  maxUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /** 숫자 표시 여부 */
  numeric?: boolean;
}
```

## 실제 사용 사례

### 캘린더 컴포넌트

```tsx
import { useDateFormatter } from '@hua-labs/i18n-date';

function Calendar() {
  const { monthNames, dayNames } = useDateFormatter();
  
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

### 날짜 표시

```tsx
import { useDateFormatter } from '@hua-labs/i18n-date';

function DiaryEntry({ createdAt }: { createdAt: Date }) {
  const { formatDate, formatRelativeTime } = useDateFormatter();
  
  return (
    <div>
      <p>작성일: {formatDate(createdAt)}</p>
      <p>작성 시간: {formatRelativeTime(createdAt)}</p>
    </div>
  );
}
```

## 관련 패키지

이 패키지는 `@hua-labs/i18n-core`와 함께 사용됩니다. 다른 포맷터 패키지도 함께 사용할 수 있습니다:

- **@hua-labs/i18n-number**: 숫자 포맷팅 (천 단위 구분자, 퍼센트, 컴팩트 표기)
- **@hua-labs/i18n-currency**: 화폐 단위 포맷팅 (언어별 통화 자동 감지, 통화별 포맷팅)
- **@hua-labs/i18n-unit**: 단위 포맷팅 (향후 추가 예정)

각 포맷터 패키지는 독립적으로 설치 가능하며, 필요에 따라 조합하여 사용할 수 있습니다.

자세한 내용은 [포맷터 통합 가이드](../i18n/FORMATTERS_GUIDE.md)를 참고하세요.

## 관련 문서

- [i18n 패키지 개요](../i18n/README.md)
- [배열 타입 번역 키 접근 가이드](../i18n/ARRAY_TRANSLATION_KEYS.md)
- [API 레퍼런스](./API.md)

## 라이선스

MIT

