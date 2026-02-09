"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import type {
  KanbanColumn,
  KanbanCard,
  KanbanDragData,
  KanbanCardMoveEvent,
  KanbanColumnMoveEvent,
  ExtendedVariant,
} from "./types";
import type { Color } from "../../../lib/types/common";

/**
 * Kanban Context Value 인터페이스
 */
interface KanbanContextValue {
  // 상태
  columns: KanbanColumn[];
  cards: KanbanCard[];
  dragData: KanbanDragData | null;
  dropTargetId: string | null;
  dropIndex: number | null;

  // 드래그 액션
  startDrag: (data: KanbanDragData) => void;
  updateDropTarget: (targetId: string | null, index: number | null) => void;
  endDrag: () => void;

  // 카드 액션
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;
  addCard: (columnId: string, card: Partial<KanbanCard>) => void;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void;
  deleteCard: (cardId: string) => void;

  // 컬럼 액션
  moveColumn: (columnId: string, toIndex: number) => void;
  addColumn: (column: Partial<KanbanColumn>) => void;
  updateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (columnId: string) => void;

  // 유틸리티
  getCardsByColumn: (columnId: string) => KanbanCard[];
  canDropCard: (columnId: string) => boolean;

  // 설정
  variant: ExtendedVariant;
  color: Color;
  allowCardDrag: boolean;
  allowColumnDrag: boolean;
  allowAddCard: boolean;
  allowAddColumn: boolean;
  readOnly: boolean;

