"use client";

import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { composeRefs } from "../../../lib/Slot";
import { Icon } from "../../Icon";
import { useKanban } from "./KanbanContext";
import type { KanbanCardProps, KanbanPriority } from "./types";

// Keyframes ID for animation
const KEYFRAMES_ID = "kanban-card-keyframes";

function mergeAriaTokens(
  ...values: Array<string | undefined>
): string | undefined {
  const tokens = values.flatMap(
    (value) => value?.split(/\s+/u).filter(Boolean) ?? [],
  );
  const unique = [...new Set(tokens)];
  return unique.length > 0 ? unique.join(" ") : undefined;
}

/**
 * Hook to inject keyframes once
 */
function useCardKeyframes() {
  useEffect(() => {
    if (document.getElementById(KEYFRAMES_ID)) return;

    const style = document.createElement("style");
    style.id = KEYFRAMES_ID;
    style.textContent = `
      @keyframes kanban-card-enter {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes kanban-card-exit {
        from {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateX(20px) scale(0.95);
        }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/**
 * Priority 라벨 매핑
 */
const priorityLabels: Record<KanbanPriority, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  urgent: "긴급",
};

/**
 * Priority badge inline styles
 */
const priorityBadgeStyles: Record<KanbanPriority, React.CSSProperties> = {
  urgent: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  high: { backgroundColor: "#ffedd5", color: "#c2410c" },
  medium: { backgroundColor: "#e0e7ff", color: "#0e7490" },
  low: { backgroundColor: "#f3f4f6", color: "#374151" },
};

/**
 * Variant base card styles (light mode; dark mode handled via JS theme detection is not done here,
 * so we use a neutral approach)
 */
const cardVariantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: "#ffffff" },
  gradient: { background: "linear-gradient(135deg, #ffffff, #f9fafb)" },
  outline: { backgroundColor: "transparent", border: "1px solid #e5e7eb" },
  elevated: {
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
  },
};

/**
 * KanbanCard 컴포넌트
 *
 * @dnd-kit의 useSortable을 사용하여 드래그앤드롭을 지원합니다.
 * 우선순위 표시, 담당자, 마감일 등을 지원합니다.
 */
export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  (
    {
      card,
      index,
      isDragging: isDraggingProp = false,
      isOver = false,
      dot,
      style,
      onClick: consumerOnClick,
      onKeyDown: consumerOnKeyDown,
      onMouseDown: consumerOnMouseDown,
      onPointerDown: consumerOnPointerDown,
      onTouchStart: consumerOnTouchStart,
      "aria-describedby": consumerAriaDescribedBy,
      ...props
    },
    ref,
  ) => {
    // Inject keyframes
    useCardKeyframes();

    const { deleteCard, variant, allowCardDrag, readOnly, onCardClick } =
      useKanban();

    // Sortable setup
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: card.id,
      disabled: !allowCardDrag || readOnly,
      data: {
        type: "card",
        card,
        columnId: card.columnId,
      },
    });
    const composedRef = useMemo(
      () => composeRefs<HTMLDivElement>(setNodeRef, ref),
      [ref, setNodeRef],
    );
    const sortableListeners = listeners as
      | {
          onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
          onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
          onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
          onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
        }
      | undefined;
    const sortableAriaDescribedBy = attributes["aria-describedby"];
    const ariaDescribedBy = mergeAriaTokens(
      sortableAriaDescribedBy,
      consumerAriaDescribedBy,
    );

    // Sortable styles
    const sortableStyle: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleClick = useCallback(() => {
      if (!isDragging && !isDraggingProp) {
        onCardClick?.(card);
      }
    }, [card, isDragging, isDraggingProp, onCardClick]);

    const handleRootClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging || isDraggingProp) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        consumerOnClick?.(event);
        if (!event.defaultPrevented) handleClick();
      },
      [consumerOnClick, handleClick, isDragging, isDraggingProp],
    );

    const handleRootKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        sortableListeners?.onKeyDown?.(event);
        const dndOwnedEvent = event.defaultPrevented;
        consumerOnKeyDown?.(event);
        if (dndOwnedEvent) return;
        if (
          !event.defaultPrevented &&
          (!allowCardDrag || readOnly) &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          handleClick();
        }
      },
      [
        allowCardDrag,
        consumerOnKeyDown,
        handleClick,
        readOnly,
        sortableListeners,
      ],
    );

    const handleRootMouseDown = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        sortableListeners?.onMouseDown?.(event);
        consumerOnMouseDown?.(event);
      },
      [consumerOnMouseDown, sortableListeners],
    );

    const handleRootPointerDown = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        sortableListeners?.onPointerDown?.(event);
        consumerOnPointerDown?.(event);
      },
      [consumerOnPointerDown, sortableListeners],
    );

    const handleRootTouchStart = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        sortableListeners?.onTouchStart?.(event);
        consumerOnTouchStart?.(event);
      },
      [consumerOnTouchStart, sortableListeners],
    );

    // Delete animation state
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);

        // Wait for animation then delete
        setTimeout(() => {
          deleteCard(card.id);
        }, 200);
      },
      [card.id, deleteCard],
    );

    // Format due date
    const formatDueDate = (date: Date | string | undefined): string | null => {
      if (!date) return null;
      const d = typeof date === "string" ? new Date(date) : date;
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days < 0) return `${Math.abs(days)}일 지남`;
      if (days === 0) return "오늘";
      if (days === 1) return "내일";
      return `${days}일 남음`;
    };

    const dueText = formatDueDate(card.dueDate);
    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

    // Base card style
    const variantStyle =
      cardVariantStyles[variant] ?? cardVariantStyles.elevated;

    // Card animation styles
    const animationStyle: React.CSSProperties = {
      animation: isDeleting
        ? "kanban-card-exit 0.2s ease-out forwards"
        : "kanban-card-enter 0.2s ease-out both",
      animationDelay: isDeleting ? "0ms" : `${Math.min(index * 30, 150)}ms`,
    };

    const cardStyle: React.CSSProperties = mergeStyles(
      {
        position: "relative",
        ...resolveDot("rounded-lg p-3 mb-2"),
        cursor: allowCardDrag ? "grab" : "default",
        transition: "all 200ms",
        outline: isOver ? "1px solid #6366f1" : undefined,
      },
      variantStyle,
      isDragging
        ? {
            opacity: 0.5,
            transform: "scale(0.95)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            zIndex: 50,
          }
        : undefined,
      isDeleting ? { pointerEvents: "none" } : undefined,
      sortableStyle,
      animationStyle,
      resolveDot(dot),
      style,
    );

    return (
      <div
        {...attributes}
        ref={composedRef}
        data-card-id={card.id}
        role="listitem"
        aria-label={card.title}
        aria-describedby={ariaDescribedBy}
        tabIndex={0}
        style={cardStyle}
        {...props}
        onClick={handleRootClick}
        onKeyDown={handleRootKeyDown}
        onMouseDown={handleRootMouseDown}
        onPointerDown={handleRootPointerDown}
        onTouchStart={handleRootTouchStart}
      >
        {/* Delete button (shown on hover) */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleDelete}
            style={{
              position: "absolute",
              ...resolveDot("top-2 right-2 p-1 rounded"),
              opacity: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              transition: "opacity 150ms, background-color 150ms",
            }}
            aria-label="카드 삭제"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#fee2e2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
            }}
          >
            <Icon name="close" size={12} style={{ color: "#9ca3af" }} />
          </button>
        )}

        {/* Title */}
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#1f2937",
            ...resolveDot("pr-6 mb-1"),
          }}
        >
          {card.title}
        </h4>

        {/* Description */}
        {card.description && (
          <p
            style={
              {
                fontSize: "0.75rem",
                color: "#6b7280",
                ...resolveDot("mb-2"),
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              } as React.CSSProperties
            }
          >
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              ...resolveDot("gap-1 mb-2"),
            }}
          >
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.75rem",
                  ...resolveDot("px-1.5 py-0.5 rounded"),
                  backgroundColor: "#f3f4f6",
                  color: "#4b5563",
                }}
              >
                {tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Assignee, Due date, Priority */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...resolveDot("mt-2"),
          }}
        >
          {/* Assignee */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              ...resolveDot("gap-1"),
            }}
          >
            {card.assignee && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  ...resolveDot("gap-1.5"),
                }}
              >
                {card.assignee.avatar ? (
                  <img
                    src={card.assignee.avatar}
                    alt={card.assignee.name}
                    style={{ ...resolveDot("w-5 h-5 rounded-full") }}
                  />
                ) : (
                  <div
                    style={{
                      ...resolveDot("w-5 h-5 rounded-full"),
                      backgroundColor: "#d1d5db",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 500,
                        color: "#4b5563",
                      }}
                    >
                      {card.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {card.assignee.name}
                </span>
              </div>
            )}
          </div>

          {/* Due date & Priority */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              ...resolveDot("gap-2"),
            }}
          >
            {dueText && (
              <span
                style={{
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  ...resolveDot("gap-0.5"),
                  color: isOverdue ? "#ef4444" : "#9ca3af",
                }}
              >
                <Icon name="clock" size={12} />
                {dueText}
              </span>
            )}
            {card.priority && (
              <span
                style={{
                  fontSize: "0.625rem",
                  ...resolveDot("px-1.5 py-0.5 rounded"),
                  ...priorityBadgeStyles[card.priority],
                }}
              >
                {priorityLabels[card.priority]}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

KanbanCard.displayName = "KanbanCard";
