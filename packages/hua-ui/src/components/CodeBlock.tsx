"use client"

import React, { useState, useCallback } from "react"
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
}

/**
 * CodeBlock 컴포넌트
 *
 * 코드를 표시하고 복사 기능을 제공하는 컴포넌트입니다.
 * useToast와 함께 사용하면 복사 시 토스트 알림을 표시합니다.
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
  const hasHeader = filename || language

  return (
    <div
      className={merge(
        "relative rounded-lg border border-border bg-muted/50 overflow-hidden",
        className
      )}
    >
      {/* 헤더 (파일명 or 언어) */}
      {hasHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-sm font-medium text-foreground">
                {filename}
              </span>
            )}
            {language && !filename && (
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {language}
              </span>
            )}
            {language && filename && (
              <span className="text-xs text-muted-foreground">
                {language}
              </span>
            )}
          </div>
          {showCopyButton && (
            <CopyButton copied={copied} onClick={handleCopy} />
          )}
        </div>
      )}

      {/* 코드 영역 */}
      <div
        className="overflow-auto"
        style={{ maxHeight: maxHeight }}
      >
        <pre className="p-4 text-sm font-mono overflow-x-auto">
          {showLineNumbers ? (
            <code className="block">
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="select-none text-muted-foreground w-8 text-right mr-4 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{line || " "}</span>
                </div>
              ))}
            </code>
          ) : (
            <code className="text-foreground whitespace-pre">{code}</code>
          )}
        </pre>
      </div>

      {/* 헤더 없을 때 복사 버튼 (우상단 플로팅) */}
      {!hasHeader && showCopyButton && (
        <div className="absolute top-2 right-2">
          <CopyButton copied={copied} onClick={handleCopy} />
        </div>
      )}
    </div>
  )
}

/**
 * 복사 버튼 컴포넌트
 */
function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={merge(
        "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
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
