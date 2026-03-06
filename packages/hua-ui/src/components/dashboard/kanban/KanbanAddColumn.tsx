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
export const KanbanAddColumn = React.forwardRef<HTMLDivElement, KanbanAddColumnProps>(
  ({ onAdd, onCancel, placeholder = "컬럼 제목 입력...", dot, style, ...props }, ref) => {
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
          return { background: "linear-gradient(to bottom, rgba(243,244,246,0.5), rgba(255,255,255,0.5))" };
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
            { flexShrink: 0, borderRadius: "0.75rem", padding: "0.75rem" },
            variantBaseStyle,
            resolveDot(dot),
            style
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
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              fontSize: "0.875rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
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
              gap: "0.5rem",
              marginTop: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                paddingTop: "0.375rem",
                paddingBottom: "0.375rem",
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
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.375rem",
                      paddingBottom: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      borderRadius: "0.5rem",
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 150ms",
                    }
                  : {
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.375rem",
                      paddingBottom: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      borderRadius: "0.5rem",
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
            gap: "0.75rem",
            borderRadius: "0.75rem",
            border: "2px dashed #d1d5db",
            color: "#9ca3af",
            background: "none",
            cursor: "pointer",
            transition: "all 200ms",
            minHeight: 300,
          },
          resolveDot(dot),
          style
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "9999px",
            border: "2px dashed currentColor",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 200ms",
          }}
        >
          <Icon name="add" size={24} />
        </div>
        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>새 컬럼 추가</span>
      </button>
    );
  }
);

KanbanAddColumn.displayName = "KanbanAddColumn";
