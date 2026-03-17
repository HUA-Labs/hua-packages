"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { KanbanProvider } from "./KanbanContext";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { KanbanAddColumn } from "./KanbanAddColumn";
import { Skeleton } from "../../Skeleton";
import type {
  KanbanBoardProps,
  KanbanColumn as KanbanColumnType,
  KanbanCard as KanbanCardType,
} from "./types";

/**
 * KanbanBoard 컴포넌트
 *
 * @dnd-kit을 사용한 드래그앤드롭 칸반 보드 컴포넌트입니다.
 * 컬럼 간 카드 이동, 같은 컬럼 내 순서 변경을 지원합니다.
 */
export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (
    {
      // Controlled props
      columns: controlledColumns,
      cards: controlledCards,
      // Uncontrolled props
      defaultColumns = [],
      defaultCards = [],
      // Callbacks
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
      onKanbanDragStart,
      onKanbanDragEnd,
      // Style
      variant = "elevated",
      color = "blue",
      // Flags
      allowAddColumn = false,
      allowAddCard = true,
      allowColumnDrag = true,
      allowCardDrag = true,
      readOnly = false,
      // Layout
      columnMinWidth = 280,
      columnMaxWidth = 320,
      // Drag effects
      showDragOverlay = true,
      dragOverlayStyle,
      dragRotation = 3,
      dragScale = 1.05,
      // Standard props
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    // SSR hydration fix: only render DndContext after mount
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Internal state for uncontrolled mode
    const [internalColumns, setInternalColumns] =
      useState<KanbanColumnType[]>(defaultColumns);
    const [internalCards, setInternalCards] =
      useState<KanbanCardType[]>(defaultCards);

    // Drag state
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<"card" | "column" | null>(
      null,
    );

    // Determine controlled vs uncontrolled
    const isControlled = controlledColumns !== undefined;
    const columns = isControlled ? controlledColumns : internalColumns;
    const cards = isControlled ? (controlledCards ?? []) : internalCards;

    // Is dragging?
    const isDragging = activeId !== null;
    const isDraggingColumn = activeType === "column";

    // Sensors
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(KeyboardSensor),
    );

    // Handle column changes
    const handleColumnsChange = useCallback(
      (newColumns: KanbanColumnType[]) => {
        if (!isControlled) {
          setInternalColumns(newColumns);
        }
        onColumnsChange?.(newColumns);
      },
      [isControlled, onColumnsChange],
    );

    // Handle card changes
    const handleCardsChange = useCallback(
      (newCards: KanbanCardType[]) => {
        if (!isControlled) {
          setInternalCards(newCards);
        }
        onCardsChange?.(newCards);
      },
      [isControlled, onCardsChange],
    );

    // Get cards for a specific column (sorted by order)
    const getColumnCards = useCallback(
      (columnId: string) => {
        return cards
          .filter((card) => card.columnId === columnId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      },
      [cards],
    );

    // Find which column a card belongs to
    const findColumnByCardId = useCallback(
      (cardId: string): string | null => {
        const card = cards.find((c) => c.id === cardId);
        return card?.columnId ?? null;
      },
      [cards],
    );

    // Check if item is a column
    const isColumn = useCallback(
      (id: string): boolean => {
        return columns.some((col) => col.id === id);
      },
      [columns],
    );

    // Drag start handler
    const handleDragStart = useCallback(
      (event: DragStartEvent) => {
        const { active } = event;
        const id = active.id as string;
        const type = isColumn(id) ? "column" : "card";

        setActiveId(id);
        setActiveType(type);
        onKanbanDragStart?.(type, id);
      },
      [isColumn, onKanbanDragStart],
    );

    // Drag over handler (for moving cards between columns)
    const handleDragOver = useCallback(
      (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Skip if dragging column (handled by dnd-kit sortable)
        if (isColumn(activeId)) return;

        const activeColumnId = findColumnByCardId(activeId);
        const overColumnId = isColumn(overId)
          ? overId
          : findColumnByCardId(overId);

        if (!activeColumnId || !overColumnId) return;

        // Moving to different column
        if (activeColumnId !== overColumnId) {
          const activeCards = getColumnCards(activeColumnId);
          const overCards = getColumnCards(overColumnId);

          const activeIndex = activeCards.findIndex((c) => c.id === activeId);
          const overIndex = isColumn(overId)
            ? overCards.length
            : overCards.findIndex((c) => c.id === overId);

          // Check WIP limit
          const overColumn = columns.find((c) => c.id === overColumnId);
          if (overColumn?.limit && overCards.length >= overColumn.limit) {
            return;
          }

          // Update cards
          const newCards = cards.map((card) => {
            if (card.id === activeId) {
              return { ...card, columnId: overColumnId, order: overIndex };
            }
            return card;
          });

          // Reorder cards in target column
          const reorderedCards = newCards.map((card) => {
            if (card.columnId === overColumnId && card.id !== activeId) {
              const currentOrder = card.order ?? 0;
              if (currentOrder >= overIndex) {
                return { ...card, order: currentOrder + 1 };
              }
            }
            return card;
          });

          handleCardsChange(reorderedCards);
        }
      },
      [
        cards,
        columns,
        findColumnByCardId,
        getColumnCards,
        handleCardsChange,
        isColumn,
      ],
    );

    // Drag end handler
    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        const draggedId = activeId;
        const draggedType = activeType;

        setActiveId(null);
        setActiveType(null);

        if (draggedId && draggedType) {
          onKanbanDragEnd?.(draggedType, draggedId);
        }

        if (!over) return;

        const activeIdStr = active.id as string;
        const overId = over.id as string;

        if (activeIdStr === overId) return;

        // Column drag
        if (isColumn(activeIdStr) && isColumn(overId)) {
          const oldIndex = columns.findIndex((c) => c.id === activeIdStr);
          const newIndex = columns.findIndex((c) => c.id === overId);

          if (oldIndex !== newIndex) {
            const newColumns = arrayMove(columns, oldIndex, newIndex);
            handleColumnsChange(newColumns);
            onColumnMove?.({ columnId: activeIdStr, toIndex: newIndex });
          }
          return;
        }

        // Card drag within same column
        const activeColumnId = findColumnByCardId(activeIdStr);
        const overColumnId = isColumn(overId)
          ? overId
          : findColumnByCardId(overId);

        if (!activeColumnId || !overColumnId) return;

        if (activeColumnId === overColumnId) {
          const columnCards = getColumnCards(activeColumnId);
          const oldIndex = columnCards.findIndex((c) => c.id === activeIdStr);
          const newIndex = isColumn(overId)
            ? columnCards.length - 1
            : columnCards.findIndex((c) => c.id === overId);

          if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
            const reorderedColumnCards = arrayMove(
              columnCards,
              oldIndex,
              newIndex,
            );

            // Update order for all cards in this column
            const newCards = cards.map((card) => {
              if (card.columnId === activeColumnId) {
                const newOrder = reorderedColumnCards.findIndex(
                  (c) => c.id === card.id,
                );
                return { ...card, order: newOrder };
              }
              return card;
            });

            handleCardsChange(newCards);
            onCardMove?.({
              cardId: activeIdStr,
              fromColumnId: activeColumnId,
              toColumnId: overColumnId,
              toIndex: newIndex,
            });
          }
        } else {
          // Card moved to different column (already handled in dragOver)
          onCardMove?.({
            cardId: activeIdStr,
            fromColumnId: activeColumnId,
            toColumnId: overColumnId,
            toIndex: 0,
          });
        }
      },
      [
        activeId,
        activeType,
        columns,
        cards,
        findColumnByCardId,
        getColumnCards,
        handleColumnsChange,
        handleCardsChange,
        isColumn,
        onCardMove,
        onColumnMove,
        onKanbanDragEnd,
      ],
    );

    // Active item for overlay
    const activeCard = useMemo(() => {
      if (!activeId || activeType !== "card") return null;
      return cards.find((c) => c.id === activeId);
    }, [activeId, activeType, cards]);

    const activeColumnData = useMemo(() => {
      if (!activeId || activeType !== "column") return null;
      return columns.find((c) => c.id === activeId);
    }, [activeId, activeType, columns]);

    // Board styles based on variant
    const boardBaseStyle = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        display: "flex",
        ...resolveDot("gap-4 pb-4"),
        overflowX: "auto",
        minHeight: "400px",
      };

      switch (variant) {
        case "gradient":
          return {
            ...base,
            ...resolveDot("p-4 rounded-xl"),
            background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
          };
        case "outline":
          return {
            ...base,
            ...resolveDot("p-4 rounded-xl"),
            border: "2px dashed #d1d5db",
          };
        case "elevated":
          return {
            ...base,
            ...resolveDot("p-4 rounded-xl"),
            backgroundColor: "rgba(249,250,251,0.5)",
          };
        default:
          return base;
      }
    }, [variant]);

    // Column IDs for SortableContext
    const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

    // Drag overlay styles
    const cardOverlayStyle = useMemo(
      () => ({
        transform: `rotate(${dragRotation}deg) scale(${dragScale})`,
      }),
      [dragRotation, dragScale],
    );

    // SSR placeholder - prevents hydration mismatch from @dnd-kit's aria-describedby
    if (!isMounted) {
      return (
        <div
          ref={ref}
          role="region"
          aria-label="칸반 보드"
          style={mergeStyles(boardBaseStyle, resolveDot(dot), style)}
          {...props}
        >
          {columns.map((column) => (
            <div
              key={column.id}
              style={{
                flexShrink: 0,
                backgroundColor: "#f3f4f6",
                ...resolveDot("rounded-xl p-3"),
                minWidth: columnMinWidth,
                maxWidth: columnMaxWidth,
              }}
            >
              <Skeleton variant="text" dot="h-8 mb-3" />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  ...resolveDot("gap-2"),
                }}
              >
                {getColumnCards(column.id)
                  .slice(0, 3)
                  .map((card) => (
                    <Skeleton key={card.id} variant="rounded" dot="h-20" />
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <KanbanProvider
        columns={columns}
        cards={cards}
        onColumnsChange={handleColumnsChange}
        onCardsChange={handleCardsChange}
        onCardMove={onCardMove}
        onColumnMove={onColumnMove}
        onCardAdd={onCardAdd}
        onCardDelete={onCardDelete}
        onCardUpdate={onCardUpdate}
        onColumnAdd={onColumnAdd}
        onColumnDelete={onColumnDelete}
        onColumnUpdate={onColumnUpdate}
        onCardClick={onCardClick}
        variant={variant}
        color={color}
        allowCardDrag={allowCardDrag && !readOnly}
        allowColumnDrag={allowColumnDrag && !readOnly}
        allowAddCard={allowAddCard && !readOnly}
        allowAddColumn={allowAddColumn && !readOnly}
        readOnly={readOnly}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Dimmed overlay when dragging column */}
          {showDragOverlay && isDragging && isDraggingColumn && (
            <div
              style={mergeStyles(
                {
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.2)",
                  zIndex: 40,
                  transition: "opacity 200ms",
                },
                dragOverlayStyle,
              )}
              aria-hidden="true"
            />
          )}

          <div
            ref={ref}
            role="region"
            aria-label="칸반 보드"
            style={mergeStyles(
              boardBaseStyle,
              isDragging ? { position: "relative", zIndex: 50 } : undefined,
              resolveDot(dot),
              style,
            )}
            {...props}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column, index) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getColumnCards(column.id)}
                  index={index}
                  style={
                    column.collapsed
                      ? undefined
                      : {
                          minWidth: columnMinWidth,
                          maxWidth: columnMaxWidth,
                        }
                  }
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            {allowAddColumn && !readOnly && (
              <KanbanAddColumn
                style={{
                  minWidth: columnMinWidth,
                  maxWidth: columnMaxWidth,
                }}
              />
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeCard && (
              <div
                style={{
                  ...cardOverlayStyle,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <KanbanCard card={activeCard} index={0} isDragging />
              </div>
            )}
            {activeColumnData && (
              <div
                style={{
                  opacity: 0.9,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                  transform: "rotate(1deg)",
                  minWidth: columnMinWidth,
                  maxWidth: columnMaxWidth,
                }}
              >
                <KanbanColumn
                  column={activeColumnData}
                  cards={getColumnCards(activeColumnData.id)}
                  index={0}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </KanbanProvider>
    );
  },
);

KanbanBoard.displayName = "KanbanBoard";
