/**
 * Kanban Board Components
 *
 * @dnd-kit을 사용한 프로덕션 수준의 칸반 보드 컴포넌트입니다.
 *
 * @example
 * import {
 *   KanbanBoard,
 *   KanbanColumn,
 *   KanbanCard,
 *   useKanban,
 *   type KanbanColumn as KanbanColumnType,
 *   type KanbanCard as KanbanCardType,
 * } from '@hua-labs/ui/advanced/dashboard';
 */

// Main components
export { KanbanBoard } from "./KanbanBoard";
export { KanbanColumn } from "./KanbanColumn";
export { KanbanColumnHeader } from "./KanbanColumnHeader";
export { KanbanCard } from "./KanbanCard";
export { KanbanAddCard } from "./KanbanAddCard";
export { KanbanAddColumn } from "./KanbanAddColumn";
export { KanbanDropIndicator } from "./KanbanDropIndicator";

// Context and hooks
export { KanbanProvider, useKanban, KanbanContext } from "./KanbanContext";

// Types
export type {
  // Core types
  KanbanColumn as KanbanColumnType,
  KanbanCard as KanbanCardType,
  KanbanPriority,
  KanbanAssignee,
  KanbanDragType,
  KanbanDragData,
  // Event types
  KanbanCardMoveEvent,
  KanbanColumnMoveEvent,
  // Props types
  KanbanBoardProps,
  KanbanColumnProps,
  KanbanColumnHeaderProps,
  KanbanCardProps,
  KanbanAddCardProps,
  KanbanAddColumnProps,
  KanbanDropIndicatorProps,
} from "./types";