  // 콜백
  onCardClick?: (card: KanbanCard) => void;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

/**
 * Kanban Context를 사용하는 훅
 */
export function useKanban(): KanbanContextValue {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
}

/**
 * Kanban Provider Props
 */
interface KanbanProviderProps {
  children: React.ReactNode;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onColumnsChange?: (columns: KanbanColumn[]) => void;
  onCardsChange?: (cards: KanbanCard[]) => void;
  onCardMove?: (event: KanbanCardMoveEvent) => void;
  onColumnMove?: (event: KanbanColumnMoveEvent) => void;
  onCardAdd?: (columnId: string, card: Partial<KanbanCard>) => void;
  onCardDelete?: (cardId: string) => void;
  onCardUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
  onColumnAdd?: (column: Partial<KanbanColumn>) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnUpdate?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onCardClick?: (card: KanbanCard) => void;
  variant?: ExtendedVariant;
  color?: Color;
  allowCardDrag?: boolean;
  allowColumnDrag?: boolean;
  allowAddCard?: boolean;
  allowAddColumn?: boolean;
  readOnly?: boolean;
}

/**
 * Kanban Provider 컴포넌트
 */
export function KanbanProvider({
  children,
  columns,
  cards,
  onColumnsChange,
  onCardsChange,
  onCardMove,
  onColumnMove,
  onCardAdd,
  onCardDelete,
  onCardUpdate,
  onColumnAdd,
  onColumnDelete,
  onColumnUpdate,
  onCardClick,
  variant = "elevated",
  color = "blue",
  allowCardDrag = true,
  allowColumnDrag = true,
  allowAddCard = true,
  allowAddColumn = false,
  readOnly = false,
}: KanbanProviderProps) {
  // 드래그 상태
  const [dragData, setDragData] = React.useState<KanbanDragData | null>(null);
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  // 드래그 시작
  const startDrag = useCallback((data: KanbanDragData) => {
    setDragData(data);
  }, []);

  // 드롭 타겟 업데이트
  const updateDropTarget = useCallback((targetId: string | null, index: number | null) => {
    setDropTargetId(targetId);
    setDropIndex(index);
  }, []);

  // 드래그 종료
  const endDrag = useCallback(() => {
    setDragData(null);
    setDropTargetId(null);
    setDropIndex(null);
  }, []);

  // 컬럼별 카드 가져오기 (order 기준 정렬)
  const getCardsByColumn = useCallback(
    (columnId: string): KanbanCard[] => {
      return cards
        .filter((card) => card.columnId === columnId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    [cards]
  );

  // 카드 드롭 가능 여부 (WIP limit 체크)
  const canDropCard = useCallback(
    (columnId: string): boolean => {
      const column = columns.find((c) => c.id === columnId);
      if (!column || column.limit === undefined) return true;

      const currentCount = getCardsByColumn(columnId).length;

      // 같은 컬럼 내 이동은 항상 허용
      if (dragData?.type === "card" && dragData.columnId === columnId) {
        return true;
      }

      return currentCount < column.limit;
    },
    [columns, getCardsByColumn, dragData]
  );

  // 카드 이동
  const moveCard = useCallback(
    (cardId: string, toColumnId: string, toIndex: number) => {
      if (readOnly) return;

      const cardToMove = cards.find((c) => c.id === cardId);
      if (!cardToMove) return;

      const fromColumnId = cardToMove.columnId;

      // WIP limit 체크
      if (fromColumnId !== toColumnId && !canDropCard(toColumnId)) {
        return;
      }

      // 컬럼별로 카드 그룹화 (order 기준 정렬)
      const cardsByColumn = new Map<string, KanbanCard[]>();
      columns.forEach((col) => {
        cardsByColumn.set(col.id, []);
      });
      cards.forEach((card) => {
        if (card.id !== cardId) {
          const colCards = cardsByColumn.get(card.columnId);
          if (colCards) colCards.push(card);
        }
      });

      // 각 컬럼의 카드를 order로 정렬
      cardsByColumn.forEach((colCards) => {
        colCards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });

      // 목적지 컬럼에 새 위치로 삽입
      const targetColumnCards = cardsByColumn.get(toColumnId) || [];
      const clampedIndex = Math.min(toIndex, targetColumnCards.length);

      // 이동할 카드 (columnId 변경)
      const movedCard: KanbanCard = { ...cardToMove, columnId: toColumnId };
      targetColumnCards.splice(clampedIndex, 0, movedCard);
      cardsByColumn.set(toColumnId, targetColumnCards);

      // 모든 카드의 order 재계산 (컬럼별로)
      const updatedCards: KanbanCard[] = [];
      cardsByColumn.forEach((colCards) => {
        colCards.forEach((card, index) => {
          updatedCards.push({ ...card, order: index });
        });
      });

      onCardsChange?.(updatedCards);
      onCardMove?.({ cardId, fromColumnId, toColumnId, toIndex: clampedIndex });
    },
    [cards, columns, readOnly, canDropCard, onCardsChange, onCardMove]
  );

  // 카드 추가
  const addCard = useCallback(
    (columnId: string, card: Partial<KanbanCard>) => {
      if (readOnly) return;

      // WIP limit 체크
      if (!canDropCard(columnId)) return;

      const newCard: KanbanCard = {
        id: card.id || `card-${Date.now()}`,
        columnId,
        title: card.title || "새 카드",
        description: card.description,
        priority: card.priority,
        tags: card.tags,
        assignee: card.assignee,
        dueDate: card.dueDate,
        metadata: card.metadata,
      };

      const newCards = [...cards, newCard];
      onCardsChange?.(newCards);
      onCardAdd?.(columnId, newCard);
    },
    [cards, readOnly, canDropCard, onCardsChange, onCardAdd]
  );

  // 카드 수정
  const updateCard = useCallback(
    (cardId: string, updates: Partial<KanbanCard>) => {
      if (readOnly) return;

      const newCards = cards.map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      );

      onCardsChange?.(newCards);
      onCardUpdate?.(cardId, updates);
    },
    [cards, readOnly, onCardsChange, onCardUpdate]
  );

  // 카드 삭제
  const deleteCard = useCallback(
    (cardId: string) => {
      if (readOnly) return;

      const newCards = cards.filter((card) => card.id !== cardId);
      onCardsChange?.(newCards);
      onCardDelete?.(cardId);
    },
    [cards, readOnly, onCardsChange, onCardDelete]
  );

  // 컬럼 이동
  const moveColumn = useCallback(
    (columnId: string, toIndex: number) => {
      if (readOnly) return;

      const columnIndex = columns.findIndex((c) => c.id === columnId);
      if (columnIndex === -1) return;

      const newColumns = [...columns];
      const [removed] = newColumns.splice(columnIndex, 1);
      newColumns.splice(toIndex, 0, removed);

      onColumnsChange?.(newColumns);
      onColumnMove?.({ columnId, toIndex });
    },
    [columns, readOnly, onColumnsChange, onColumnMove]
  );

  // 컬럼 추가
  const addColumn = useCallback(
    (column: Partial<KanbanColumn>) => {
      if (readOnly) return;

      const newColumn: KanbanColumn = {
        id: column.id || `column-${Date.now()}`,
        title: column.title || "새 컬럼",
        color: column.color,
        limit: column.limit,
        collapsed: column.collapsed,
      };

      const newColumns = [...columns, newColumn];
      onColumnsChange?.(newColumns);
      onColumnAdd?.(newColumn);
    },
    [columns, readOnly, onColumnsChange, onColumnAdd]
  );

  // 컬럼 수정
  const updateColumn = useCallback(
    (columnId: string, updates: Partial<KanbanColumn>) => {
      if (readOnly) return;

      const newColumns = columns.map((column) =>
        column.id === columnId ? { ...column, ...updates } : column
      );

      onColumnsChange?.(newColumns);
      onColumnUpdate?.(columnId, updates);
    },
    [columns, readOnly, onColumnsChange, onColumnUpdate]
  );

  // 컬럼 삭제
  const deleteColumn = useCallback(
    (columnId: string) => {
      if (readOnly) return;

      // 해당 컬럼의 카드도 함께 삭제
      const newColumns = columns.filter((column) => column.id !== columnId);
      const newCards = cards.filter((card) => card.columnId !== columnId);

      onColumnsChange?.(newColumns);
      onCardsChange?.(newCards);
      onColumnDelete?.(columnId);
    },
    [columns, cards, readOnly, onColumnsChange, onCardsChange, onColumnDelete]
  );

  // Context 값 메모이제이션
  const value = useMemo<KanbanContextValue>(
    () => ({
      columns,
      cards,
      dragData,
      dropTargetId,
      dropIndex,
      startDrag,
      updateDropTarget,
      endDrag,
      moveCard,
      addCard,
      updateCard,
      deleteCard,
      moveColumn,
      addColumn,
      updateColumn,
      deleteColumn,
      getCardsByColumn,
      canDropCard,
      variant,
      color,
      allowCardDrag,
      allowColumnDrag,
      allowAddCard,
      allowAddColumn,
      readOnly,
      onCardClick,
    }),
    [
      columns,
      cards,
      dragData,
      dropTargetId,
      dropIndex,
      startDrag,
      updateDropTarget,
      endDrag,
      moveCard,
      addCard,
      updateCard,
      deleteCard,
      moveColumn,
      addColumn,
      updateColumn,
      deleteColumn,
      getCardsByColumn,
      canDropCard,
      variant,
      color,
      allowCardDrag,
      allowColumnDrag,
      allowAddCard,
      allowAddColumn,
      readOnly,
      onCardClick,
    ]
  );

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
}

export { KanbanContext };
