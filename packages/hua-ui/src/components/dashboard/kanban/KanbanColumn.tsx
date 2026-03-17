"use client";

import React, { useMemo, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
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
 * Variant base styles for columns (light mode)
 */
const columnVariantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: "rgba(243,244,246,0.5)" },
  gradient: { background: "linear-gradient(to bottom, #f3f4f6, #ffffff)" },
  outline: { backgroundColor: "transparent", border: "2px solid #e5e7eb" },
  elevated: {
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  },
};

/**
 * KanbanColumn 컴포넌트
 *
 * @dnd-kit의 useSortable을 사용하여 컬럼 재정렬을 지원합니다.
 * 카드는 SortableContext로 감싸서 세로 정렬을 지원합니다.
 */
export const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ column, cards, index, style, dot: dotProp, ...props }, ref) => {
    // Inject keyframes
    useColumnKeyframes();

    const {
      updateColumn,
      deleteColumn,
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
    const dotStyle = dotProp ? resolveDot(dotProp) : undefined;
    const sortableStyle: React.CSSProperties = mergeStyles(
      {
        transform: CSS.Transform.toString(transform),
        transition,
        animation: isDragging
          ? "none"
          : "kanban-column-enter 0.25s ease-out both",
        animationDelay: isDragging ? "0ms" : `${index * 50}ms`,
      },
      style,
      dotStyle,
    );

    // WIP limit check
    const isAtLimit =
      column.limit !== undefined && cards.length >= column.limit;

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

    // Variant base style
    const variantStyle =
      columnVariantStyles[variant] ?? columnVariantStyles.elevated;

    const columnStyle: React.CSSProperties = mergeStyles(
      {
        display: "flex",
        flexDirection: "column",
        ...resolveDot("rounded-xl"),
        transition: "all 300ms ease-out",
        opacity: isDragging ? 0.4 : 1,
        ...(column.collapsed
          ? { width: "4rem", minWidth: "4rem", maxWidth: "4rem" }
          : { flexShrink: 0 }),
      },
      variantStyle,
      sortableStyle,
    );

    return (
      <div
        ref={setNodeRef}
        role="group"
        aria-label={`${column.title} 컬럼`}
        style={columnStyle}
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
            style: {
              cursor: allowColumnDrag ? "grab" : "default",
            },
          }}
        />

        {/* Cards Container */}
        {!column.collapsed && (
          <div
            style={{
              flex: 1,
              ...resolveDot("px-2 pb-2"),
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: "100px",
            }}
            role="list"
            aria-label={`${column.title} 카드 목록`}
          >
            <SortableContext
              items={cardIds}
              strategy={verticalListSortingStrategy}
            >
              {cards.map((card, cardIndex) => (
                <KanbanCard key={card.id} card={card} index={cardIndex} />
              ))}
            </SortableContext>

            {/* Empty state */}
            {cards.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "5rem",
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                }}
              >
                카드를 드래그하세요
              </div>
            )}
          </div>
        )}

        {/* Add Card Button */}
        {!column.collapsed && allowAddCard && !readOnly && !isAtLimit && (
          <div style={{ ...resolveDot("px-2 pb-2") }}>
            <KanbanAddCard columnId={column.id} />
          </div>
        )}

        {/* WIP Limit Warning */}
        {!column.collapsed && isAtLimit && (
          <div
            style={{
              ...resolveDot("px-2 pb-2"),
              fontSize: "0.75rem",
              textAlign: "center",
              color: "#d97706",
            }}
          >
            WIP 제한 도달 ({column.limit}개)
          </div>
        )}
      </div>
    );
  },
);

KanbanColumn.displayName = "KanbanColumn";
