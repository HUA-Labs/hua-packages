"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ─── Style constants ────────────────────────────────────────────────────────

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { height: 40, width: 40 },
  md: { height: 48, width: 48 },
  lg: { height: 56, width: 56 },
};

const BASE_BUTTON: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  background: "none",
  cursor: "pointer",
  transition: "background-color 200ms ease-in-out",
  outline: "none",
  padding: 0,
  ...resolveDot("rounded-lg"),
};

const BASE_LABELED_BUTTON: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  transition: "background-color 200ms ease-in-out",
  outline: "none",
  ...resolveDot("rounded-lg gap-3 pt-3 pb-3 pl-4 pr-4"),
};

const HOVER_BG: React.CSSProperties = {
  backgroundColor: "var(--color-muted)",
};

const FOCUS_RING: React.CSSProperties = {
  boxShadow: "0 0 0 1px var(--color-ring), 0 0 0 3px var(--color-ring)",
};

const DROPDOWN_CONTAINER: React.CSSProperties = {
  position: "relative",
};

const DROPDOWN_MENU: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  right: 0,
  width: 192,
  backgroundColor: "var(--color-background)",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  border: "1px solid var(--color-border)",
  zIndex: 50,
  ...resolveDot("rounded-lg mt-2 pt-2 pb-2"),
};

const DROPDOWN_ITEM_BASE: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  border: "none",
  background: "none",
  cursor: "pointer",
  transition: "background-color 200ms ease-in-out",
  ...resolveDot("pt-3 pb-3 pl-4 pr-4 gap-3"),
};

const DROPDOWN_ITEM_ACTIVE: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  color: "var(--color-primary)",
};

const FLAG_TEXT: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
};

const LABEL_TEXT: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "var(--color-foreground)",
};

const CHEVRON_BASE: React.CSSProperties = {
  width: 16,
  height: 16,
  transition: "transform 200ms ease-in-out",
  flexShrink: 0,
};

// ─── DropdownItem — extracted to avoid per-loop useState ────────────────────

interface DropdownItemProps {
  language: { code: string; name: string; flag?: string };
  isActive: boolean;
  onSelect: (code: string) => void;
}

