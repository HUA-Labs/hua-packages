# 컴포넌트/인프라 상태 요약 (2025년 11월)

> 기준 레포: `hua-platform/packages/hua-ui`  
> 기준 일자: 2025-11-24 코드 검토 결과

## 1. 안정화된 영역

### 1.1 공통 타입/스타일 시스템
- `src/lib/types` 전반: Color/Size/Variant 계층 구조 및 컴포넌트별 확장 타입 정리 완료.
- `src/lib/styles/{colors,variants,utils}.ts`: 색상 팔레트, variant/size/rounded/shadow 생성기, 다크모드 헬퍼 중앙화.
- `src/lib/utils.ts`: `merge`, `mergeIf`, `mergeMap`, `cn` 유틸은 내부/외부 모두에서 호환 유지.

### 1.2 액션/폼 계열
- `Button.tsx`: 앵커/버튼 분기, reduced-motion 대응, gradient/hover 프리셋, 로딩·아이콘-only 접근성 경고까지 포함해 안정화.
- `Action.tsx`: Button 위에 시네마틱 프리셋(데이터 속성, 해프틱 옵션 등)을 얹으면서 API 호환 유지.
- `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Textarea` 등 폼 요소는 모두 공통 토큰 활용.

### 1.3 대시보드 위젯
- `src/components/dashboard/*`: StatCard, MetricCard, QuickActionCard, ActivityFeed, NotificationCard, SummaryCard, MiniBarChart 등이 Props 타입·README 문서를 갖추고 프로덕션에서 사용 중.

### 1.4 피드백/오버레이
- `Toast.tsx`: Provider + hook 구조로 재정비, legacy 함수는 console warn으로 대체.
- `Alert`, `Modal`, `Drawer`, `BottomSheet`, `ConfirmModal`, `Tooltip`, `Popover`, `Dropdown`, `ContextMenu`, `Command`, `LoadingSpinner`, `Skeleton` 등도 공통 토큰/유틸을 사용하고 "use client" 선언이 명확.

### 1.5 내비게이션/레이아웃
- `Navigation`, `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`, `PageNavigation`, `Grid`, `Stack`, `Container`, `Divider`, `Panel`, `Card`가 공통 스타일 생성기를 사용.
- `ThemeProvider/Toggle`, `LanguageToggle`, `Scroll*`, `PageTransition`, `components/advanced/*`는 레이아웃/메타 영역을 커버.

## 2. 상태 표 (요약)

| 범주 | 대표 파일 | 상태 | 비고 |
| --- | --- | --- | --- |
| 공통 스타일 인프라 | `src/lib/types`, `src/lib/styles`, `src/lib/utils` | 안정 | 단일 소스, 런타임 의존 없음 |
| 버튼/액션 | `Button.tsx`, `Action.tsx`, `Panel.tsx` | 안정 | 리팩토링 이후 API 변화 없음 |
| 폼/입력 | `Input`, `Select`, `Form`, `Checkbox` 등 | 안정 | Prop 일관, 문서만 보강 필요 |
| 내비게이션 | `Navigation`, `Tabs`, `Menu`, `ContextMenu` | 안정 | 키보드/ARIA 지원 포함 |
| 대시보드 위젯 | `src/components/dashboard/*` | 안정 | 내부 대시보드에서 사용 중 |
| 피드백/오버레이 | `Toast`, `Alert`, `Modal`, `BottomSheet` | 안정 | Hook 기반 API, 경고 처리 완료 |
| 고급 모션 | `components/advanced/*` | 베타 | ripple/sound TODO 남음 |
| 테스트/툴링 | Jest/Vitest, Storybook | 미구현 | 스크립트만 있고 설정/테스트 부재 |

## 3. 남은 과제 / 리스크
1. **테스트 공백**: `package.json`에 Jest 스크립트가 있지만 config/spec이 없음 → Vitest/Jest 도입 + Button/Toast/Widget 스모크 테스트 필요.
2. **문서/데모**: README는 예시 위주라 상태별 문서 부족 (향후 Storybook/Ladle 도입 예정).
3. **번들 전략**: 현재 빌드는 `tsc` 단일 단계. npm 배포 전 `tsup`/`rollup`으로 ESM+CJS+CSS 번들을 생성해야 함.
4. **고급 모션 옵션**: `Action`의 haptic/ripple/sound 플래그는 TODO 상태 → 구현 또는 experimental 명시 필요.
5. **PeerDeps 정리**: `react`가 dependencies와 peerDependencies 모두에 선언되어 있으므로, 배포 전 peer-only로 이동하고 devDependencies에서만 설치.

## 4. 후속 문서 작업
- README에 본 상태 문서를 링크하고, Storybook 작업 체크리스트로 활용.
- `hua-labs-public`에 동기화/배포할 때 PR에 본 문서를 첨부해 변경 추적.
- 대시보드 위젯 계획(`docs/DASHBOARD_WIDGET_PLAN.md`)을 참고해 신규 컴포넌트 우선순위를 공유.

---
Platform UI Guild · 2025-11-24 업데이트
