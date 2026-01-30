# Component API Guidelines

> hua-ui 컴포넌트 API 설계 원칙

## 핵심 원칙: 기본값 + 오버라이드

모든 스타일 관련 로직은 **합리적인 기본값**을 제공하되, 서비스에서 **오버라이드 가능한 구조**로 설계한다.

```tsx
// BAD - 하드코딩, 서비스에서 변경 불가
const baseClasses = merge(
  "rounded-xl px-3 py-2",
  item.active
    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100"
    : "text-slate-600 hover:bg-slate-100"
);

// GOOD - 기본값 제공 + prop으로 오버라이드
const defaultActive = "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100";
const defaultItem = "text-slate-600 hover:bg-slate-100";
const baseClasses = merge(
  "rounded-xl px-3 py-2",
  item.active
    ? (activeClassName || defaultActive)
    : (itemClassName || defaultItem)
);
```

## 적용 패턴

### 1. className 오버라이드

가장 기본적인 패턴. 컴포넌트 루트 요소의 스타일을 외부에서 변경.

```tsx
interface Props {
  className?: string; // 루트 요소
}
```

### 2. 내부 요소 className 오버라이드

내부 하위 요소의 스타일을 변경해야 할 때.

```tsx
interface Props {
  className?: string;        // 루트
  itemClassName?: string;    // 아이템 기본 상태
  activeClassName?: string;  // 아이템 활성 상태
  headerClassName?: string;  // 헤더 영역
}
```

네이밍: `{요소}ClassName` 형태 (camelCase)

### 3. variant 패턴

미리 정의된 스타일 세트가 필요할 때.

```tsx
interface Props {
  variant?: "default" | "transparent" | "glass" | "minimal";
}
```

variant는 **시맨틱한 의미**가 있을 때만 사용. 단순 색상 변경은 className 오버라이드가 적절.

### 4. 기능 토글

UI 요소의 표시/숨김 제어.

```tsx
interface Props {
  hideToggle?: boolean;    // 토글 버튼 숨기기
  hideFooter?: boolean;    // 푸터 숨기기
  showArrow?: boolean;     // 화살표 표시
}
```

네이밍: `hide{요소}` (숨기기) / `show{요소}` (보이기)

### 5. render prop / slot 패턴

완전한 커스터마이징이 필요할 때.

```tsx
interface Props {
  renderItem?: (item: Item, isActive: boolean) => React.ReactNode;
  footerActions?: React.ReactNode;
  logo?: React.ReactNode;
}
```

## 체크리스트

새 컴포넌트 또는 기존 컴포넌트 수정 시:

- [ ] 하드코딩된 색상/스타일이 외부에서 변경 가능한가?
- [ ] `!important` 없이 스타일 오버라이드가 가능한가?
- [ ] 기본값이 합리적인가? (prop 없이도 바로 쓸 수 있는가?)
- [ ] variant는 시맨틱한 의미가 있는 경우만 사용했는가?
- [ ] DOM에 커스텀 prop이 새지 않는가? (`...rest` 스프레드 주의)

## 리팩토링 대상

현재 하드코딩되어 오버라이드 불가한 컴포넌트 목록:

| 컴포넌트 | 하드코딩 항목 | 우선순위 |
|----------|-------------|---------|
| DashboardSidebar | ~~아이템/액티브 색상~~ (해결) | ~~P1~~ |
| Popover | 팝오버 패딩 `p-4` | P2 |
| BlogEditor | 컨테이너 배경색 | P2 (variant 추가로 일부 해결) |
| Icon | variant `default`가 `dark:text-white` 강제 | P1 |

> `!important`를 써야 하는 상황이면 설계 미스다. prop으로 열어줘야 한다.
