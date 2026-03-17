"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Modal } from "./Modal";
import { Button } from "./Button";

/**
 * ConfirmModal 컴포넌트의 props / ConfirmModal component props
 * @typedef {Object} ConfirmModalProps
 * @property {boolean} isOpen - 모달 열림/닫힘 상태 / Modal open/close state
 * @property {() => void} onClose - 닫기 콜백 / Close callback
 * @property {() => void} onConfirm - 확인 콜백 / Confirm callback
 * @property {string} title - 모달 제목 / Modal title
 * @property {string} message - 모달 메시지 / Modal message
 * @property {string} [warning] - 경고 메시지 / Warning message
 * @property {string} [confirmText="확인"] - 확인 버튼 텍스트 / Confirm button text
 * @property {string} [cancelText="취소"] - 취소 버튼 텍스트 / Cancel button text
 * @property {string} [confirmButtonText] - 확인 버튼 커스텀 텍스트 / Custom confirm button text
 * @property {"danger" | "warning" | "info" | "success" | "error"} [type="danger"] - 모달 타입 / Modal type
 * @property {boolean} [loading=false] - 로딩 상태 / Loading state
 * @property {boolean} [disabled=false] - 비활성화 여부 / Disabled state
 * @property {boolean} [showInput=false] - 입력 필드 표시 여부 / Show input field
 * @property {string} [inputValue=""] - 입력 필드 값 / Input field value
 * @property {(value: string) => void} [onInputChange] - 입력 값 변경 콜백 / Input value change callback
 * @property {string} [inputPlaceholder] - 입력 필드 플레이스홀더 / Input field placeholder
 * @property {string} [inputLabel] - 입력 필드 라벨 / Input field label
 * @property {string} [requiredInputValue] - 필수 입력 값 (확인 버튼 활성화 조건) / Required input value (confirm button activation condition)
 * @property {boolean} [showCancel=true] - 취소 버튼 표시 여부 / Show cancel button
 * @property {"sm" | "md" | "lg" | "xl" | "2xl"} [size="md"] - 모달 크기 / Modal size
 * @property {string} [dot] - dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string
 * @property {React.CSSProperties} [style] - 추가 인라인 스타일 / Additional inline styles
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonText?: string;
  type?: "danger" | "warning" | "info" | "success" | "error";
  loading?: boolean;
  disabled?: boolean;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
  inputLabel?: string;
  requiredInputValue?: string;
  showCancel?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  dot?: string;
  style?: React.CSSProperties;
}

// ──────────────────────────────────────────────
// Static style constants
// ──────────────────────────────────────────────

const CONTENT_CENTER: React.CSSProperties = {
  textAlign: "center",
};

const ICON_WRAP_BASE: React.CSSProperties = {
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "64px",
  width: "64px",
  borderRadius: "9999px",
  ...resolveDot("mb-6"),
};

const TITLE_STYLE: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "var(--color-foreground)",
  margin: 0,
  ...resolveDot("mb-4"),
};

const MESSAGE_WRAP: React.CSSProperties = {
  ...resolveDot("mb-6"),
};

const MESSAGE_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-muted-foreground)",
  margin: 0,
};

const WARNING_BASE: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  margin: 0,
  ...resolveDot("mt-3"),
};

const INPUT_WRAP: React.CSSProperties = {
  ...resolveDot("mb-6"),
};

const INPUT_LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-foreground)",
  ...resolveDot("mb-3"),
  textAlign: "left",
};

const INPUT_BASE_STYLE: React.CSSProperties = {
  width: "100%",
  ...resolveDot("px-4 py-3"),
  border: "1px solid var(--color-input)",
  borderRadius: "8px",
  outline: "none",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  transition: "border-color 200ms, box-shadow 200ms",
  boxSizing: "border-box",
};

const INPUT_FOCUS_STYLE: React.CSSProperties = {
  borderColor: "transparent",
  boxShadow: "0 0 0 1px var(--color-destructive)",
};

const BUTTON_ROW: React.CSSProperties = {
  display: "flex",
  ...resolveDot("gap-3"),
  justifyContent: "center",
};

const LOADING_WRAP: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const SPINNER_STYLE: React.CSSProperties = {
  animation: "spin 1s linear infinite",
  marginLeft: "-4px",
  ...resolveDot("mr-2 w-4 h-4"),
  color: "white",
};

// ──────────────────────────────────────────────
// Variant-specific color tokens
// ──────────────────────────────────────────────

type TypeConfig = {
  iconBg: React.CSSProperties;
  iconColor: React.CSSProperties;
  warningColor: React.CSSProperties;
  buttonStyle: React.CSSProperties;
};

const TYPE_CONFIG: Record<string, TypeConfig> = {
  danger: {
    iconBg: {
      backgroundColor:
        "color-mix(in srgb, var(--color-destructive) 10%, transparent)",
    },
    iconColor: { color: "var(--color-destructive)" },
    warningColor: { color: "var(--color-destructive)" },
    buttonStyle: {
      backgroundColor: "var(--color-destructive)",
      color: "var(--color-destructive-foreground)",
    },
  },
  warning: {
    iconBg: { backgroundColor: "color-mix(in srgb, #ca8a04 10%, transparent)" },
    iconColor: { color: "#ca8a04" },
    warningColor: { color: "#ca8a04" },
    buttonStyle: { backgroundColor: "#ca8a04", color: "#ffffff" },
  },
  info: {
    iconBg: {
      backgroundColor:
        "color-mix(in srgb, var(--color-primary) 10%, transparent)",
    },
    iconColor: { color: "var(--color-primary)" },
    warningColor: { color: "var(--color-primary)" },
    buttonStyle: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-primary-foreground)",
    },
  },
  success: {
    iconBg: { backgroundColor: "color-mix(in srgb, #16a34a 10%, transparent)" },
    iconColor: { color: "#16a34a" },
    warningColor: { color: "#16a34a" },
    buttonStyle: { backgroundColor: "#16a34a", color: "#ffffff" },
  },
  error: {
    iconBg: {
      backgroundColor:
        "color-mix(in srgb, var(--color-destructive) 10%, transparent)",
    },
    iconColor: { color: "var(--color-destructive)" },
    warningColor: { color: "var(--color-destructive)" },
    buttonStyle: {
      backgroundColor: "var(--color-destructive)",
      color: "var(--color-destructive-foreground)",
    },
  },
};

// ──────────────────────────────────────────────
// SVG icons as inline-styled elements
// ──────────────────────────────────────────────

const ICON_SVG_SIZE: React.CSSProperties = { height: "24px", width: "24px" };

function WarningIcon({ iconColor }: { iconColor: React.CSSProperties }) {
  return (
    <svg
      style={mergeStyles(ICON_SVG_SIZE, iconColor)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );
}

function InfoIcon({ iconColor }: { iconColor: React.CSSProperties }) {
  return (
    <svg
      style={mergeStyles(ICON_SVG_SIZE, iconColor)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
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

function CheckIcon({ iconColor }: { iconColor: React.CSSProperties }) {
  return (
    <svg
      style={mergeStyles(ICON_SVG_SIZE, iconColor)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function CrossIcon({ iconColor }: { iconColor: React.CSSProperties }) {
  return (
    <svg
      style={mergeStyles(ICON_SVG_SIZE, iconColor)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────
// Input field with focus state
// ──────────────────────────────────────────────

function ConfirmInput({
  id,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = useMemo(
    () =>
      mergeStyles(INPUT_BASE_STYLE, isFocused ? INPUT_FOCUS_STYLE : undefined),
    [isFocused],
  );

  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}

// ──────────────────────────────────────────────
// ConfirmButton — variant-colored confirm button
// ──────────────────────────────────────────────

function ConfirmButton({
  onClick,
  disabled,
  buttonStyle,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  buttonStyle: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="default"
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {children}
    </Button>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

/**
 * ConfirmModal 컴포넌트 / ConfirmModal component
 *
 * 확인/취소가 필요한 모달 컴포넌트입니다.
 * 다양한 타입(danger, warning, info, success, error)을 지원하며,
 * 입력 필드와 필수 입력 값 검증을 지원합니다.
 *
 * Modal component that requires confirmation/cancellation.
 * Supports various types (danger, warning, info, success, error),
 * and supports input fields and required input value validation.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleConfirm}
 *   title="삭제 확인"
 *   message="정말 삭제하시겠습니까?"
 * />
 *
 * @example
 * // 입력 필드와 함께 / With input field
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="삭제 확인"
 *   message="삭제하려면 'DELETE'를 입력하세요"
 *   showInput
 *   inputLabel="확인 입력"
 *   requiredInputValue="DELETE"
 *   inputValue={inputValue}
 *   onInputChange={setInputValue}
 * />
 *
 * @param {ConfirmModalProps} props - ConfirmModal 컴포넌트의 props / ConfirmModal component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ConfirmModal 컴포넌트 / ConfirmModal component
 */
