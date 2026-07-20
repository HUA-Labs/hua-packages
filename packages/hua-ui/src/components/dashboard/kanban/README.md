# KanbanBoard

선택적 dnd-kit peer를 사용하는 Web 칸반 보드 컴포넌트입니다.

## Features

- **드래그앤드롭**: `@dnd-kit/core`, `@dnd-kit/sortable`,
  `@dnd-kit/utilities` 선택적 peer 기반
- **입력 센서**: 마우스 거리, 터치 지연/허용 오차, sortable 키보드 좌표
- **카드 이동**: 같은 컬럼 내 순서 변경, 다른 컬럼으로 이동
- **컬럼 이동**: 컬럼 순서 변경
- **CRUD**: 카드/컬럼 추가, 수정, 삭제
- **WIP Limit**: 컬럼별 최대 카드 수 제한
- **우선순위**: low, medium, high, urgent 4단계
- **Controlled/Uncontrolled**: 두 가지 상태 관리 방식 지원
- **트랜잭션**: hover는 preview 전용이며 유효한 drop 한 번만 상태/콜백 반영
- **접근성 기반**: bounded 안내/상태 문자열과 키보드 취소 경계. 실제 브라우저
  live-region 발화와 물리 보조기기 동작은 별도 증거가 필요합니다.

## Installation

Kanban route는 선택적 peer를 명시적으로 설치한 Web consumer에서 사용합니다.

```bash
pnpm add @hua-labs/ui @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

```tsx
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
} from "@hua-labs/ui/interactive/kanban";
```

## Basic Usage

### Controlled Mode (권장)

```tsx
import { useState } from "react";
import { KanbanBoard } from "@hua-labs/ui/interactive/kanban";

function ProjectBoard() {
  const [columns, setColumns] = useState([
    { id: "todo", title: "할 일", color: "blue" },
    { id: "doing", title: "진행 중", color: "orange", limit: 3 },
    { id: "done", title: "완료", color: "green" },
  ]);

  const [cards, setCards] = useState([
    { id: "1", columnId: "todo", title: "UI 디자인", priority: "high" },
    { id: "2", columnId: "doing", title: "API 개발", priority: "medium" },
    { id: "3", columnId: "done", title: "기획 완료", priority: "low" },
  ]);

  return (
    <KanbanBoard
      columns={columns}
      cards={cards}
      onColumnsChange={setColumns}
      onCardsChange={setCards}
      allowAddColumn
      allowAddCard
    />
  );
}
```

### Uncontrolled Mode

```tsx
import { KanbanBoard } from "@hua-labs/ui/interactive/kanban";

