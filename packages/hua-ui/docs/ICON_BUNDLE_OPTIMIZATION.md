# Icon 번들 최적화 가이드

## 현재 문제점

### 현재 구조의 문제
- `icons.ts`에서 **모든 Lucide 아이콘을 한 번에 import**
- 사용하지 않는 아이콘도 번들에 포함됨
- Tree-shaking이 제대로 작동하지 않을 수 있음

### 개선 방안

**옵션 1: 실제 사용되는 아이콘만 포함 (권장)**
- 실제 사용되는 아이콘만 `icons.ts`에 포함
- 나머지는 동적 import로 처리

**옵션 2: 완전 동적 로딩**
- 모든 아이콘을 동적으로 로드
- 첫 사용 시에만 로드

## 실제 사용되는 아이콘 목록 (my-app 기준)

grep 결과를 기반으로 실제 사용되는 아이콘들:

```
arrowLeft, arrowRight, arrowUp, arrowDown
download, upload, refresh, delete, search
settings, warning, alertCircle, success, error
zap, activity, circle, barChart, trendingUp, database
add, edit, bell, eye, clock, users, user
externalLink, book, logIn, home, heart
shield, fileText, key
```

## 권장 구조

### 1. 핵심 아이콘만 icons.ts에 포함

```tsx
// icons.ts - 실제 사용되는 아이콘만
import {
  // Navigation
  Home, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  // Actions
  Download, Upload, RefreshCw, Trash2, Search, Edit, Plus,
  // Status
  AlertCircle, CheckCircle, XCircle, Loader2,
  // UI
  Settings, Bell, Eye, EyeOff, Clock, Users, User,
  // Data
  BarChart, TrendingUp, Activity, Database, Zap, Circle,
  // Files
  FileText, ExternalLink,
  // Auth
  LogIn, Shield,
  // Content
  Book, Heart,
} from 'lucide-react'

export const icons = {
  home: Home,
  arrowLeft: ArrowLeft,
  // ... 실제 사용되는 것만
}
```

### 2. 나머지는 동적 로딩

```tsx
// Icon.tsx에서
if (iconSet === 'lucide') {
  // icons 객체에서 먼저 찾기
  IconComponent = icons[iconName] || null
  
  // 없으면 동적으로 Lucide에서 가져오기
  if (!IconComponent) {
    IconComponent = await getLucideIconDynamic(iconName)
  }
}
```

## 구현 제안

### 단계별 마이그레이션

**1단계: 현재 사용되는 아이콘 추출**
- my-app에서 실제 사용되는 아이콘 목록 생성
- icons.ts를 해당 아이콘만 포함하도록 수정

**2단계: 동적 로딩 fallback 추가**
- 매핑되지 않은 아이콘도 사용 가능하도록
- 첫 사용 시에만 로드

**3단계: 빌드 스크립트로 자동화**
- 사용되는 아이콘 자동 감지
- icons.ts 자동 업데이트

## 번들 크기 비교

### Before (현재)
- 모든 Lucide 아이콘 import
- 예상 크기: ~200KB+

### After (최적화)
- 실제 사용되는 아이콘만 (~50개)
- 예상 크기: ~50KB
- 절감: ~75%

