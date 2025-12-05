# Icon 핵심 아이콘 목록

## my-app에서 실제 사용되는 아이콘

grep 결과를 기반으로 추출한 실제 사용 아이콘 목록:

### Navigation (10개)
- `arrowLeft` ⭐ (가장 많이 사용)
- `arrowRight`
- `arrowUp`
- `arrowDown`
- `home`
- `menu`
- `close` / `x`
- `search`
- `settings`
- `externalLink`

### Actions (8개)
- `add` ⭐
- `edit` ⭐
- `delete`
- `download` ⭐
- `upload`
- `refresh` ⭐
- `search`
- `save`

### Status & Feedback (10개)
- `warning` ⭐ (가장 많이 사용)
- `alertCircle` ⭐
- `success`
- `error`
- `info`
- `loader` / `spinner`
- `check`
- `checkCircle`
- `xCircle`
- `circle` ⭐

### User & Auth (6개)
- `user` ⭐
- `users` ⭐
- `logIn`
- `logOut`
- `eye`
- `eyeOff`

### Data & Analytics (6개)
- `barChart` ⭐
- `trendingUp` ⭐
- `activity` ⭐
- `database` ⭐
- `zap` ⭐
- `circle`

### Files & Content (4개)
- `fileText` ⭐
- `file`
- `folder`
- `book` ⭐

### Communication (3개)
- `mail` / `email`
- `message`
- `phone`

### Media (3개)
- `image`
- `video`
- `camera`

### Emotions (3개)
- `smile`
- `frown`
- `meh`

### Security (3개)
- `lock`
- `unlock`
- `shield` ⭐

### Time & Date (2개)
- `clock` ⭐
- `calendar`

### UI Elements (5개)
- `bell` ⭐
- `heart` ⭐
- `star`
- `bookmark`
- `share`

### 기타 (2개)
- `chevronLeft`
- `chevronRight`

**총 약 70개**

## UI 컴포넌트에서 자주 사용되는 아이콘

### 필수 아이콘 (항상 포함)
- Navigation: `home`, `arrowLeft`, `arrowRight`, `menu`, `close`
- Actions: `search`, `settings`, `edit`, `delete`, `add`
- Status: `loader`, `success`, `error`, `warning`, `info`
- User: `user`, `users`, `logIn`, `logOut`
- UI: `bell`, `heart`, `star`, `bookmark`

## 최종 핵심 아이콘 목록 (~70개)

### Navigation (10개)
```tsx
Home, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
Menu, X, Search, Settings, ExternalLink
```

### Actions (8개)
```tsx
Edit, Trash2, Plus, Minus, Download, Upload,
RefreshCw, Save
```

### Status & Feedback (10개)
```tsx
Loader2, CheckCircle, XCircle, AlertCircle, Info,
Check, Circle, WarningCircle
```

### User & Auth (6개)
```tsx
User, Users, LogIn, LogOut, Eye, EyeOff
```

### Data & Analytics (6개)
```tsx
BarChart3, TrendingUp, Activity, Database, Zap, Circle
```

### Files & Content (4개)
```tsx
FileText, File, Folder, Book
```

### Communication (3개)
```tsx
Mail, MessageCircle, Phone
```

### Media (3개)
```tsx
Image, Video, Camera
```

### Emotions (3개)
```tsx
Smile, Frown, Meh
```

### Security (3개)
```tsx
Lock, Unlock, Shield
```

### Time & Date (2개)
```tsx
Clock, Calendar
```

### UI Elements (5개)
```tsx
Bell, Heart, Star, Bookmark, Share
```

### Navigation Helpers (2개)
```tsx
ChevronLeft, ChevronRight
```

## 번들 크기 예상

### Before (현재)
- 모든 Lucide 아이콘 (200+개)
- 예상 크기: ~200KB+

### After (최적화)
- 핵심 아이콘만 (~70개)
- 예상 크기: ~50-60KB
- 절감: ~70-75%

## 동적 Fallback

나머지 아이콘은 동적 fallback으로 처리:
- `icons.ts`에 없는 아이콘은 자동으로 동적 로딩
- 첫 사용 시에만 로드 (약간의 지연)
- 이후에는 캐시되어 즉시 사용

## 점진적 추가

새로운 아이콘이 자주 사용되면:
1. 사용 빈도 모니터링
2. 핵심 아이콘에 추가
3. 번들 크기 재확인

