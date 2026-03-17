"use client";

import React, { useState, useCallback, useMemo } from "react";
import { highlight } from "sugar-high";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

/**
 * CodeBlock 컴포넌트 Props
 */
export interface CodeBlockProps {
  /** 표시할 코드 */
  code: string;
  /** 프로그래밍 언어 (표시용) */
  language?: string;
  /** 파일명 (헤더에 표시) */
  filename?: string;
  /** 줄 번호 표시 여부 */
  showLineNumbers?: boolean;
  /** 복사 버튼 표시 여부 */
  showCopyButton?: boolean;
  /** 복사 성공 시 콜백 */
  onCopy?: () => void;
  /** 복사 성공 메시지 */
  copySuccessMessage?: string;
  /** dot 유틸리티 스타일 */
  dot?: string;
  /** 추가 인라인 스타일 */
  style?: React.CSSProperties;
  /** 최대 높이 (스크롤) */
  maxHeight?: string | number;
  /** 테마 (기본: dark) */
  theme?: "dark" | "light";
}

/**
 * CodeBlock 컴포넌트
 *
 * 코드를 표시하고 복사 기능을 제공하는 컴포넌트입니다.
 * Sugar-high를 사용한 신택스 하이라이팅을 지원합니다.
 *
 * @remarks
 * 신택스 하이라이팅을 위해 CSS 파일을 import하세요:
 * ```tsx
 * import '@hua-labs/ui/styles/codeblock.css';
 * ```
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <CodeBlock code="console.log('Hello')" language="javascript" />
 *
 * // 파일명 표시
 * <CodeBlock
 *   code={configCode}
 *   language="typescript"
 *   filename="hua.config.ts"
 * />
 *
 * // Toast와 함께 사용
 * const { addToast } = useToast()
 * <CodeBlock
 *   code={code}
 *   onCopy={() => addToast({ type: 'success', message: 'Copied!' })}
 * />
 * ```
 */
export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  showCopyButton = true,
  onCopy,
  copySuccessMessage: _copySuccessMessage = "Copied!",
  dot: dotProp,
  style,
  maxHeight,
  theme = "dark",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();

      // 2초 후 복사 상태 리셋
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [code, onCopy]);

  const lines = code.split("\n");

  // 신택스 하이라이팅
  const highlightedLines = useMemo(() => {
    return lines.map((line) => highlight(line) || "&nbsp;");
  }, [lines]);

  const highlightedCode = useMemo(() => highlight(code), [code]);

  const isDark = theme === "dark";

  const outerStyle: React.CSSProperties = isDark
    ? {
        backgroundColor: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: "0.5rem",
        overflow: "hidden",
        position: "relative",
      }
    : {
        backgroundColor:
          "color-mix(in srgb, var(--color-muted) 50%, transparent)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.5rem",
        overflow: "hidden",
        position: "relative",
      };

  const headerStyle: React.CSSProperties = isDark
    ? {
        backgroundColor: "#161b22",
        borderBottom: "1px solid #30363d",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.625rem 1rem",
      }
    : {
        backgroundColor:
          "color-mix(in srgb, var(--color-muted) 30%, transparent)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.625rem 1rem",
      };

  const preStyle: React.CSSProperties = isDark
    ? {
        padding: "1rem",
        fontSize: "0.875rem",
        lineHeight: "1.75",
        overflowX: "auto",
        color: "#c9d1d9",
      }
    : {
        padding: "1rem",
        fontSize: "0.875rem",
        lineHeight: "1.75",
        overflowX: "auto",
        color: "var(--color-foreground)",
      };

  const filenameLabelStyle: React.CSSProperties = isDark
    ? { fontSize: "0.875rem", fontWeight: 500, color: "#c9d1d9" }
    : {
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--color-foreground)",
      };

  const languageLabelStyle: React.CSSProperties = isDark
    ? {
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "#8b949e",
      }
    : {
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--color-muted-foreground)",
      };

  const lineNumberStyle: React.CSSProperties = isDark
    ? {
        userSelect: "none",
        ...resolveDot("w-8 mr-4"),
        textAlign: "right",
        flexShrink: 0,
        color: "#484f58",
      }
    : {
        userSelect: "none",
        ...resolveDot("w-8 mr-4"),
        textAlign: "right",
        flexShrink: 0,
        color: "var(--color-muted-foreground)",
      };

  return (
    <div style={mergeStyles(outerStyle, resolveDot(dotProp), style)}>
      {/* 헤더 - 항상 표시 */}
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            ...resolveDot("gap-3"),
          }}
        >
          {/* Traffic lights (macOS 스타일) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              ...resolveDot("gap-1.5"),
            }}
          >
            <span
              style={{
                width: "0.75rem",
                height: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: "#ff5f56",
                display: "block",
              }}
            />
            <span
              style={{
                width: "0.75rem",
                height: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: "#ffbd2e",
                display: "block",
              }}
            />
            <span
              style={{
                width: "0.75rem",
                height: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: "#27c93f",
                display: "block",
              }}
            />
          </div>
          {filename && <span style={filenameLabelStyle}>{filename}</span>}
          {language && !filename && (
            <span style={languageLabelStyle}>{language}</span>
          )}
          {language && filename && (
            <span
              style={
                isDark
                  ? { fontSize: "0.75rem", color: "#8b949e" }
                  : {
                      fontSize: "0.75rem",
                      color: "var(--color-muted-foreground)",
                    }
              }
            >
              {language}
            </span>
          )}
        </div>
        {showCopyButton && (
          <CopyButton copied={copied} onClick={handleCopy} theme={theme} />
        )}
      </div>

      {/* 코드 영역 */}
      <div style={{ overflow: "auto", maxHeight: maxHeight }}>
        <pre style={preStyle}>
          {showLineNumbers ? (
            <code style={{ display: "block", fontFamily: "monospace" }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: "flex" }}>
                  <span style={lineNumberStyle}>{i + 1}</span>
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightedLines[i] }}
                  />
                </div>
              ))}
            </code>
          ) : (
            <code
              style={{ fontFamily: "monospace", whiteSpace: "pre" }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </pre>
      </div>
    </div>
  );
}

