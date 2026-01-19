/**
 * Kanban Board 타입 정의
 * @module kanban/types
 */

import type { Color, ExtendedVariant } from "../../../lib/types/common";

// Re-export for consumers
export type { Color, ExtendedVariant };

/**
 * 칸반 컬럼 인터페이스
 */
export interface KanbanColumn {
  /** 컬럼 고유 ID */
  id: string;
  /** 컬럼 제목 */
  title: string;
  /** 컬럼 색상 */
  color?: Color;
  /** WIP(Work In Progress) 제한 - 최대 카드 수 */
  limit?: number;
  /** 컬럼 접힘 상태 */
  collapsed?: boolean;
}

/**
 * 칸반 카드 우선순위
 */
export type KanbanPriority = "low" | "medium" | "high" | "urgent";

/**
 * 칸반 카드 담당자 인터페이스
 */
export interface KanbanAssignee {
  /** 담당자 이름 */
  name: string;
  /** 담당자 아바타 이미지 URL */
  avatar?: string;
}

/**
 * 칸반 카드 인터페이스
 */
export interface KanbanCard {
  /** 카드 고유 ID */
  id: string;
  /** 소속 컬럼 ID */
  columnId: string;
  /** 정렬 순서 (낮을수록 위) */
  order?: number;
  /** 카드 제목 */
  title: string;
  /** 카드 설명 */
  description?: string;
  /** 우선순위 */
  priority?: KanbanPriority;
  /** 태그 목록 */
  tags?: string[];
  /** 담당자 */
  assignee?: KanbanAssignee;
  /** 마감일 */
  dueDate?: Date | string;
  /** 추가 메타데이터 */
  metadata?: Record<string, unknown>;
}

/**
 * 드래그 타입
 */
export type KanbanDragType = "card" | "column";

/**
 * 드래그 데이터 인터페이스
 */
export interface KanbanDragData {
  /** 드래그 타입 */
  type: KanbanDragType;
  /** 드래그 대상 ID */
  id: string;
  /** 소스 컬럼 ID (카드 드래그 시) */
  columnId?: string;
  /** 소스 인덱스 */
  sourceIndex?: number;
}

/**
 * 카드 이동 이벤트 인터페이스
 */
export interface KanbanCardMoveEvent {
  /** 카드 ID */
  cardId: string;
  /** 출발 컬럼 ID */
  fromColumnId: string;
  /** 도착 컬럼 ID */
  toColumnId: string;
  /** 새 인덱스 */
  toIndex: number;
}

/**
 * 컬럼 이동 이벤트 인터페이스
 */
export interface KanbanColumnMoveEvent {
  /** 컬럼 ID */
  columnId: string;
  /** 새 인덱스 */
  toIndex: number;
}

/**
 * KanbanBoard Props 인터페이스
 */
export interface KanbanBoardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 컬럼 목록 (controlled) */
  columns?: KanbanColumn[];
  /** 카드 목록 (controlled) */
  cards?: KanbanCard[];
  /** 기본 컬럼 목록 (uncontrolled) */
  defaultColumns?: KanbanColumn[];
  /** 기본 카드 목록 (uncontrolled) */
  defaultCards?: KanbanCard[];
  /** 컬럼 변경 콜백 */
  onColumnsChange?: (columns: KanbanColumn[]) => void;
  /** 카드 변경 콜백 */
  onCardsChange?: (cards: KanbanCard[]) => void;
  /** 카드 이동 콜백 */
  onCardMove?: (event: KanbanCardMoveEvent) => void;
  /** 컬럼 이동 콜백 */
  onColumnMove?: (event: KanbanColumnMoveEvent) => void;
  /** 카드 추가 콜백 */
  onCardAdd?: (columnId: string, card: Partial<KanbanCard>) => void;
  /** 카드 삭제 콜백 */
  onCardDelete?: (cardId: string) => void;
  /** 카드 수정 콜백 */
  onCardUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
  /** 컬럼 추가 콜백 */
  onColumnAdd?: (column: Partial<KanbanColumn>) => void;
  /** 컬럼 삭제 콜백 */
  onColumnDelete?: (columnId: string) => void;
  /** 컬럼 수정 콜백 */
  onColumnUpdate?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  /** 카드 클릭 콜백 */
  onCardClick?: (card: KanbanCard) => void;
  /** 스타일 variant */
  variant?: ExtendedVariant;
  /** 기본 색상 */
  color?: Color;
  /** 컬럼 추가 버튼 표시 */
  allowAddColumn?: boolean;
  /** 카드 추가 버튼 표시 */
  allowAddCard?: boolean;
  /** 컬럼 드래그 허용 */
  allowColumnDrag?: boolean;
  /** 카드 드래그 허용 */
  allowCardDrag?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 컬럼 최소 너비 */
  columnMinWidth?: number;
  /** 컬럼 최대 너비 */
  columnMaxWidth?: number;
  /** 드래그 시 배경 딤드 효과 표시 */
  showDragOverlay?: boolean;
  /** 딤드 오버레이 className */
  dragOverlayClassName?: string;
  /** 드래그 중인 카드 회전 각도 (기본: 3) */
  dragRotation?: number;
  /** 드래그 중인 카드 스케일 (기본: 1.05) */
  dragScale?: number;
  /** 칸반 드래그 시작 콜백 */
  onKanbanDragStart?: (type: "card" | "column", id: string) => void;
  /** 칸반 드래그 종료 콜백 */
  onKanbanDragEnd?: (type: "card" | "column", id: string) => void;
}

/**
 * KanbanColumn Props 인터페이스
 */
export interface KanbanColumnProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** 컬럼 데이터 */
  column: KanbanColumn;
  /** 컬럼 내 카드 목록 */
  cards: KanbanCard[];
  /** 컬럼 인덱스 */
  index: number;
}

/**
 * KanbanColumnHeader Props 인터페이스
 */
export interface KanbanColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 컬럼 데이터 */
  column: KanbanColumn;
  /** 카드 수 */
  cardCount: number;
  /** 제목 수정 콜백 */
  onTitleChange?: (title: string) => void;
  /** 컬럼 삭제 콜백 */
  onDelete?: () => void;
  /** 컬럼 접기/펼치기 콜백 */
  onToggleCollapse?: () => void;
  /** 드래그 핸들 props (제목 영역에 적용) */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
  };
}

/**
 * KanbanCard Props 인터페이스
 */
export interface KanbanCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** 카드 데이터 */
  card: KanbanCard;
  /** 카드 인덱스 */
  index: number;
  /** 드래그 중 여부 */
  isDragging?: boolean;
  /** 드래그 오버 여부 */
  isOver?: boolean;
}

/**
 * KanbanAddCard Props 인터페이스
 */
export interface KanbanAddCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** 컬럼 ID */
  columnId: string;
  /** 카드 추가 콜백 */
  onAdd?: (card: Partial<KanbanCard>) => void;
  /** 취소 콜백 */
  onCancel?: () => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
}

/**
 * KanbanAddColumn Props 인터페이스
 */
export interface KanbanAddColumnProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** 컬럼 추가 콜백 */
  onAdd?: (column: Partial<KanbanColumn>) => void;
  /** 취소 콜백 */
  onCancel?: () => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
}

/**
 * KanbanDropIndicator Props 인터페이스
 */
export interface KanbanDropIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 표시 여부 */
  visible: boolean;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
}
