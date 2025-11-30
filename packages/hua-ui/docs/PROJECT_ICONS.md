# SumUp Project Icons

이 문서는 SumUp 프로젝트에서 실제로 사용되는 아이콘 목록을 정리합니다.

## 아이콘 최적화 전략

프로젝트에서 사용되는 아이콘만 선별하여 번들 크기를 최적화했습니다. `icon-providers.ts`의 `PROJECT_ICONS` 객체에 정의된 아이콘만 로드됩니다.

## 사용 중인 아이콘 목록

### Navigation & Layout (9개)
- `layout-dashboard` - 대시보드 레이아웃
- `folder` - 폴더/프로젝트
- `alert-circle` / `alertCircle` - 경고/이슈
- `columns` - 칸반 보드
- `users` - 팀 관리
- `settings` - 설정
- `menu` - 메뉴
- `close` - 닫기
- `chevronLeft` / `chevronRight` - 네비게이션 화살표

### Actions (5개)
- `add` - 추가
- `edit` - 편집
- `trash` - 삭제
- `upload` - 업로드
- `x` - 제거/닫기

### Status & Feedback (5개)
- `loader` / `loader2` - 로딩
- `check-circle` / `checkCircle` - 완료
- `refresh` / `refreshCw` - 새로고침
- `bell` - 알림

### User & Auth (5개)
- `user` - 사용자
- `logOut` - 로그아웃
- `chrome` - Google OAuth
- `github` - GitHub OAuth
- `message` - 카카오 OAuth

### Content (6개)
- `messageSquare` - 댓글
- `inbox` - 받은 편지함
- `star` - 즐겨찾기
- `calendar` - 일정
- `checkSquare` - 체크박스
- `clock` - 시간

### Priority (3개)
- `arrowUp` - 높은 우선순위
- `arrowDown` - 낮은 우선순위
- `remove` - 보통 우선순위

### Password (2개)
- `eye` - 비밀번호 보기
- `eyeOff` - 비밀번호 숨기기

## 총 40개 아이콘

## 아이콘 프로바이더별 매핑

각 아이콘은 세 가지 프로바이더에서 사용 가능합니다:

1. **Lucide Icons** (기본값)
2. **Phosphor Icons** (lazy load)
3. **Untitled Icons** (SVG 기반, 향후 구현)

## 사용 예시

```tsx
// Lucide Icons (기본)
<Icon name="folder" size={20} />

// Phosphor Icons
<Icon name="folder" provider="phosphor" size={20} />

// Untitled Icons (향후)
<Icon name="folder" provider="untitled" size={20} />
```

## 새 아이콘 추가하기

프로젝트에 새 아이콘이 필요한 경우:

1. `icon-providers.ts`의 `PROJECT_ICONS` 객체에 추가
2. 각 프로바이더별 아이콘 이름 매핑
3. `icons.ts`에 Lucide 아이콘 import 및 export 추가 (Lucide 사용 시)

## 번들 크기 최적화

- Phosphor Icons는 lazy loading으로 필요할 때만 로드됩니다
- 사용되지 않는 아이콘은 번들에서 제외됩니다
- Tree-shaking이 자동으로 적용됩니다