const ConfirmModal = React.forwardRef<HTMLDivElement, ConfirmModalProps>(
  (
    {
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      warning,
      confirmText = "확인",
      cancelText = "취소",
      confirmButtonText,
      type = "danger",
      loading = false,
      disabled = false,
      showInput = false,
      inputValue = "",
      onInputChange,
      inputPlaceholder,
      inputLabel,
      requiredInputValue,
      showCancel = true,
      size = "md",
      dot: dotProp,
      style,
    },
    _ref,
  ) => {
    const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.danger;
    const isInputValid =
      !showInput || !requiredInputValue || inputValue === requiredInputValue;
    const isDisabled = disabled || loading || !isInputValid;

    const containerStyle = useMemo(
      () => mergeStyles(CONTENT_CENTER, resolveDot(dotProp), style),
      [dotProp, style],
    );

    const iconWrapStyle = useMemo(
      () => mergeStyles(ICON_WRAP_BASE, config.iconBg),
      [config.iconBg],
    );

    const warningStyle = useMemo(
      () => mergeStyles(WARNING_BASE, config.warningColor),
      [config.warningColor],
    );

    // Render the type-appropriate icon
    const icon = (() => {
      switch (type) {
        case "warning":
          return <WarningIcon iconColor={config.iconColor} />;
        case "info":
          return <InfoIcon iconColor={config.iconColor} />;
        case "success":
          return <CheckIcon iconColor={config.iconColor} />;
        case "error":
          return <CrossIcon iconColor={config.iconColor} />;
        case "danger":
        default:
          return <WarningIcon iconColor={config.iconColor} />;
      }
    })();

    return (
      <Modal isOpen={isOpen} onClose={onClose} closable={false} size={size}>
        <div style={containerStyle}>
          {/* Icon */}
          <div style={iconWrapStyle}>{icon}</div>

          {/* Title */}
          <h3 style={TITLE_STYLE}>{title}</h3>

          {/* Message */}
          <div style={MESSAGE_WRAP}>
            <p style={MESSAGE_STYLE}>{message}</p>

            {/* Warning message */}
            {warning && <p style={warningStyle}>{warning}</p>}
          </div>

          {/* Input field */}
          {showInput && (
            <div style={INPUT_WRAP}>
              <label htmlFor="confirmInput" style={INPUT_LABEL_STYLE}>
                {inputLabel}
              </label>
              <ConfirmInput
                id="confirmInput"
                value={inputValue}
                placeholder={inputPlaceholder}
                onChange={onInputChange ?? (() => {})}
              />
            </div>
          )}

          {/* Buttons */}
          <div style={BUTTON_ROW}>
            {showCancel && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                style={resolveDot("px-6 py-3")}
              >
                {cancelText}
              </Button>
            )}
            <ConfirmButton
              onClick={onConfirm}
              disabled={isDisabled}
              buttonStyle={mergeStyles(
                resolveDot("px-6 py-3"),
                config.buttonStyle,
              )}
            >
              {loading ? (
                <div style={LOADING_WRAP}>
                  <svg
                    style={SPINNER_STYLE}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  처리 중...
                </div>
              ) : (
                confirmButtonText || confirmText
              )}
            </ConfirmButton>
          </div>
        </div>
      </Modal>
    );
  },
);
ConfirmModal.displayName = "ConfirmModal";

export { ConfirmModal };
