"use client"

import React, { useState, useCallback, useMemo } from "react"
import { highlight } from "sugar-high"
import { merge } from "../lib/utils"

/**
 * CodeBlock 컴포넌트 Props
 */
export interface CodeBlockProps {
  /** 표시할 코드 */
  code: string
  /** 프로그래밍 언어 (표시용) */
  language?: string
  /** 파일명 (헤더에 표시) */
  filename?: string
  /** 줄 번호 표시 여부 */
  showLineNumbers?: boolean
  /** 복사 버튼 표시 여부 */
  showCopyButton?: boolean
  /** 복사 성공 시 콜백 */
  onCopy?: () => void
  /** 복사 성공 메시지 */
  copySuccessMessage?: string
  /** 추가 className */
  className?: string
  /** 최대 높이 (스크롤) */
  maxHeight?: string | number
  /** 테마 (기본: dark) */
  theme?: "dark" | "light"
}

/**
 * CodeBlock 컴포넌트
 *
 * 코드를 표시하고 복사 기능을 제공하는 컴포넌트입니다.
 * Sugar-high를 사용한 신택스 하이라이팅을 지원합니다.
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
 *   filename="hua-ux.config.ts"
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
  className,
  maxHeight,
  theme = "dark",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy?.()

      // 2초 후 복사 상태 리셋
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [code, onCopy])

  const lines = code.split("\n")

  // 신택스 하이라이팅
  const highlightedLines = useMemo(() => {
    return lines.map(line => highlight(line) || "&nbsp;")
  }, [lines])

  const highlightedCode = useMemo(() => highlight(code), [code])

  const isDark = theme === "dark"

  return (
    <div
      className={merge(
        "group relative rounded-lg overflow-hidden",
        isDark
          ? "bg-[#0d1117] border border-[#30363d]"
          : "bg-muted/50 border border-border",
        className
      )}
    >
      {/* 헤더 - 항상 표시 */}
      <div className={merge(
        "flex items-center justify-between px-4 py-2.5 border-b",
        isDark
          ? "bg-[#161b22] border-[#30363d]"
          : "bg-muted/30 border-border"
      )}>
        <div className="flex items-center gap-3">
          {/* Traffic lights (macOS 스타일) */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          {filename && (
            <span className={merge(
              "text-sm font-medium",
              isDark ? "text-[#c9d1d9]" : "text-foreground"
            )}>
              {filename}
            </span>
          )}
          {language && !filename && (
            <span className={merge(
              "text-xs uppercase tracking-wider",
              isDark ? "text-[#8b949e]" : "text-muted-foreground"
            )}>
              {language}
            </span>
          )}
          {language && filename && (
            <span className={merge(
              "text-xs",
              isDark ? "text-[#8b949e]" : "text-muted-foreground"
            )}>
              {language}
            </span>
          )}
        </div>
        {showCopyButton && (
          <CopyButton copied={copied} onClick={handleCopy} theme={theme} />
        )}
      </div>

      {/* 코드 영역 */}
      <div
        className="overflow-auto"
        style={{ maxHeight: maxHeight }}
      >
        <pre className={merge(
          "p-4 text-sm leading-7 overflow-x-auto",
          isDark ? "text-[#c9d1d9]" : "text-foreground"
        )}>
          {showLineNumbers ? (
            <code className="block font-mono">
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className={merge(
                    "select-none w-8 text-right mr-4 flex-shrink-0",
                    isDark ? "text-[#484f58]" : "text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightedLines[i] }}
                  />
                </div>
              ))}
            </code>
          ) : (
            <code
              className="font-mono whitespace-pre"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </pre>
      </div>

    </div>
  )
}

/**
 * 복사 버튼 컴포넌트 (아이콘만)
 */
function CopyButton({
  copied,
  onClick,
  theme = "dark"
}: {
  copied: boolean
  onClick: () => void
  theme?: "dark" | "light"
}) {
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={onClick}
      className={merge(
        "inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
        copied
          ? isDark
            ? "bg-green-500/20 text-green-400"
            : "bg-green-100 text-green-700"
          : isDark
            ? "bg-transparent hover:bg-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
            : "bg-transparent hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <CopyIcon className="w-4 h-4" />
      )}
    </button>
  )
}

/**
 * 복사 아이콘
 */
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

/**
 * 체크 아이콘
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
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
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <code
      className={merge(
        "px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono text-foreground",
        className
      )}
    >
      {children}
    </code>
  )
}