function SimpleBoard() {
  return (
    <KanbanBoard
      defaultColumns={[
        { id: "todo", title: "할 일" },
        { id: "done", title: "완료" },
      ]}
      defaultCards={[{ id: "1", columnId: "todo", title: "첫 번째 작업" }]}
      onCardMove={(event) => {
        console.log("카드 이동:", event);
      }}
    />
  );
}
```

## Props

### KanbanBoard

| Prop              | Type                                                 | Default      | Description              |
| ----------------- | ---------------------------------------------------- | ------------ | ------------------------ |
| `columns`         | `KanbanColumn[]`                                     | -            | 컬럼 목록 (controlled)   |
| `cards`           | `KanbanCard[]`                                       | -            | 카드 목록 (controlled)   |
| `defaultColumns`  | `KanbanColumn[]`                                     | -            | 기본 컬럼 (uncontrolled) |
| `defaultCards`    | `KanbanCard[]`                                       | -            | 기본 카드 (uncontrolled) |
| `onColumnsChange` | `(columns) => void`                                  | -            | 컬럼 변경 콜백           |
| `onCardsChange`   | `(cards) => void`                                    | -            | 카드 변경 콜백           |
| `onCardMove`      | `(event) => void`                                    | -            | 카드 이동 콜백           |
| `onColumnMove`    | `(event) => void`                                    | -            | 컬럼 이동 콜백           |
| `onCardClick`     | `(card) => void`                                     | -            | 카드 클릭 콜백           |
| `variant`         | `'default' \| 'gradient' \| 'outline' \| 'elevated'` | `'elevated'` | 스타일 variant           |
| `color`           | `Color`                                              | `'blue'`     | 기본 색상                |
| `allowAddColumn`  | `boolean`                                            | `false`      | 컬럼 추가 버튼 표시      |
| `allowAddCard`    | `boolean`                                            | `true`       | 카드 추가 버튼 표시      |
| `allowColumnDrag` | `boolean`                                            | `true`       | 컬럼 드래그 허용         |
| `allowCardDrag`   | `boolean`                                            | `true`       | 카드 드래그 허용         |
| `readOnly`        | `boolean`                                            | `false`      | 읽기 전용 모드           |

### KanbanColumn Type

```typescript
interface KanbanColumn {
  id: string; // 고유 ID
  title: string; // 컬럼 제목
  color?: Color; // 컬럼 색상 (blue, purple, green, orange, red, indigo, pink, gray)
  limit?: number; // WIP 제한 (최대 카드 수)
  collapsed?: boolean; // 접힘 상태
}
```

### KanbanCard Type

```typescript
interface KanbanCard {
  id: string; // 고유 ID
  columnId: string; // 소속 컬럼 ID
  title: string; // 카드 제목
  description?: string; // 설명
  priority?: "low" | "medium" | "high" | "urgent"; // 우선순위
  tags?: string[]; // 태그 목록
  assignee?: {
    // 담당자
    name: string;
    avatar?: string;
  };
  dueDate?: Date | string; // 마감일
  metadata?: Record<string, unknown>; // 추가 데이터
}
```

## Events

### onCardMove

카드가 드래그앤드롭으로 이동할 때 호출됩니다.

```typescript
interface KanbanCardMoveEvent {
  cardId: string;       // 이동한 카드 ID
  fromColumnId: string; // 출발 컬럼
  toColumnId: string;   // 도착 컬럼
  toIndex: number;      // 새 인덱스
}

<KanbanBoard
  onCardMove={(event) => {
    console.log(`${event.cardId}가 ${event.fromColumnId}에서 ${event.toColumnId}로 이동`);
  }}
/>
```

### onColumnMove

컬럼이 드래그앤드롭으로 이동할 때 호출됩니다.

```typescript
interface KanbanColumnMoveEvent {
  columnId: string; // 이동한 컬럼 ID
  toIndex: number; // 새 인덱스
}
```

## Styling

### Variants

```tsx
// 기본
<KanbanBoard variant="default" />

// 그라디언트
<KanbanBoard variant="gradient" color="purple" />

// 아웃라인
<KanbanBoard variant="outline" />

