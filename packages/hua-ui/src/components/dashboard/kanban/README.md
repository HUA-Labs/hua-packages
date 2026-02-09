# KanbanBoard

드래그앤드롭을 지원하는 칸반 보드 Pro 컴포넌트입니다.

## Features

- **드래그앤드롭**: HTML5 Drag and Drop API로 구현 (외부 의존성 없음)
- **카드 이동**: 같은 컬럼 내 순서 변경, 다른 컬럼으로 이동
- **컬럼 이동**: 컬럼 순서 변경
- **CRUD**: 카드/컬럼 추가, 수정, 삭제
- **WIP Limit**: 컬럼별 최대 카드 수 제한
- **우선순위**: low, medium, high, urgent 4단계
- **Controlled/Uncontrolled**: 두 가지 상태 관리 방식 지원
- **접근성**: 키보드 내비게이션, ARIA 속성

## Installation

```tsx
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard
} from '@hua-labs/ui/advanced/dashboard';
```

## Basic Usage

### Controlled Mode (권장)

```tsx
import { useState } from 'react';
import { KanbanBoard } from '@hua-labs/ui/advanced/dashboard';

function ProjectBoard() {
  const [columns, setColumns] = useState([
    { id: 'todo', title: '할 일', color: 'blue' },
    { id: 'doing', title: '진행 중', color: 'orange', limit: 3 },
    { id: 'done', title: '완료', color: 'green' },
  ]);

  const [cards, setCards] = useState([
    { id: '1', columnId: 'todo', title: 'UI 디자인', priority: 'high' },
    { id: '2', columnId: 'doing', title: 'API 개발', priority: 'medium' },
    { id: '3', columnId: 'done', title: '기획 완료', priority: 'low' },
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
import { KanbanBoard } from '@hua-labs/ui/advanced/dashboard';

function SimpleBoard() {
  return (
    <KanbanBoard
      defaultColumns={[
        { id: 'todo', title: '할 일' },
        { id: 'done', title: '완료' },
      ]}
      defaultCards={[
        { id: '1', columnId: 'todo', title: '첫 번째 작업' },
      ]}
      onCardMove={(event) => {
        console.log('카드 이동:', event);
      }}
    />
  );
}
```

## Props

### KanbanBoard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `KanbanColumn[]` | - | 컬럼 목록 (controlled) |
| `cards` | `KanbanCard[]` | - | 카드 목록 (controlled) |
| `defaultColumns` | `KanbanColumn[]` | - | 기본 컬럼 (uncontrolled) |
| `defaultCards` | `KanbanCard[]` | - | 기본 카드 (uncontrolled) |
| `onColumnsChange` | `(columns) => void` | - | 컬럼 변경 콜백 |
| `onCardsChange` | `(cards) => void` | - | 카드 변경 콜백 |
| `onCardMove` | `(event) => void` | - | 카드 이동 콜백 |
| `onColumnMove` | `(event) => void` | - | 컬럼 이동 콜백 |
| `onCardClick` | `(card) => void` | - | 카드 클릭 콜백 |
| `variant` | `'default' \| 'gradient' \| 'outline' \| 'elevated'` | `'elevated'` | 스타일 variant |
| `color` | `Color` | `'blue'` | 기본 색상 |
| `allowAddColumn` | `boolean` | `false` | 컬럼 추가 버튼 표시 |
| `allowAddCard` | `boolean` | `true` | 카드 추가 버튼 표시 |
| `allowColumnDrag` | `boolean` | `true` | 컬럼 드래그 허용 |
| `allowCardDrag` | `boolean` | `true` | 카드 드래그 허용 |
| `readOnly` | `boolean` | `false` | 읽기 전용 모드 |

### KanbanColumn Type

```typescript
interface KanbanColumn {
  id: string;           // 고유 ID
  title: string;        // 컬럼 제목
  color?: Color;        // 컬럼 색상 (blue, purple, green, orange, red, indigo, pink, gray)
  limit?: number;       // WIP 제한 (최대 카드 수)
  collapsed?: boolean;  // 접힘 상태
}
```

### KanbanCard Type

```typescript
interface KanbanCard {
  id: string;                    // 고유 ID
  columnId: string;              // 소속 컬럼 ID
  title: string;                 // 카드 제목
  description?: string;          // 설명
  priority?: 'low' | 'medium' | 'high' | 'urgent';  // 우선순위
  tags?: string[];               // 태그 목록
  assignee?: {                   // 담당자
    name: string;
    avatar?: string;
  };
  dueDate?: Date | string;       // 마감일
  metadata?: Record<string, unknown>;  // 추가 데이터
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
  columnId: string;  // 이동한 컬럼 ID
  toIndex: number;   // 새 인덱스
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
  { id: 'backlog', title: '백로그', color: 'gray' },
  { id: 'todo', title: '할 일', color: 'blue' },
  { id: 'doing', title: '진행 중', color: 'orange' },
  { id: 'review', title: '리뷰', color: 'purple' },
  { id: 'done', title: '완료', color: 'green' },
];
```

### 우선순위 스타일

카드의 `priority`에 따라 자동으로 좌측 테두리 색상이 적용됩니다:

- `low`: 회색
- `medium`: 파란색
- `high`: 주황색
- `urgent`: 빨간색

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | 카드 간 포커스 이동 |
| `Enter` / `Space` | 드래그 시작/종료 |
| `Arrow Keys` | 드래그 모드에서 카드 이동 |
| `Escape` | 드래그 취소 |

## WIP Limits

Work In Progress 제한을 설정하면 해당 컬럼에 더 이상 카드를 추가할 수 없습니다.

```tsx
const columns = [
  { id: 'doing', title: '진행 중', limit: 3 },  // 최대 3개
];
```

제한에 도달하면:
- 카드 추가 버튼 비활성화
- 다른 컬럼에서 드롭 불가
- 헤더에 경고 표시

## Accessibility

- `role="region"`: 보드 전체
- `role="group"`: 각 컬럼
- `aria-label`: 컬럼 및 카드 설명
- `aria-describedby`: 드래그 안내 텍스트
- `aria-grabbed`: 드래그 상태
- `aria-dropeffect`: 드롭 가능 영역

## 관련 컴포넌트

- `StatCard` - 통계 카드
- `MetricCard` - 메트릭 카드
- `ActivityFeed` - 활동 피드
- `TransactionsTable` - 트랜잭션 테이블
