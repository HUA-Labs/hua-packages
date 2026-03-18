"use client";

import React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { createGlassStyle } from "../lib/styles/glass";
import { TRANSITIONS } from "../lib/styles/transition";

/**
 * Toast 메시지 타입 / Toast message type
 * @typedef {Object} Toast
 * @property {string} id - Toast 고유 ID / Toast unique ID
 * @property {"success" | "error" | "warning" | "info"} type - Toast 타입 / Toast type
 * @property {string} [title] - Toast 제목 / Toast title
 * @property {string} message - Toast 메시지 / Toast message
 * @property {number} [duration] - 표시 시간(ms), 0이면 자동 제거 안 함 / Display duration (ms), 0 means no auto-remove
 * @property {Object} [action] - 액션 버튼 / Action button
 * @property {string} action.label - 액션 버튼 레이블 / Action button label
 * @property {() => void} action.onClick - 액션 버튼 클릭 핸들러 / Action button click handler
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast Context 타입
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Toast Context 생성
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * useToast Hook
 *
 * Toast를 추가, 제거, 초기화하는 훅입니다.
 * ToastProvider 내부에서만 사용 가능합니다.
 *
 * Hook for adding, removing, and clearing toasts.
 * Can only be used within ToastProvider.
 *
 * @example
 * const { addToast, removeToast, clearToasts } = useToast()
 *
 * addToast({
 *   type: "success",
 *   message: "저장되었습니다",
 *   duration: 3000
 * })
 *
 * @returns {ToastContextType} Toast 컨텍스트 값 / Toast context value
 * @throws {Error} ToastProvider 외부에서 사용 시 에러 발생 / Error when used outside ToastProvider
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// No-op functions for safe toast hook
const noopAddToast = () => {};
const noopRemoveToast = () => {};
const noopClearToasts = () => {};

/**
 * useToastSafe Hook
 *
 * ToastProvider 없이도 안전하게 사용할 수 있는 useToast 훅입니다.
 * Provider가 없으면 no-op 함수를 반환합니다.
 *
 * Safe version of useToast that works without ToastProvider.
 * Returns no-op functions when used outside ToastProvider.
 *
 * @example
 * const { addToast } = useToastSafe()
 *
 * // 안전하게 호출 가능 - Provider 없으면 아무 일도 안 함
 * addToast({ type: "success", message: "저장됨" })
 *
 * @returns {ToastContextType} Toast 컨텍스트 값 또는 no-op 함수들
 */
export function useToastSafe(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      addToast: noopAddToast,
      removeToast: noopRemoveToast,
      clearToasts: noopClearToasts,
    };
  }
  return context;
}

/**
 * ToastProvider 컴포넌트의 props / ToastProvider component props
 * @typedef {Object} ToastProviderProps
 * @property {React.ReactNode} children - 자식 컴포넌트 / Child components
 * @property {number} [maxToasts=5] - 최대 Toast 개수 / Maximum number of toasts
 * @property {"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"} [position="top-right"] - Toast 표시 위치 / Toast display position
 */
interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

/**
 * ToastProvider 컴포넌트 / ToastProvider component
 *
 * Toast 시스템의 컨텍스트를 제공하는 Provider 컴포넌트입니다.
 * 앱의 루트 레벨에서 사용하여 전역 Toast 기능을 활성화합니다.
 *
 * Provider component that provides context for the Toast system.
 * Use at the root level of your app to enable global Toast functionality.
 *
 * @component
 * @example
 * // App.tsx
 * <ToastProvider position="top-center" maxToasts={3}>
 *   <App />
 * </ToastProvider>
 *
 * @example
 * // 컴포넌트에서 사용 / Usage in component
 * const { addToast } = useToast()
 *
 * const handleSave = () => {
 *   addToast({
 *     type: "success",
 *     message: "저장되었습니다",
 *     title: "성공"
 *   })
 * }
 *
 * @param {ToastProviderProps} props - ToastProvider 컴포넌트의 props / ToastProvider component props
 * @returns {JSX.Element} ToastProvider 컴포넌트 / ToastProvider component
 *
 * @todo 접근성 개선: ToastItem에 role="alert" 또는 role="status" 추가 필요 / Accessibility: Add role="alert" or role="status" to ToastItem
 * @todo 접근성 개선: aria-live="polite" 또는 aria-live="assertive" 추가 필요 / Accessibility: Add aria-live="polite" or aria-live="assertive"
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  position = "top-right",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updatedToasts = [...prev, newToast];
        return updatedToasts.slice(-maxToasts); // 최대 개수 제한
      });

      // 자동 제거
      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }
    },
    [maxToasts, removeToast],
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearToasts }}
    >
      {children}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
}

// Toast Container Props
interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
  position: string;
}

/** Inline CSSProperties for each position key */
const POSITION_STYLES: Record<string, React.CSSProperties> = {
  "top-right": { top: "1rem", right: "1rem" },
  "top-left": { top: "1rem", left: "1rem" },
  "bottom-right": { bottom: "1rem", right: "1rem" },
  "bottom-left": { bottom: "1rem", left: "1rem" },
  "top-center": { top: "1rem", left: "50%", transform: "translateX(-50%)" },
  "bottom-center": {
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
  },
};

const CONTAINER_BASE: React.CSSProperties = {
  position: "fixed",
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  ...resolveDot("gap-3"),
  maxWidth: "24rem",
};

