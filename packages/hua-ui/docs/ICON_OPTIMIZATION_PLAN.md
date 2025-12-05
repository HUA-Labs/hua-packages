# Icon 번들 최적화 계획

## 목표

실제 사용되는 아이콘만 번들에 포함하여 번들 크기를 최적화

## 현재 상태

### 문제점
- `icons.ts`에서 **모든 Lucide 아이콘 (200+개)을 한 번에 import**
- 사용하지 않는 아이콘도 번들에 포함
- 예상 번들 크기: ~200KB+

### 실제 사용되는 아이콘 (my-app 기준)

grep 결과를 기반으로 실제 사용되는 아이콘들:

**Navigation (10개)**
- arrowLeft, arrowRight, arrowUp, arrowDown, home, menu, close, search, settings, externalLink

**Actions (15개)**
- download, upload, refresh, delete, search, edit, add, save, copy, share, check, remove, undo, redo, scissors

**Status & Feedback (12개)**
- warning, alertCircle, success, error, info, loader, checkCircle, xCircle, bell, heart, star, bookmark

**Data & Analytics (8개)**
- barChart, trendingUp, activity, database, zap, circle, pieChart, lineChart

**User & Auth (8개)**
- user, users, userPlus, logIn, logOut, eye, eyeOff, shield

**Files & Content (6개)**
- fileText, file, folder, book, image, video

**Time & Date (4개)**
- clock, timer, calendar, calendarDays

**Communication (5개)**
- mail, phone, message, messageSquare, send

**Media (4개)**
- play, pause, camera, mic

**Emotions (5개)**
- smile, frown, meh, laugh, angry

**기타 (10개)**
- lock, unlock, key, brain, lightbulb, rocket, target, award, trophy, gem

**총 약 100개 정도**

## 개선 방안

### 옵션 1: 핵심 아이콘만 포함 + 동적 Fallback (권장)

**구조:**
```tsx
// icons.ts - 실제 사용되는 아이콘만 (~100개)
import {
  ArrowLeft, ArrowRight, Home, Settings, ...
} from 'lucide-react'

export const icons = {
  arrowLeft: ArrowLeft,
  // ... 실제 사용되는 것만
}

// Icon.tsx에서
if (iconSet === 'lucide') {
  // 1. icons.ts에서 먼저 찾기
  IconComponent = icons[iconName] || null
  
  // 2. 없으면 동적으로 Lucide에서 가져오기
  if (!IconComponent) {
    IconComponent = getIconFromProvider(iconName, iconSet)
  }
}
```

**장점:**
- 번들 크기 최적화 (100개만 포함)
- 매핑되지 않은 아이콘도 사용 가능 (동적 로딩)
- 점진적 마이그레이션 가능

**단점:**
- 매핑되지 않은 아이콘은 첫 사용 시 약간의 지연

### 옵션 2: 완전 동적 로딩

**구조:**
```tsx
// icons.ts 제거
// 모든 아이콘을 동적으로 로드

const getLucideIcon = async (iconName: string) => {
  const lucide = await import('lucide-react')
  return lucide[iconName]
}
```

**장점:**
- 최대 번들 크기 절감
- 사용하는 아이콘만 로드

**단점:**
- 모든 아이콘이 비동기 로딩
- 첫 사용 시 지연
- 복잡도 증가

## 구현 계획

### 1단계: 실제 사용되는 아이콘 추출

**스크립트 작성:**
```bash
# 실제 사용되는 아이콘 목록 생성
pnpm generate:used-icons
```

**출력:**
- `src/lib/used-icons.json` - 실제 사용되는 아이콘 목록
- `src/lib/icons.ts` - 해당 아이콘만 import

### 2단계: icons.ts 최적화

**Before:**
```tsx
// 200+개 아이콘 모두 import
import { Home, Menu, X, ... } from 'lucide-react'
```

**After:**
```tsx
// 실제 사용되는 100개만 import
import {
  ArrowLeft, ArrowRight, Home, Settings, ...
} from 'lucide-react'
```

### 3단계: 동적 Fallback 추가

**Icon.tsx 수정:**
```tsx
if (iconSet === 'lucide') {
  // 1. icons.ts에서 먼저 찾기
  IconComponent = icons[iconName] || null
  
  // 2. 없으면 동적으로 Lucide에서 가져오기
  if (!IconComponent) {
    IconComponent = getIconFromProvider(iconName, iconSet)
  }
}
```

## 예상 효과

### 번들 크기 비교

| 방식 | 아이콘 수 | 예상 크기 | 절감률 |
|------|----------|----------|--------|
| 현재 (모두 import) | 200+ | ~200KB | - |
| 최적화 (선택적) | ~100 | ~50KB | 75% |
| 완전 동적 | 0 (사용 시만) | ~10KB | 95% |

### 성능 영향

- **선택적 import**: 성능 영향 없음
- **완전 동적**: 첫 사용 시 약간의 지연 (수십 ms)

## 권장사항

**옵션 1 (선택적 import + 동적 fallback) 권장**

이유:
1. 번들 크기 최적화 (75% 절감)
2. 성능 영향 없음
3. 매핑되지 않은 아이콘도 사용 가능
4. 점진적 마이그레이션 가능

## 마이그레이션 가이드

### 단계별 진행

1. **실제 사용되는 아이콘 추출 스크립트 작성**
2. **icons.ts를 선택적 import로 변경**
3. **동적 fallback 추가**
4. **테스트 및 검증**

### 주의사항

- 매핑되지 않은 아이콘은 여전히 사용 가능 (동적 로딩)
- 새로운 아이콘 추가 시 icons.ts에 수동 추가 또는 스크립트 재실행
- 빌드 시 자동화 고려

