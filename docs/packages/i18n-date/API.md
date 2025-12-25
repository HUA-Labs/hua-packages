# @hua-labs/i18n-date API 레퍼런스

## 훅

### useDateFormatter

날짜 포맷터 훅입니다.

#### 시그니처

```typescript
function useDateFormatter(): DateFormatterReturn
```

#### 반환값

`DateFormatterReturn` 타입의 객체를 반환합니다.

#### 예제

```tsx
import { useDateFormatter } from '@hua-labs/i18n-date';

function MyComponent() {
  const { monthNames, dayNames, formatDate } = useDateFormatter();
  
  return (
    <div>
      {monthNames.map((month, i) => (
        <span key={i}>{month}</span>
      ))}
    </div>
  );
}
```

## 유틸리티 함수

### formatDate

날짜를 포맷팅합니다.

#### 시그니처

```typescript
function formatDate(
  date: Date,
  options?: DateFormatterOptions
): string
```

#### 파라미터

- `date`: 포맷팅할 날짜
- `options`: 포맷 옵션 (선택)

#### 반환값

포맷팅된 날짜 문자열

#### 예제

```typescript
import { formatDate } from '@hua-labs/i18n-date';

formatDate(new Date()); // "2025-12-25"
formatDate(new Date(), { format: 'YYYY년 MM월 DD일' }); // "2025년 12월 25일"
```

### formatDateTime

날짜+시간을 포맷팅합니다.

#### 시그니처

```typescript
function formatDateTime(
  date: Date,
  options?: DateFormatterOptions
): string
```

#### 예제

```typescript
import { formatDateTime } from '@hua-labs/i18n-date';

formatDateTime(new Date()); // "2025-12-25 14:30:00"
```

### formatDateReadable

읽기 쉬운 형식으로 날짜를 포맷팅합니다 (한국어).

#### 시그니처

```typescript
function formatDateReadable(
  date: Date,
  timezone?: TimezoneConfig
): string
```

#### 예제

```typescript
import { formatDateReadable } from '@hua-labs/i18n-date';

formatDateReadable(new Date()); // "2025년 12월 25일 오후 2시 30분"
```

### formatRelativeTime

상대 시간을 포맷팅합니다.

#### 시그니처

```typescript
function formatRelativeTime(
  date: Date,
  options?: RelativeTimeOptions
): string
```

#### 예제

```typescript
import { formatRelativeTime } from '@hua-labs/i18n-date';

const date = new Date(Date.now() - 3 * 60 * 1000); // 3분 전
formatRelativeTime(date); // "3분 전"
```

### 타임존 함수

#### getKoreanDate

한국 시간 기준으로 Date 객체를 반환합니다.

```typescript
import { getKoreanDate } from '@hua-labs/i18n-date';

const koreanDate = getKoreanDate();
```

#### getKoreanDateString

한국 시간 기준으로 날짜 문자열을 반환합니다.

```typescript
import { getKoreanDateString } from '@hua-labs/i18n-date';

const dateString = getKoreanDateString(); // "2025-12-25"
```

#### convertToTimezone

타임존을 변환합니다.

```typescript
import { convertToTimezone } from '@hua-labs/i18n-date';

const jstDate = convertToTimezone(new Date(), { offset: 9 * 60 });
```

## 타입

### DateFormatterReturn

```typescript
interface DateFormatterReturn {
  monthNames: string[];
  dayNames: string[];
  formatDate: (date: Date, options?: DateFormatterOptions) => string;
  formatDateTime: (date: Date, options?: DateFormatterOptions) => string;
  formatRelativeTime: (date: Date, options?: RelativeTimeOptions) => string;
  currentLanguage: string;
}
```

### DateFormatterOptions

```typescript
interface DateFormatterOptions {
  format?: string;
  timezone?: TimezoneConfig;
}
```

### TimezoneConfig

```typescript
interface TimezoneConfig {
  offset?: number;
  name?: string;
}
```

### RelativeTimeOptions

```typescript
interface RelativeTimeOptions {
  minUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  maxUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  numeric?: boolean;
}
```

