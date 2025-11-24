# 대시보드 컴포넌트 코드 리뷰 (2025-11-24)
> As-Is vs To-Be 정리 문서  
> Dashboard component review record (As-Is vs To-Be)

## 1. Sidebar Nav Item (Link 지원)
- **As-Is**  
  - `SidebarNavItem` 타입에 `href`가 있으나 실제 UI는 `<button>`만 렌더링한다.  
  - 기본 내비게이션 패턴(새 탭, ctrl+클릭, 스크린리더 링크 역할)을 제공하지 못한다.
- **To-Be**  
  - `href`가 존재하면 `<a>` 요소 또는 `asChild` 전략으로 앵커를 허용.  
  - 버튼/링크 두 모드를 명시하고, 문서에도 `href` 사용법을 추가한다.

## 2. TrendChart 단일 버킷 처리
- **As-Is**  
  - `categories.length === 1`일 때 `(i / (categories.length - 1))` 계산으로 `NaN` 좌표가 발생.  
  - `series.data`와 `categories` 길이가 다르면 tooltip label이 `undefined`가 된다.
- **To-Be**  
  - `Math.max(categories.length - 1, 1)` 등으로 분모를 보정하고, 길이 불일치 시 `console.warn` 후 잘라내도록 안전장치 추가.  
  - README에 최소 데이터 길이 요구조건을 명시한다.

## 3. TransactionsTable 접근성
- **As-Is**  
  - 행 전체에 `onClick`만 존재해 키보드 탭/Enter로 행을 열 수 없다.  
  - 포커스 스타일/`role`이 없어 스크린리더가 행 클릭을 인지하지 못한다.
- **To-Be**  
  - `clickable` 행에는 `tabIndex={0}`, `role="button"`을 부여하고 `onKeyDown`에서 Enter/Space를 처리.  
  - 혹은 행 내부에 `<button>`/`<a>`를 노출하여 시맨틱을 보장한다. README에 접근성 가이드를 추가한다.

## Fix log (2025-11-24)
- Sidebar nav item이 `href`를 인식하도록 `<a>` 렌더링 + README 가이드 반영.
- TrendChart가 단일 버킷/길이 불일치를 안전하게 처리하도록 보정.
- TransactionsTable 행에 키보드 포커스/`onKeyDown`을 추가해 접근성을 확보.

## TODO (Next Components)
1. **TransactionDetailDrawer**  
   - 거래 선택 시 정산/수수료/이벤트 로그를 조회하는 Drawer. `TransactionsTable`의 `onRowClick`과 바로 연결.
2. **SettlementTimeline**  
   - 주/일 단위 정산 상태를 Stepper 형태로 보여주는 위젯.
3. **RoutingBreakdownCard**  
   - PG/결제수단 비중 도넛/바 차트, 장애 배지 표시 지원.
4. **MerchantList/Search Preset**  
   - 가맹점 필터·검색 가능한 카드/테이블 프리셋.
5. **Alert/QuickReports Banner**  
   - 실시간 장애 배너 + 즐겨찾는 리포트/다운로드 카드.

## Progress log
- 2025-11-24: TransactionDetailDrawer 도입, README/문서 반영.
- 2025-11-24: SettlementTimeline 구현, 타임라인 상태/금액/시간 노출 패턴 확정.
- 2025-11-24: RoutingBreakdownCard 구현, PG/결제수단 분포 시각화 + 상태 배지 패턴 확정.
- 2025-11-24: MerchantList(Search) 프리셋 구현, 가맹점 요약/건강 상태/승인률 카드 패턴 확정.

---
- **Next Actions**: 위 세 영역을 우선 수정 → README/스토리북 예시 업데이트 → `COMPONENT_STATUS_2025-11.md` 체크리스트 반영.  
- **Owner**: Platform UI Guild (`packages/hua-ui`)