// Toast Container
function ToastContainer({
  toasts,
  removeToast,
  position,
}: ToastContainerProps) {
  const containerStyle = useMemo(
    (): React.CSSProperties =>
      mergeStyles(
        CONTAINER_BASE,
        POSITION_STYLES[position] ?? POSITION_STYLES["top-right"],
      ),
    [position],
  );

  if (toasts.length === 0) return null;

  return (
    <div data-toast-container data-position={position} style={containerStyle}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

// Toast Item Props
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

/** Static base style for a toast item */
const ITEM_BASE: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  ...resolveDot("p-4 rounded-xl"),
  border: "1px solid",
  ...createGlassStyle("light"),
  transition: TRANSITIONS.smooth,
};

/** Type-specific styles: background, border color, text color */
const TYPE_STYLES: Record<Toast["type"], React.CSSProperties> = {
  success: {
    backgroundColor: "var(--toast-success-bg)",
    borderColor: "var(--toast-success-border, rgba(134, 239, 172, 0.6))",
    color: "var(--toast-success-text, #166534)",
    boxShadow: "0 10px 15px -3px rgba(187, 247, 208, 0.5)",
  },
  error: {
    backgroundColor: "var(--toast-error-bg)",
    borderColor: "var(--toast-error-border, rgba(252, 165, 165, 0.6))",
    color: "var(--toast-error-text, #991b1b)",
    boxShadow: "0 10px 15px -3px rgba(254, 202, 202, 0.5)",
  },
  warning: {
    backgroundColor: "var(--toast-warning-bg)",
    borderColor: "var(--toast-warning-border, rgba(253, 224, 71, 0.6))",
    color: "var(--toast-warning-text, #854d0e)",
    boxShadow: "0 10px 15px -3px rgba(254, 240, 138, 0.5)",
  },
  info: {
    backgroundColor: "var(--toast-info-bg)",
    borderColor: "var(--toast-info-border, rgba(165, 180, 252, 0.6))",
    color: "var(--toast-info-text, #1e3a5f)",
    boxShadow: "0 10px 15px -3px rgba(199, 210, 254, 0.5)",
  },
};

/** Type-specific icon colors */
const ICON_COLOR: Record<Toast["type"], string> = {
  success: "var(--toast-success-icon, #22c55e)",
  error: "var(--toast-error-icon, #ef4444)",
  warning: "var(--toast-warning-icon, #eab308)",
  info: "var(--toast-info-icon, #06b6d4)",
};

// Toast Item
function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const itemStyle = useMemo(
    (): React.CSSProperties =>
      mergeStyles(
        ITEM_BASE,
        TYPE_STYLES[toast.type],
        isVisible
          ? { transform: "translateX(0)", opacity: 1, scale: "1" }
          : { transform: "translateX(100%)", opacity: 0, scale: "0.95" },
        isVisible
          ? { animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }
          : undefined,
      ),
    [toast.type, isVisible],
  );

  const iconColor = ICON_COLOR[toast.type];

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    ...resolveDot("mr-3"),
    color: iconColor,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    ...resolveDot("mb-1"),
  };

  const messageStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    lineHeight: 1.625,
  };

  const actionStyle: React.CSSProperties = {
    ...resolveDot("mt-3"),
    fontSize: "0.875rem",
    fontWeight: 500,
    textDecoration: "underline",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "inherit",
  };

  const closeWrapperStyle: React.CSSProperties = {
    flexShrink: 0,
    ...resolveDot("ml-4"),
  };

  const closeButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    ...resolveDot("rounded-md p-1.5"),
    transition: "background-color 200ms ease-in-out",
    background: isCloseHovered ? "rgba(0, 0, 0, 0.05)" : "transparent",
    border: "none",
    cursor: "pointer",
    color: iconColor,
    outline: "none",
  };

  return (
    <div style={itemStyle}>
      {/* 아이콘 */}
      <div style={iconStyle}>{getToastIcon(toast.type)}</div>

      {/* 내용 */}
      <div style={contentStyle}>
        {toast.title && <h4 style={titleStyle}>{toast.title}</h4>}
        <p style={messageStyle}>{toast.message}</p>

        {/* 액션 버튼 */}
        {toast.action && (
          <button onClick={toast.action.onClick} style={actionStyle}>
            {toast.action.label}
          </button>
        )}
      </div>

      {/* 닫기 버튼 */}
      <div style={closeWrapperStyle}>
        <button
          onClick={handleRemove}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          style={closeButtonStyle}
          aria-label="닫기"
        >
          <svg
            style={{ width: "1rem", height: "1rem" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function getToastIcon(type: Toast["type"]): React.ReactElement {
  switch (type) {
    case "success":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    case "info":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}

// 편의 함수들 (ToastProvider 내부에서만 사용 가능 - 스텁 함수)
export const showToast = (_toast: Omit<Toast, "id">) => {
  // ToastProvider 컨텍스트 필요
};

export const showSuccessToast = (
  _message: string,
  _title?: string,
  _duration?: number,
) => {
  // ToastProvider 컨텍스트 필요
};

export const showErrorToast = (
  _message: string,
  _title?: string,
  _duration?: number,
) => {
  // ToastProvider 컨텍스트 필요
};

export const showWarningToast = (
  _message: string,
  _title?: string,
  _duration?: number,
) => {
  // ToastProvider 컨텍스트 필요
};

export const showInfoToast = (
  _message: string,
  _title?: string,
  _duration?: number,
) => {
  // ToastProvider 컨텍스트 필요
};
