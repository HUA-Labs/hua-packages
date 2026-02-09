"use client";

import React, { useMemo, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { merge } from "../../../lib/utils";
import { useKanban } from "./KanbanContext";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanCard } from "./KanbanCard";
import { KanbanAddCard } from "./KanbanAddCard";
import type { KanbanColumnProps } from "./types";

// Keyframes ID for animation
const KEYFRAMES_ID = "kanban-column-keyframes";

/**
 * Hook to inject keyframes once
 */
function useColumnKeyframes() {
  useEffect(() => {
    if (document.getElementById(KEYFRAMES_ID)) return;

    const style = document.createElement("style");
    style.id = KEYFRAMES_ID;
    style.textContent = `
      @keyframes kanban-column-enter {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/**
 * KanbanColumn 컴포넌트
 *
 * @dnd-kit의 useSortable을 사용하여 컬럼 재정렬을 지원합니다.
 * 카드는 SortableContext로 감싸서 세로 정렬을 지원합니다.
 */
export const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ column, cards, index, className, style, ...props }, ref) => {
    // Inject keyframes
    useColumnKeyframes();

    const {
      updateColumn,
      deleteColumn,
      canDropCard,
      variant,
      allowColumnDrag,
      allowAddCard,
      readOnly,
    } = useKanban();

    // Sortable setup for column
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: column.id,
      disabled: !allowColumnDrag || readOnly,
    });

    // Sortable styles with entrance animation
    // Keep dragged column in place (with low opacity) so dnd-kit sorting works correctly
    const sortableStyle: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      animation: isDragging ? "none" : "kanban-column-enter 0.25s ease-out both",
      animationDelay: isDragging ? "0ms" : `${index * 50}ms`,
      ...style,
    };

    // WIP limit check
    const isAtLimit = column.limit !== undefined && cards.length >= column.limit;
    const canDrop = canDropCard(column.id);

    // Card IDs for SortableContext
    const cardIds = useMemo(() => cards.map((c) => c.id), [cards]);

    // Column header actions
    const handleTitleChange = (title: string) => {
      updateColumn(column.id, { title });
    };

    const handleDelete = () => {
      deleteColumn(column.id);
    };

    const handleToggleCollapse = () => {
      updateColumn(column.id, { collapsed: !column.collapsed });
    };

    // Variant styles
    const columnStyles = {
      default: "bg-gray-100 dark:bg-gray-800/50",
      gradient: "bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900",
      outline: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
      elevated: "bg-white dark:bg-gray-800 shadow-md",
    };

    return (
      <div
        ref={setNodeRef}
        role="group"
        aria-label={`${column.title} 컬럼`}
        className={merge(
          "flex flex-col rounded-xl transition-all duration-300 ease-out",
          columnStyles[variant],
          // Show placeholder with low opacity when dragging (DragOverlay shows the actual visual)
          isDragging && "opacity-40",
          column.collapsed ? "w-16 min-w-[4rem] max-w-[4rem]" : "flex-shrink-0",
          className
        )}
        style={sortableStyle}
        {...props}
      >
        {/* Column Header */}
        <KanbanColumnHeader
          column={column}
          cardCount={cards.length}
          onTitleChange={!readOnly ? handleTitleChange : undefined}
          onDelete={!readOnly ? handleDelete : undefined}
          onToggleCollapse={handleToggleCollapse}
          dragHandleProps={{
            ...attributes,
            ...listeners,
            className: merge(
              "cursor-grab active:cursor-grabbing",
              !allowColumnDrag && "cursor-default"
            ),
          }}
        />

        {/* Cards Container */}
        {!column.collapsed && (
          <div
            className="flex-1 px-2 pb-2 overflow-y-auto overflow-x-hidden min-h-[100px]"
            role="list"
            aria-label={`${column.title} 카드 목록`}
          >
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              {cards.map((card, cardIndex) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  index={cardIndex}
                />
              ))}
            </SortableContext>

            {/* Empty state */}
            {cards.length === 0 && (
              <div className="flex items-center justify-center h-20 text-sm text-gray-400 dark:text-gray-500">
                카드를 드래그하세요
              </div>
            )}
          </div>
        )}

        {/* Add Card Button */}
        {!column.collapsed && allowAddCard && !readOnly && !isAtLimit && (
          <div className="px-2 pb-2">
            <KanbanAddCard columnId={column.id} />
          </div>
        )}

        {/* WIP Limit Warning */}
        {!column.collapsed && isAtLimit && (
          <div className="px-2 pb-2 text-xs text-center text-amber-600 dark:text-amber-400">
            WIP 제한 도달 ({column.limit}개)
          </div>
        )}
      </div>
    );
  }
);

KanbanColumn.displayName = "KanbanColumn";