/**
 * 복사 버튼 컴포넌트 (아이콘만)
 */
function CopyButton({
  copied,
  onClick,
  theme = "dark",
}: {
  copied: boolean;
  onClick: () => void;
  theme?: "dark" | "light";
}) {
  const isDark = theme === "dark";

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ...resolveDot("w-8 h-8 rounded-md"),
    transition: "all 200ms",
    border: "none",
    cursor: "pointer",
  };

  const colorStyle: React.CSSProperties = copied
    ? isDark
      ? { backgroundColor: "rgba(34,197,94,0.2)", color: "#86efac" }
      : { backgroundColor: "#dcfce7", color: "#15803d" }
    : isDark
      ? { backgroundColor: "transparent", color: "#8b949e" }
      : {
          backgroundColor: "transparent",
          color: "var(--color-muted-foreground)",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      style={mergeStyles(baseStyle, colorStyle)}
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <CheckIcon style={{ width: "1rem", height: "1rem" }} />
      ) : (
        <CopyIcon style={{ width: "1rem", height: "1rem" }} />
      )}
    </button>
  );
}

/**
 * 복사 아이콘
 */
function CopyIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/**
 * 체크 아이콘
 */
function CheckIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * 인라인 코드 컴포넌트
 *
 * 텍스트 내 인라인 코드 표시용
 *
 * @example
 * ```tsx
 * <p>Use the <InlineCode>npm install</InlineCode> command.</p>
 * ```
 */
export function InlineCode({
  children,
  dot: dotProp,
  style,
}: {
  children: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}) {
  return (
    <code
      style={mergeStyles(
        {
          ...resolveDot("py-0.5 px-1.5 rounded-md"),
          backgroundColor: "var(--color-muted)",
          fontSize: "0.875rem",
          fontFamily: "monospace",
          color: "var(--color-foreground)",
        },
        resolveDot(dotProp),
        style,
      )}
    >
      {children}
    </code>
  );
}
