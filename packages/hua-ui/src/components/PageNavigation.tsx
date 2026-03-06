"use client"

import React, { useState, useMemo } from "react"
import { dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import { Icon } from "./Icon"

// ─── Base style helpers ──────────────────────────────────────────────────────

const s = (input: string) => dotFn(input) as React.CSSProperties

const BASE_STYLES = s("flex items-center justify-between py-4")

const PREV_WRAPPER_STYLES = s("flex-1")

const NEXT_WRAPPER_STYLES: React.CSSProperties = {
  ...s("flex-1 flex"),
  justifyContent: "flex-end",
}

const LINK_BASE_STYLES: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.875rem",
  color: "var(--color-muted-foreground)",
  textDecoration: "none",
  transition: "color 200ms ease-in-out",
  cursor: "pointer",
}

const LINK_HOVER_STYLES: React.CSSProperties = {
  color: "var(--color-foreground)",
}

const PREV_ICON_STYLES: React.CSSProperties = {
  display: "inline-flex",
  width: "1rem",
  height: "1rem",
  marginRight: "0.5rem",
  transition: "transform 200ms ease-in-out",
}

const NEXT_ICON_STYLES: React.CSSProperties = {
  display: "inline-flex",
  width: "1rem",
  height: "1rem",
  transition: "transform 200ms ease-in-out",
}

const PREV_ICON_HOVER_STYLES: React.CSSProperties = {
  transform: "translateX(-4px)",
}

const NEXT_ICON_HOVER_STYLES: React.CSSProperties = {
  transform: "translateX(4px)",
}

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * PageNavigation 컴포넌트의 props / PageNavigation component props
 * @typedef {Object} PageNavigationProps
 * @property {Object} [prevPage] - 이전 페이지 정보 / Previous page information
 * @property {string} prevPage.title - 이전 페이지 제목 / Previous page title
 * @property {string} prevPage.href - 이전 페이지 링크 / Previous page link
 * @property {Object} [nextPage] - 다음 페이지 정보 / Next page information
 * @property {string} nextPage.title - 다음 페이지 제목 / Next page title
 * @property {string} nextPage.href - 다음 페이지 링크 / Next page link
 * @property {boolean} [showOnMobile=false] - 모바일에서 표시 여부 / Show on mobile
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface PageNavigationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  prevPage?: {
    title: string
    href: string
  }
  nextPage?: {
    title: string
    href: string
  }
  showOnMobile?: boolean
  dot?: string
  style?: React.CSSProperties
}

// ─── NavLink sub-component ───────────────────────────────────────────────────

interface NavLinkProps {
  href: string
  direction: "prev" | "next"
  title: string
}

const NavLink = React.memo(function NavLink({ href, direction, title }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false)

  const linkStyle = useMemo(
    () => mergeStyles(LINK_BASE_STYLES, isHovered ? LINK_HOVER_STYLES : undefined),
    [isHovered]
  )

  const prevIconStyle = useMemo(
    () => mergeStyles(PREV_ICON_STYLES, isHovered ? PREV_ICON_HOVER_STYLES : undefined),
    [isHovered]
  )

  const nextIconStyle = useMemo(
    () => mergeStyles(NEXT_ICON_STYLES, isHovered ? NEXT_ICON_HOVER_STYLES : undefined),
    [isHovered]
  )

  return (
    <a
      href={href}
      style={linkStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {direction === "prev" && (
        <span style={prevIconStyle} aria-hidden="true">
          <Icon name="chevronLeft" size={16} />
        </span>
      )}
      <span>{title}</span>
      {direction === "next" && (
        <span style={nextIconStyle} aria-hidden="true">
          <Icon name="chevronRight" size={16} />
        </span>
      )}
    </a>
  )
})

// ─── PageNavigation ──────────────────────────────────────────────────────────

/**
 * PageNavigation 컴포넌트 / PageNavigation component
 *
 * 이전/다음 페이지로 이동하는 네비게이션 컴포넌트입니다.
 * 문서 페이지나 가이드 페이지에서 사용하기 적합합니다.
 *
 * Navigation component for moving to previous/next pages.
 * Suitable for documentation or guide pages.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <PageNavigation
 *   prevPage={{ title: "이전 페이지", href: "/prev" }}
 *   nextPage={{ title: "다음 페이지", href: "/next" }}
 * />
 *
 * @param {PageNavigationProps} props - PageNavigation 컴포넌트의 props / PageNavigation component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element | null} PageNavigation 컴포넌트 / PageNavigation component
 */
const PageNavigation = React.forwardRef<HTMLDivElement, PageNavigationProps>(
  (
    {
      prevPage,
      nextPage,
      showOnMobile = false,
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          BASE_STYLES,
          !showOnMobile ? { display: "none" } : undefined,
          resolveDot(dotProp),
          style
        ),
      [showOnMobile, dotProp, style]
    )

    if (!prevPage && !nextPage) {
      return null
    }

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      >
        {/* 이전 페이지 */}
        <div style={PREV_WRAPPER_STYLES}>
          {prevPage && (
            <NavLink
              href={prevPage.href}
              direction="prev"
              title={prevPage.title}
            />
          )}
        </div>

        {/* 다음 페이지 */}
        <div style={NEXT_WRAPPER_STYLES}>
          {nextPage && (
            <NavLink
              href={nextPage.href}
              direction="next"
              title={nextPage.title}
            />
          )}
        </div>
      </div>
    )
  }
)
PageNavigation.displayName = "PageNavigation"

export { PageNavigation }
