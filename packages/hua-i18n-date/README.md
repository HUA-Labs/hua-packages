# @hua-labs/i18n-date

HUA Labs - 날짜 포맷팅 및 현지화 유틸리티

`@hua-labs/i18n-core`와 통합하여 언어별 날짜 포맷팅 및 타임존 처리 기능을 제공하는 패키지입니다.

## 설치

```bash
pnpm add @hua-labs/i18n-date @hua-labs/i18n-core
# 또는
npm install @hua-labs/i18n-date @hua-labs/i18n-core
# 또는
yarn add @hua-labs/i18n-date @hua-labs/i18n-core
```

## 기본 사용법

### React 훅 사용

```tsx
import { useDateFormatter } from '@hua-labs/i18n-date';
import { I18nProvider } from '@hua-labs/i18n-core';

function Calendar() {
  const { monthNames, dayNames, formatDate, formatRelativeTime } = useDateFormatter();
  
  return (
    <div>
      <h2>월 이름</h2>
      {monthNames.map((month, i) => (
        <span key={i}>{month} </span>
      ))}
      
      <h2>요일 이름</h2>
      {dayNames.map((day, i) => (
        <span key={i}>{day} </span>
      ))}
      
      <p>오늘: {formatDate(new Date())}</p>
      <p>3분 전: {formatRelativeTime(new Date(Date.now() - 3 * 60 * 1000))}</p>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <Calendar />
    </I18nProvider>
  );
}
```

### 유틸리티 함수 사용

```tsx
import { formatDate, formatDateTime, formatRelativeTime } from '@hua-labs/i18n-date';

// 기본 날짜 포맷
formatDate(new Date()); // "2025-12-26"

// 커스텀 포맷
formatDate(new Date(), { format: 'YYYY년 MM월 DD일' }); // "2025년 12월 26일"

// 날짜+시간 포맷
formatDateTime(new Date()); // "2025-12-26 14:30:00"

// 상대 시간
formatRelativeTime(new Date(Date.now() - 3 * 60 * 1000)); // "3분 전"
formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)); // "2시간 전"
```

## API 레퍼런스

### `useDateFormatter()`

날짜 포맷터 훅입니다. 번역 데이터에서 `month_names`, `day_names`를 자동으로 추출합니다.

#### 반환값

```typescript
interface DateFormatterReturn {
  /**
   * 월 이름 배열 (현재 언어 기준)
   */
  monthNames: string[];
  
  /**
   * 요일 이름 배열 (현재 언어 기준)
   */
  dayNames: string[];
  
  /**
   * 날짜 포맷팅 함수
   */
  formatDate: (date: Date, options?: DateFormatterOptions) => string;
  
  /**
   * 날짜+시간 포맷팅 함수
   */
  formatDateTime: (date: Date, options?: DateFormatterOptions) => string;
  
  /**
   * 상대 시간 포맷팅 함수 ("3분 전", "2시간 전" 등)
   */
  formatRelativeTime: (date: Date, options?: RelativeTimeOptions) => string;
  
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
    monthNames, 
    dayNames, 
    formatDate, 
    formatDateTime,
    formatRelativeTime,
    currentLanguage 
  } = useDateFormatter();
  
  const now = new Date();
  
  return (
    <div>
      <p>현재 언어: {currentLanguage}</p>
      <p>오늘: {formatDate(now)}</p>
      <p>현재 시간: {formatDateTime(now)}</p>
      <p>상대 시간: {formatRelativeTime(now)}</p>
    </div>
  );
}
```

### `formatDate(date, options?)`

날짜를 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `date` (Date): 포맷팅할 날짜
- `options` (DateFormatterOptions, 선택): 포맷 옵션

#### 옵션

```typescript
interface DateFormatterOptions {
  /**
   * 날짜 포맷 문자열
   * - 'YYYY-MM-DD': 기본 날짜 형식
   * - 'YYYY-MM-DD HH:mm:ss': 날짜 + 시간
   * - 'YYYY년 MM월 DD일': 한국어 형식
   * - 'MM/DD/YYYY': 미국 형식
   * - 'DD/MM/YYYY': 유럽 형식
   */
  format?: string;
  
  /**
   * 타임존 설정
   */
  timezone?: TimezoneConfig;
}
```

#### 예제

```typescript
import { formatDate } from '@hua-labs/i18n-date';

formatDate(new Date()); // "2025-12-26"
formatDate(new Date(), { format: 'YYYY년 MM월 DD일' }); // "2025년 12월 26일"
formatDate(new Date(), { format: 'MM/DD/YYYY' }); // "12/26/2025"
```

### `formatDateTime(date, options?)`

날짜와 시간을 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `date` (Date): 포맷팅할 날짜
- `options` (DateFormatterOptions, 선택): 포맷 옵션

#### 예제

```typescript
import { formatDateTime } from '@hua-labs/i18n-date';

formatDateTime(new Date()); // "2025-12-26 14:30:00"
formatDateTime(new Date(), { format: 'YYYY-MM-DD HH:mm' }); // "2025-12-26 14:30"
```

