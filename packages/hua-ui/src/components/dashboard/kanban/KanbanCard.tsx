"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { Icon } from "../../Icon";
import { useKanban } from "./KanbanContext";
import type { KanbanCardProps, KanbanPriority } from "./types";

// Keyframes ID for animation
const KEYFRAMES_ID = "kanban-card-keyframes";

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
  elevated: { backgroundColor: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" },
};

/**
 * KanbanCard 컴포넌트
 *
 * @dnd-kit의 useSortable을 사용하여 드래그앤드롭을 지원합니다.
 * 우선순위 표시, 담당자, 마감일 등을 지원합니다.
 */
export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ card, index, isDragging: isDraggingProp = false, isOver = false, dot, style, ...props }, ref) => {
    // Inject keyframes
    useCardKeyframes();

    const {
      deleteCard,
      variant,
      allowCardDrag,
      readOnly,
      onCardClick,
    } = useKanban();

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

    // Sortable styles
    const sortableStyle: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleClick = useCallback(() => {
      if (!isDragging) {
        onCardClick?.(card);
      }
    }, [card, onCardClick, isDragging]);

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
      [card.id, deleteCard]
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
    const variantStyle = cardVariantStyles[variant] ?? cardVariantStyles.elevated;

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
        borderRadius: "0.5rem",
        padding: "0.75rem",
        marginBottom: "0.5rem",
        cursor: allowCardDrag ? "grab" : "default",
        transition: "all 200ms",
        touchAction: "none",
        outline: isOver ? "1px solid #6366f1" : undefined,
      },
      variantStyle,
      isDragging
        ? { opacity: 0.5, transform: "scale(0.95)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", zIndex: 50 }
        : undefined,
      isDeleting ? { pointerEvents: "none" } : undefined,
      sortableStyle,
      animationStyle,
      resolveDot(dot),
      style
    );

    return (
      <div
        {...attributes}
        {...listeners}
        ref={setNodeRef}
        data-card-id={card.id}
        role="listitem"
        aria-label={card.title}
        tabIndex={0}
        style={cardStyle}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {/* Delete button (shown on hover) */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleDelete}
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              padding: "0.25rem",
              borderRadius: "0.25rem",
              opacity: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              transition: "opacity 150ms, background-color 150ms",
            }}
            aria-label="카드 삭제"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
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
            paddingRight: "1.5rem",
            marginBottom: "0.25rem",
          }}
        >
          {card.title}
        </h4>

        {/* Description */}
        {card.description && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginBottom: "0.5rem",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            } as React.CSSProperties}
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
              gap: "0.25rem",
              marginBottom: "0.5rem",
            }}
          >
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.75rem",
                  paddingLeft: "0.375rem",
                  paddingRight: "0.375rem",
                  paddingTop: "0.125rem",
                  paddingBottom: "0.125rem",
                  borderRadius: "0.25rem",
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
            marginTop: "0.5rem",
          }}
        >
          {/* Assignee */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {card.assignee && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                {card.assignee.avatar ? (
                  <img
                    src={card.assignee.avatar}
                    alt={card.assignee.name}
                    style={{ width: "1.25rem", height: "1.25rem", borderRadius: "9999px" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      borderRadius: "9999px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {dueText && (
              <span
                style={{
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.125rem",
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
                  paddingLeft: "0.375rem",
                  paddingRight: "0.375rem",
                  paddingTop: "0.125rem",
                  paddingBottom: "0.125rem",
                  borderRadius: "0.25rem",
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
  }
);

KanbanCard.displayName = "KanbanCard";
