"use client";

import React, { useState, useRef, useEffect } from "react";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { Icon } from "../../Icon";
import { useKanban } from "./KanbanContext";
import type { KanbanAddCardProps } from "./types";

/**
 * KanbanAddCard 컴포넌트
 *
 * 새 카드를 추가하는 인라인 폼입니다.
 * 버튼 클릭 시 입력 폼이 나타나고, Enter로 추가합니다.
 */
export const KanbanAddCard = React.forwardRef<
  HTMLDivElement,
  KanbanAddCardProps
>(
  (
    {
      columnId,
      onAdd,
      onCancel,
      placeholder = "카드 제목 입력...",
      dot,
      style,
      ...props
    },
    ref,
  ) => {
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
          style={mergeStyles(
            {
              ...resolveDot("rounded-lg p-2"),
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            },
            resolveDot(dot),
            style,
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
            style={{
              width: "100%",
              ...resolveDot("px-2 py-1.5"),
              fontSize: "0.875rem",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#1f2937",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              ...resolveDot("gap-1 mt-2"),
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                ...resolveDot("px-2 py-1"),
                fontSize: "0.75rem",
                color: "#6b7280",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              style={
                title.trim()
                  ? {
                      ...resolveDot("px-3 py-1 rounded"),
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 150ms",
                    }
                  : {
                      ...resolveDot("px-3 py-1 rounded"),
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: "#e5e7eb",
                      color: "#9ca3af",
                      border: "none",
                      cursor: "not-allowed",
                    }
              }
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
        style={mergeStyles(
          {
            width: "100%",
            display: "flex",
            alignItems: "center",
            ...resolveDot("gap-2 px-3 py-2 rounded-lg"),
            fontSize: "0.875rem",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "background-color 150ms, color 150ms",
          },
          resolveDot(dot),
          style,
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <Icon name="add" size={16} />
        <span>카드 추가</span>
      </button>
    );
  },
);

KanbanAddCard.displayName = "KanbanAddCard";