function DropdownItem({ language, isActive, onSelect }: DropdownItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle = useMemo(
    () =>
      mergeStyles(
        DROPDOWN_ITEM_BASE,
        isActive ? DROPDOWN_ITEM_ACTIVE : undefined,
        isHovered && !isActive ? HOVER_BG : undefined,
      ),
    [isActive, isHovered],
  );

  return (
    <button
      style={itemStyle}
      onClick={() => onSelect(language.code)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={FLAG_TEXT}>{language.flag}</span>
      <span style={LABEL_TEXT}>{language.name}</span>
    </button>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

/**
 * LanguageToggle 컴포넌트의 props / LanguageToggle component props
 * @typedef {Object} LanguageToggleProps
 * @property {"sm" | "md" | "lg"} [size="md"] - Toggle 크기 / Toggle size
 * @property {"button" | "icon" | "dropdown"} [variant="button"] - Toggle 스타일 변형 / Toggle style variant
 * @property {boolean} [showLabel=false] - 라벨 표시 여부 / Show label
 * @property {Array<Object>} [languages] - 언어 목록 / Language list
 * @property {string} languages[].code - 언어 코드 / Language code
 * @property {string} languages[].name - 언어 이름 / Language name
 * @property {string} [languages[].flag] - 언어 플래그 이모지 / Language flag emoji
 * @property {string} [currentLanguage="ko"] - 현재 선택된 언어 코드 / Currently selected language code
 * @property {(language: string) => void} [onLanguageChange] - 언어 변경 콜백 / Language change callback
 * @property {string} [dot] - dot 유틸리티 스타일 문자열 / dot utility style string
 * @property {React.CSSProperties} [style] - 추가 인라인 스타일 / Additional inline style
 */
export interface LanguageToggleProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon" | "dropdown";
  showLabel?: boolean;
  languages?: Array<{
    code: string;
    name: string;
    flag?: string;
  }>;
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  dot?: string;
  style?: React.CSSProperties;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * LanguageToggle 컴포넌트 / LanguageToggle component
 *
 * 언어를 전환하는 토글 컴포넌트입니다.
 * 여러 언어를 지원하며, 버튼, 아이콘, 드롭다운 형태로 표시할 수 있습니다.
 *
 * Toggle component for switching languages.
 * Supports multiple languages and can be displayed as button, icon, or dropdown.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <LanguageToggle />
 *
 * @example
 * // 드롭다운 형태 / Dropdown variant
 * <LanguageToggle
 *   variant="dropdown"
 *   currentLanguage="en"
 *   onLanguageChange={(lang) => console.log(lang)}
 * />
 *
 * @param {LanguageToggleProps} props - LanguageToggle 컴포넌트의 props / LanguageToggle component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} LanguageToggle 컴포넌트 / LanguageToggle component
 */
const LanguageToggle = React.forwardRef<HTMLDivElement, LanguageToggleProps>(
  (
    {
      dot: dotProp,
      style,
      size = "md",
      variant = "button",
      showLabel = false,
      languages = [
        { code: "ko", name: "한국어", flag: "🇰🇷" },
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "ja", name: "日本語", flag: "🇯🇵" },
        { code: "zh", name: "中文", flag: "🇨🇳" },
      ],
      currentLanguage = "ko",
      onLanguageChange,
      ...props
    },
    _ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isButtonFocused, setIsButtonFocused] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const currentLang =
      languages.find((lang) => lang.code === currentLanguage) || languages[0];

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleLanguageChange = (languageCode: string) => {
      onLanguageChange?.(languageCode);
      setIsOpen(false);
    };

    // icon-button shared style (square, centered)
    const iconButtonStyle = useMemo(
      () =>
        mergeStyles(
          BASE_BUTTON,
          SIZE_STYLES[size],
          isButtonHovered ? HOVER_BG : undefined,
          isButtonFocused ? FOCUS_RING : undefined,
          resolveDot(dotProp),
          style,
        ),
      [size, isButtonHovered, isButtonFocused, dotProp, style],
    );

    // labeled-button shared style (gap, padding)
    const labeledButtonStyle = useMemo(
      () =>
        mergeStyles(
          BASE_LABELED_BUTTON,
          isButtonHovered ? HOVER_BG : undefined,
          isButtonFocused ? FOCUS_RING : undefined,
          resolveDot(dotProp),
          style,
        ),
      [isButtonHovered, isButtonFocused, dotProp, style],
    );

    const buttonHandlers = {
      onMouseEnter: () => setIsButtonHovered(true),
      onMouseLeave: () => setIsButtonHovered(false),
      onFocus: () => setIsButtonFocused(true),
      onBlur: () => setIsButtonFocused(false),
    };

    // ── icon variant ─────────────────────────────────────────────────────────
    if (variant === "icon") {
      return (
        <div ref={dropdownRef} style={DROPDOWN_CONTAINER} {...props}>
          <button
            style={iconButtonStyle}
            onClick={() => setIsOpen(!isOpen)}
            {...buttonHandlers}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={FLAG_TEXT}>{currentLang.flag}</span>
            </div>
          </button>

          {isOpen && (
            <div style={DROPDOWN_MENU}>
              {languages.map((language) => (
                <DropdownItem
                  key={language.code}
                  language={language}
                  isActive={currentLanguage === language.code}
                  onSelect={handleLanguageChange}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── dropdown variant ─────────────────────────────────────────────────────
    if (variant === "dropdown") {
      return (
        <div ref={dropdownRef} style={DROPDOWN_CONTAINER} {...props}>
          <button
            style={labeledButtonStyle}
            onClick={() => setIsOpen(!isOpen)}
            {...buttonHandlers}
          >
            <span style={FLAG_TEXT}>{currentLang.flag}</span>
            {showLabel && (
              <span style={{ color: "var(--color-foreground)" }}>
                {currentLang.name}
              </span>
            )}
            <svg
              style={{
                ...CHEVRON_BASE,
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div style={DROPDOWN_MENU}>
              {languages.map((language) => (
                <DropdownItem
                  key={language.code}
                  language={language}
                  isActive={currentLanguage === language.code}
                  onSelect={handleLanguageChange}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── default button variant ────────────────────────────────────────────────
    return (
      <button
        style={labeledButtonStyle}
        onClick={() => {
          const currentIndex = languages.findIndex(
            (lang) => lang.code === currentLanguage,
          );
          const nextIndex = (currentIndex + 1) % languages.length;
          onLanguageChange?.(languages[nextIndex].code);
        }}
        {...buttonHandlers}
        {...props}
      >
        <span style={FLAG_TEXT}>{currentLang.flag}</span>
        {showLabel && (
          <span style={{ color: "var(--color-foreground)" }}>
            {currentLang.name}
          </span>
        )}
      </button>
    );
  },
);
LanguageToggle.displayName = "LanguageToggle";

export { LanguageToggle };