### `formatRelativeTime(date, options?)`

상대 시간을 포맷팅하는 유틸리티 함수입니다.

#### 파라미터

- `date` (Date): 기준 날짜
- `options` (RelativeTimeOptions, 선택): 포맷 옵션

#### 옵션

```typescript
interface RelativeTimeOptions {
  /**
   * 최소 단위 (초, 분, 시간, 일, 주, 월, 년)
   */
  minUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /**
   * 최대 단위
   */
  maxUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  
  /**
   * 숫자 표시 여부
   * true: "3분 전", false: "방금 전" (1분 미만)
   */
  numeric?: boolean;
}
```

#### 예제

```typescript
import { formatRelativeTime } from '@hua-labs/i18n-date';

const now = new Date();
formatRelativeTime(new Date(now.getTime() - 3 * 60 * 1000)); // "3분 전"
formatRelativeTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)); // "2시간 전"
formatRelativeTime(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)); // "5일 전"
```

### 타임존 유틸리티

```typescript
import { 
  applyTimezoneOffset,
  getKoreanDate,
  getKoreanDateString,
  parseDateAsTimezone,
  convertToTimezone,
  KST_OFFSET
} from '@hua-labs/i18n-date';

// 한국 시간으로 변환
const koreanDate = getKoreanDate(new Date());

// 타임존 오프셋 적용
const offsetDate = applyTimezoneOffset(new Date(), KST_OFFSET);

// 타임존 변환
const converted = convertToTimezone(new Date(), { offset: 540 }); // UTC+9
```

## 번역 데이터 구조

이 패키지는 `@hua-labs/i18n-core`의 번역 데이터에서 `month_names`와 `day_names`를 자동으로 추출합니다.

### 필요한 번역 데이터 구조

```json
{
  "common": {
    "month_names": [
      "1월", "2월", "3월", "4월", "5월", "6월",
      "7월", "8월", "9월", "10월", "11월", "12월"
    ],
    "day_names": [
      "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"
    ]
  }
}
```

## 사용 예시

### 캘린더 컴포넌트

```tsx
function Calendar() {
  const { monthNames, dayNames, formatDate } = useDateFormatter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  return (
    <div>
      <h2>{monthNames[currentMonth.getMonth()]}</h2>
      <div className="weekdays">
        {dayNames.map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>
      {/* 캘린더 그리드 */}
    </div>
  );
}
```

### 상대 시간 표시

```tsx
function PostList() {
  const { formatRelativeTime } = useDateFormatter();
  
  const posts = [
    { id: 1, title: '첫 번째 글', createdAt: new Date(Date.now() - 3 * 60 * 1000) },
    { id: 2, title: '두 번째 글', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  ];
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{formatRelativeTime(post.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
```

### 타임존 처리

```tsx
function TimezoneDisplay() {
  const { formatDateTime } = useDateFormatter();
  const date = new Date();
  
  return (
    <div>
      <p>로컬 시간: {formatDateTime(date)}</p>
      <p>한국 시간: {formatDateTime(date, { 
        timezone: { offset: 540 } // UTC+9
      })}</p>
      <p>미국 동부 시간: {formatDateTime(date, { 
        timezone: { offset: -300 } // UTC-5
      })}</p>
    </div>
  );
}
```

## i18n-core와의 통합

이 패키지는 `@hua-labs/i18n-core`의 `useI18n` 훅을 사용하여 현재 언어를 자동으로 감지합니다. 언어가 변경되면 월/요일 이름과 포맷팅도 자동으로 업데이트됩니다.

```tsx
import { I18nProvider, useTranslation } from '@hua-labs/i18n-core';
import { useDateFormatter } from '@hua-labs/i18n-date';

function App() {
  return (
    <I18nProvider>
      <DateDisplay />
    </I18nProvider>
  );
}

function DateDisplay() {
  const { changeLanguage } = useTranslation();
  const { monthNames, formatDate, currentLanguage } = useDateFormatter();
  
  return (
    <div>
      <p>현재 언어: {currentLanguage}</p>
      <p>오늘: {formatDate(new Date())}</p>
      <button onClick={() => changeLanguage('ko')}>한국어</button>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ja')}>日本語</button>
    </div>
  );
}
```

## 성능 최적화

`useDateFormatter` 훅은 `useMemo`를 사용하여 최적화되어 있습니다. 언어가 변경되지 않는 한 포맷팅 함수는 재생성되지 않습니다.

## 관련 패키지

- [`@hua-labs/i18n-core`](../hua-i18n-core/README.md) - i18n 핵심 패키지
- [`@hua-labs/i18n-currency`](../hua-i18n-currency/README.md) - 화폐 포맷팅
- [`@hua-labs/i18n-number`](../hua-i18n-number/README.md) - 숫자 포맷팅

## 라이선스

MIT
