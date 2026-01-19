"use client";

import React, { useState, useRef, useEffect } from "react";
import { merge } from "../../../lib/utils";
import { Icon } from "../../Icon";
import { useKanban } from "./KanbanContext";
import type { KanbanAddColumnProps } from "./types";

/**
 * KanbanAddColumn 컴포넌트
 *
 * 새 컬럼을 추가하는 UI입니다.
 * 버튼 클릭 시 입력 폼이 나타나고, Enter로 추가합니다.
 */
export const KanbanAddColumn = React.forwardRef<HTMLDivElement, KanbanAddColumnProps>(
  ({ onAdd, onCancel, placeholder = "컬럼 제목 입력...", className, style, ...props }, ref) => {
    const { addColumn, variant } = useKanban();
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when adding starts
    useEffect(() => {
      if (isAdding && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isAdding]);

    const handleStartAdding = () => {
      setIsAdding(true);
      setTitle("");
    };

    const handleCancel = () => {
      setIsAdding(false);
      setTitle("");
      onCancel?.();
    };

    const handleSubmit = () => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        handleCancel();
        return;
      }

      const newColumn = { title: trimmedTitle };

      if (onAdd) {
        onAdd(newColumn);
      } else {
        addColumn(newColumn);
      }

      setIsAdding(false);
      setTitle("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    };

    // Variant styles
    const columnStyles = {
      default: "bg-gray-100/50 dark:bg-gray-800/30",
      gradient: "bg-gradient-to-b from-gray-100/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30",
      outline: "border-2 border-dashed border-gray-300 dark:border-gray-600",
      elevated: "bg-gray-100/50 dark:bg-gray-800/30",
    };

    // Adding form
    if (isAdding) {
      return (
        <div
          ref={ref}
          className={merge(
            "flex-shrink-0 rounded-xl p-3",
            columnStyles[variant],
            className
          )}
          style={style}
          {...props}
        >
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white placeholder-gray-400"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={merge(
                "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                title.trim()
                  ? "bg-indigo-500 text-white hover:bg-indigo-600"
                  : "bg-gray-200 text-gray-400 dark:bg-gray-700 cursor-not-allowed"
              )}
            >
              추가
            </button>
          </div>
        </div>
      );
    }

    // Add button - prominent and inviting
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={handleStartAdding}
        className={merge(
          "group flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-xl",
          "border-2 border-dashed border-gray-300 dark:border-gray-600",
          "hover:border-indigo-400 dark:hover:border-indigo-500",
          "hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20",
          "transition-all duration-200",
          "text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400",
          className
        )}
        style={{ ...style, minHeight: 300 }}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-solid group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all duration-200">
          <Icon name="add" size={24} />
        </div>
        <span className="text-sm font-medium">새 컬럼 추가</span>
      </button>
    );
  }
);

KanbanAddColumn.displayName = "KanbanAddColumn";