// 엘리베이티드 (기본값)
<KanbanBoard variant="elevated" />
```

### 컬럼별 색상

```tsx
const columns = [
  { id: "backlog", title: "백로그", color: "gray" },
  { id: "todo", title: "할 일", color: "blue" },
  { id: "doing", title: "진행 중", color: "orange" },
  { id: "review", title: "리뷰", color: "purple" },
  { id: "done", title: "완료", color: "green" },
];
```

### 우선순위 스타일

카드의 `priority`에 따라 자동으로 좌측 테두리 색상이 적용됩니다:

- `low`: 회색
- `medium`: 파란색
- `high`: 주황색
- `urgent`: 빨간색

## Keyboard Navigation

| Key               | Action                    |
| ----------------- | ------------------------- |
| `Tab`             | 카드 간 포커스 이동       |
| `Enter` / `Space` | 드래그 시작/종료          |
| `Arrow Keys`      | 드래그 모드에서 카드 이동 |
| `Escape`          | 드래그 취소               |

키보드 드래그의 `Enter`/`Space`는 카드 클릭을 실행하지 않습니다. Escape,
drop target 부재, WIP 거부, controlled authority 변경은 외부 카드 변경 콜백
없이 현재 drag lifecycle을 지웁니다. 시작이 승인된 drag는 성공 여부와
관계없이 `onKanbanDragEnd(type, id)`를 정확히 한 번 호출하며, 중복 cancel/end
이벤트 또는 그 뒤의 unmount는 terminal callback을 다시 호출하지 않습니다.
Board가 drag 도중 실제 unmount되어도 최신 callback으로 end를 한 번 균형 있게
보내며, callback prop rerender나 active drag가 없는 StrictMode cleanup은 end로
취급하지 않습니다. 각 terminal 뒤의 독립적인 click-only activation은 억제하지
않습니다.

Drag authority에 포함되는 `metadata`는 bounded plain-data tree만 허용합니다.
원본 card의 own `metadata` descriptor를 spread/value read 전에 검사하므로
absent와 own enumerable data `undefined`는 동일하게 metadata를 snapshot에서
생략합니다. Inherited/accessor/non-enumerable/symbol-bearing card authority는
drag start 전에 fail-closed 되고 top-level accessor getter는 실행되지 않습니다.
Nested descriptor view의 cycle, sparse/extra-key array, accessor, hidden/symbol
member, unsupported defined/non-finite value 또는 resource budget 초과도
거부합니다. Object key insertion order만 다른 같은 plain metadata는 같은
authority로 정규화됩니다.

브라우저 JavaScript는 transparent Proxy를 trap 실행 없이 plain descriptor
view와 구별할 수 없습니다. Reflection은 bounded/test-visible하게 실행하며,
같은 traversal에서 detached plain-data snapshot과 canonical bytes를 만듭니다.
Stable transparent view는 detached snapshot만 commit할 수 있고 throwing/revoked
view는 fail-closed, time-varying view는 controlled drift로 cancel됩니다. 이는
deterministic transaction integrity 계약이지 same-realm hostile-code sandbox나
trap-free Proxy 판별 주장이 아닙니다.

유효한 card drop은 uncontrolled 내부 state와 `onCardsChange`에 서로 다른
detached card graph를 전달합니다. Consumer가 callback payload의 card, tags,
assignee, `Date`, nested metadata를 변경해도 board state에는 반영되지 않습니다.
`onCardMove`의 column/index scalar는 change callback 전에 고정되므로 같은
consumer mutation이 move event를 바꿀 수도 없습니다. Consumer callback이
throw하더라도 terminal drag ownership은 먼저 정리되어 다음 drag를 막지
않습니다.

유효한 column drop도 uncontrolled 내부 state와 `onColumnsChange`에 서로 다른
column array/record graph를 전달합니다. Callback payload의 title, color, WIP
limit, collapsed 값을 변경해도 board state나 원본 default input에는 반영되지
않으며, `onColumnMove`의 column/index scalar는 change callback 전에 고정됩니다.
Column callback이 throw해도 terminal ownership은 이미 정리되어 다음 drag를
수락할 수 있습니다.

## WIP Limits

Work In Progress 제한을 설정하면 해당 컬럼에 더 이상 카드를 추가할 수 없습니다.

```tsx
const columns = [
  { id: "doing", title: "진행 중", limit: 3 }, // 최대 3개
];
```

제한에 도달하면:

- 카드 추가 버튼 비활성화
- 다른 컬럼에서 드롭 불가
- 헤더에 경고 표시

## Accessibility

- `role="region"`: 보드 전체
- `role="group"`: 각 컬럼
- `aria-label`: 기존 보드, 컬럼, 카드 이름 경계
- dnd-kit draggable instruction과 start/over/drop/block/cancel announcement는
  정제된 표시명만 사용하고 raw ID/metadata/error/object를 포함하지 않습니다.
- 표시명은 80 Unicode scalar, 전체 announcement는 별도 180 scalar budget을
  사용하며 C0/C1 control, lone surrogate, U+2028/U+2029를 제거합니다.
- 동일 target announcement는 연속 중복을 내보내지 않습니다.

현재 증거는 unit, source type-check, deterministic SSR placeholder, packed
installed-consumer 및 optional-peer isolation입니다. 실제 브라우저 키보드 좌표,
touch long-press/scroll, live-region 발화, VoiceOver/NVDA 등 물리 보조기기 결과는
실행하거나 추론하지 않았습니다.

## 관련 컴포넌트

- `StatCard` - 통계 카드
- `MetricCard` - 메트릭 카드
- `ActivityFeed` - 활동 피드
- `TransactionsTable` - 트랜잭션 테이블
