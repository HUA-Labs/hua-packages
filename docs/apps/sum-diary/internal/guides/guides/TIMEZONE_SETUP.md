# 한국 시간대(KST) 설정 가이드

## 개요

이 프로젝트는 한국 시간대(KST, UTC+9)를 기준으로 날짜와 시간을 처리합니다. 데이터베이스는 PostgreSQL의 `TIMESTAMPTZ` 타입을 사용하여 타임존 정보를 저장하지만, 애플리케이션 레벨에서 한국 시간대를 명시적으로 처리합니다.

## 설정 방법

### 1. 데이터베이스 컨테이너 (Docker)

`docker-compose.yml`에서 PostgreSQL 컨테이너의 타임존을 설정합니다:

```yaml
services:
  postgres:
    environment:
      TZ: Asia/Seoul
```

이미 설정되어 있습니다.

### 2. 애플리케이션 코드

#### 날짜 유틸리티 함수 사용

모든 날짜/시간 처리는 `app/lib/date-utils.ts`의 유틸리티 함수를 사용합니다:

```typescript
import { 
  formatDateAsKorean,      // Date → YYYY-MM-DD (KST)
  formatDateTimeAsKorean,  // Date → YYYY-MM-DDTHH:mm:ss (KST)
  getKoreanDateString,     // 현재 날짜를 YYYY-MM-DD (KST)로
  parseDateAsKorean,       // YYYY-MM-DD → Date (KST 00:00:00)
  parseDateAsKoreanEndOfDay // YYYY-MM-DD → Date (KST 23:59:59.999)
} from '@/app/lib/date-utils';
```

#### ❌ 사용하지 말아야 할 것

```typescript
// ❌ 잘못된 방법: UTC로 변환되어 날짜가 하루 전으로 표시될 수 있음
date.toISOString().split('T')[0]
date.toISOString()

// ✅ 올바른 방법: 한국 시간대 기준
formatDateAsKorean(date)
formatDateTimeAsKorean(date)
```

### 3. API 응답

API에서 날짜를 반환할 때는 항상 한국 시간대 기준으로 포맷팅합니다:

```typescript
// 예시: 임시저장 목록 API
return {
  diary_date: draft.diary_date 
    ? formatDateAsKorean(draft.diary_date)  // ✅
    : null,
  created_at: formatDateTimeAsKorean(draft.created_at),  // ✅
  updated_at: formatDateTimeAsKorean(draft.updated_at),  // ✅
};
```

### 4. 데이터베이스 쿼리

날짜 범위 쿼리 시 한국 시간대를 고려합니다:

```typescript
import { parseDateAsKorean, parseDateAsKoreanEndOfDay } from '@/app/lib/date-utils';

const startOfDay = parseDateAsKorean('2025-01-15');  // 2025-01-15 00:00:00 KST
const endOfDay = parseDateAsKoreanEndOfDay('2025-01-15');  // 2025-01-15 23:59:59.999 KST

const diaries = await prisma.diaryEntry.findMany({
  where: {
    created_at: {
      gte: startOfDay,
      lte: endOfDay,
    },
  },
});
```

## 수정된 파일 목록

다음 파일들이 한국 시간대를 올바르게 처리하도록 수정되었습니다:

1. `app/lib/date-utils.ts` - 한국 시간대 유틸리티 함수 추가
2. `app/api/diary/draft/list/route.ts` - `toISOString()` → `formatDateAsKorean()` / `formatDateTimeAsKorean()`
3. `app/api/diary/draft/latest/route.ts` - `toISOString()` → `formatDateAsKorean()` / `formatDateTimeAsKorean()`
4. `app/api/admin/abuse-alerts/stats/route.ts` - `toISOString()` → `formatDateAsKorean()`
5. `app/api/admin/dashboard/charts/route.ts` - 로컬 날짜 포맷팅 함수 사용

## 주의사항

1. **프론트엔드**: 클라이언트 측에서 `toLocaleString('ko-KR')` 등을 사용하는 것은 괜찮지만, 서버 측에서는 항상 `date-utils.ts`의 함수를 사용해야 합니다.

2. **데이터베이스**: PostgreSQL의 `TIMESTAMPTZ` 타입은 타임존 정보를 저장하므로, 데이터베이스 자체의 타임존 설정보다는 애플리케이션 레벨에서 한국 시간대를 명시적으로 처리하는 것이 더 안전합니다.

3. **일관성**: 모든 날짜/시간 처리는 `date-utils.ts`의 함수를 통해 일관되게 처리해야 합니다.

## 테스트

한국 시간대 처리가 올바른지 확인하려면:

1. 한국 시간으로 2025-01-15 23:30:00에 데이터 생성
2. API 응답에서 날짜가 "2025-01-15"로 표시되는지 확인
3. UTC로 변환하면 2025-01-15 14:30:00이 되지만, 한국 시간대 기준으로는 2025-01-15로 표시되어야 함

