"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { merge } from "../../../lib/utils";
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
 * KanbanCard 컴포넌트
 *
 * @dnd-kit의 useSortable을 사용하여 드래그앤드롭을 지원합니다.
 * 우선순위 표시, 담당자, 마감일 등을 지원합니다.
 */
export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ card, index, isDragging: isDraggingProp = false, isOver = false, className, style, ...props }, ref) => {
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
    const sortableStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
      ...style,
    };

    const handleClick = useCallback(() => {
      if (!isDragging) {
        onCardClick?.(card);
      }
    }, [card, onCardClick, isDragging]);

    // Delete animation state
    const [isDeleting, setIsDeleting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

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

    // Variant styles
    const cardStyles = {
      default: "bg-white dark:bg-gray-800",
      gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850",
      outline: "bg-transparent border border-gray-200 dark:border-gray-700",
      elevated: "bg-white dark:bg-gray-800 shadow-sm",
    };

    // Card animation styles
    const animationStyle = {
      ...sortableStyle,
      animation: isDeleting
        ? "kanban-card-exit 0.2s ease-out forwards"
        : "kanban-card-enter 0.2s ease-out both",
      animationDelay: isDeleting ? "0ms" : `${Math.min(index * 30, 150)}ms`,
    };

    return (
      <div
        {...attributes}
        {...listeners}
        ref={setNodeRef}
        data-card-id={card.id}
        role="listitem"
        aria-label={card.title}
        tabIndex={0}
        className={merge(
          "group relative rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition-all duration-200",
          cardStyles[variant],
          isDragging && "opacity-50 scale-95 shadow-2xl z-50",
          isOver && "ring-1 ring-indigo-500",
          !allowCardDrag && "cursor-default",
          isDeleting && "pointer-events-none",
          "hover:shadow-md hover:-translate-y-0.5 touch-none",
          className
        )}
        style={animationStyle}
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
            className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            aria-label="카드 삭제"
          >
            <Icon name="close" size={12} className="text-gray-400 hover:text-red-500" />
          </button>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-gray-800 dark:text-white pr-6 mb-1">
          {card.title}
        </h4>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{card.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer: Assignee, Due date, Priority */}
        <div className="flex items-center justify-between mt-2">
          {/* Assignee */}
          <div className="flex items-center gap-1">
            {card.assignee && (
              <div className="flex items-center gap-1.5">
                {card.assignee.avatar ? (
                  <img
                    src={card.assignee.avatar}
                    alt={card.assignee.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {card.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {card.assignee.name}
                </span>
              </div>
            )}
          </div>

          {/* Due date & Priority */}
          <div className="flex items-center gap-2">
            {dueText && (
              <span
                className={merge(
                  "text-xs flex items-center gap-0.5",
                  isOverdue
                    ? "text-red-500"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                <Icon name="clock" size={12} />
                {dueText}
              </span>
            )}
            {card.priority && (
              <span
                className={merge(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  card.priority === "urgent" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  card.priority === "high" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                  card.priority === "medium" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  card.priority === "low" && "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                )}
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
