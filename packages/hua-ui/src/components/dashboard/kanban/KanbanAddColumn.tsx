"use client";

import React, { useState, useRef, useEffect } from "react";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { Icon } from "../../Icon";
import { useKanban } from "./KanbanContext";
import type { KanbanAddColumnProps } from "./types";

/**
 * KanbanAddColumn 컴포넌트
 *
 * 새 컬럼을 추가하는 UI입니다.
 * 버튼 클릭 시 입력 폼이 나타나고, Enter로 추가합니다.
 */
export const KanbanAddColumn = React.forwardRef<
  HTMLDivElement,
  KanbanAddColumnProps
>(
  (
    {
      onAdd,
      onCancel,
      placeholder = "컬럼 제목 입력...",
      dot,
      style,
      ...props
    },
    ref,
  ) => {
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

    // Variant base styles
    const variantBaseStyle: React.CSSProperties = (() => {
      switch (variant) {
        case "gradient":
          return {
            background:
              "linear-gradient(to bottom, rgba(243,244,246,0.5), rgba(255,255,255,0.5))",
          };
        case "outline":
          return { border: "2px dashed #d1d5db", background: "transparent" };
        case "elevated":
        case "default":
        default:
          return { backgroundColor: "rgba(243,244,246,0.5)" };
      }
    })();

    // Adding form
    if (isAdding) {
      return (
        <div
          ref={ref}
          style={mergeStyles(
            { flexShrink: 0, ...resolveDot("rounded-xl p-3") },
            variantBaseStyle,
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
            placeholder={placeholder}
            style={{
              width: "100%",
              ...resolveDot("px-3 py-2 rounded-lg"),
              fontSize: "0.875rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              outline: "none",
              color: "#1f2937",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              ...resolveDot("gap-2 mt-3"),
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                ...resolveDot("px-3 py-1.5"),
                fontSize: "0.875rem",
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
                      ...resolveDot("px-4 py-1.5 rounded-lg"),
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 150ms",
                    }
                  : {
                      ...resolveDot("px-4 py-1.5 rounded-lg"),
                      fontSize: "0.875rem",
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

    // Add button - prominent and inviting
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={handleStartAdding}
        style={mergeStyles(
          {
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            ...resolveDot("gap-3 rounded-xl"),
            border: "2px dashed #d1d5db",
            color: "#9ca3af",
            background: "none",
            cursor: "pointer",
            transition: "all 200ms",
            minHeight: 300,
          },
          resolveDot(dot),
          style,
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <div
          style={{
            ...resolveDot("w-12 h-12 rounded-full"),
            border: "2px dashed currentColor",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 200ms",
          }}
        >
          <Icon name="add" size={24} />
        </div>
        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
          새 컬럼 추가
        </span>
      </button>
    );
  },
);

KanbanAddColumn.displayName = "KanbanAddColumn";
