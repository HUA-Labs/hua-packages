"use client";

import React, { useState, useRef, useEffect } from "react";
import { merge } from "../../../lib/utils";
import { Icon } from "../../Icon";
import { useKanban } from "./KanbanContext";
import type { KanbanAddCardProps } from "./types";

/**
 * KanbanAddCard 컴포넌트
 *
 * 새 카드를 추가하는 인라인 폼입니다.
 * 버튼 클릭 시 입력 폼이 나타나고, Enter로 추가합니다.
 */
export const KanbanAddCard = React.forwardRef<HTMLDivElement, KanbanAddCardProps>(
  ({ columnId, onAdd, onCancel, placeholder = "카드 제목 입력...", className, ...props }, ref) => {
    const { addCard } = useKanban();
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

      const newCard = { title: trimmedTitle };

      if (onAdd) {
        onAdd(newCard);
      } else {
        addCard(columnId, newCard);
      }

      setTitle("");
      // Keep form open for multiple additions
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    };

    // Adding form
    if (isAdding) {
      return (
        <div
          ref={ref}
          className={merge(
            "rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-2",
            className
          )}
          {...props}
        >
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay to allow button click
              setTimeout(() => {
                if (!title.trim()) {
                  handleCancel();
                }
              }, 150);
            }}
            placeholder={placeholder}
            className="w-full px-2 py-1.5 text-sm bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-400"
          />
          <div className="flex items-center justify-end gap-1 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={merge(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
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

    // Add button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={handleStartAdding}
        className={merge(
          "w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors",
          className
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <Icon name="add" size={16} />
        <span>카드 추가</span>
      </button>
    );
  }
);

KanbanAddCard.displayName = "KanbanAddCard";
