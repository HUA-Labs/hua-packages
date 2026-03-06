"use client"

import React, { useState, useMemo } from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import { useWindowSize } from "../hooks/useWindowSize"
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb"

/**
 * ComponentLayout 컴포넌트의 props / ComponentLayout component props
 * @typedef {Object} ComponentLayoutProps
 * @property {string} title - 페이지 제목 / Page title
 * @property {string} description - 페이지 설명 / Page description
 * @property {React.ReactNode} children - 페이지 내용 / Page content
 * @property {Object} [prevPage] - 이전 페이지 정보 / Previous page information
 * @property {string} prevPage.title - 이전 페이지 제목 / Previous page title
 * @property {string} prevPage.href - 이전 페이지 링크 / Previous page link
 * @property {Object} [nextPage] - 다음 페이지 정보 / Next page information
 * @property {string} nextPage.title - 다음 페이지 제목 / Next page title
 * @property {string} nextPage.href - 다음 페이지 링크 / Next page link
 * @property {Array<Object>} [breadcrumbItems] - Breadcrumb 항목들 / Breadcrumb items
 * @property {string} breadcrumbItems[].label - Breadcrumb 라벨 / Breadcrumb label
 * @property {string} [breadcrumbItems[].href] - Breadcrumb 링크 / Breadcrumb link
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline styles
 */
export interface ComponentLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  title: string
  description: string
  children: React.ReactNode
  prevPage?: {
    title: string
    href: string
  }
  nextPage?: {
    title: string
    href: string
  }
  breadcrumbItems?: Array<{
    label: string
    href?: string
  }>
  dot?: string
  style?: React.CSSProperties
}

// ── Static styles (never change) ────────────────────────────

const S_OUTER: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
}

const S_NAV_TOP_LG: React.CSSProperties = {
  position: 'fixed',
  right: '1rem',
  top: '1rem',
  zIndex: 50,
  display: 'block',
}

const S_NAV_BOTTOM: React.CSSProperties = {
  position: 'fixed',
  right: '1rem',
  bottom: '1rem',
  zIndex: 50,
  display: 'block',
}

const S_FLEX_COL: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const S_NAV_LINK_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem',
  backgroundColor: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: '1px solid var(--color-border)',
  borderRadius: '9999px',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  transition: 'all 200ms ease-in-out',
  cursor: 'pointer',
  textDecoration: 'none',
}

const S_NAV_LINK_HOVER: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.9)',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
}

const S_NAV_LINK_ACTIVE: React.CSSProperties = {
  transform: 'scale(0.95)',
}

const S_SVG_BASE: React.CSSProperties = {
  width: '1.25rem',
  height: '1.25rem',
  color: 'var(--color-muted-foreground)',
  transition: 'color 200ms ease-in-out',
}

const S_SVG_HOVER: React.CSSProperties = {
  color: '#4f46e5',
}

const S_MAIN: React.CSSProperties = {
  width: '100%',
  maxWidth: '80rem',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
  paddingTop: '2rem',
  paddingBottom: '2rem',
}

const S_INNER: React.CSSProperties = {
  maxWidth: '56rem',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const S_BREADCRUMB_MARGIN: React.CSSProperties = {
  marginBottom: '1.5rem',
}

const S_HEADER: React.CSSProperties = {
  marginBottom: '2rem',
}

const S_H1: React.CSSProperties = {
  fontSize: '2.25rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: '1rem',
}

const S_DESCRIPTION: React.CSSProperties = {
  fontSize: '1.125rem',
  color: 'var(--color-muted-foreground)',
}

const S_CONTENT: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
}

const S_MOBILE_NAV: React.CSSProperties = {
  marginTop: '3rem',
}

const S_MOBILE_NAV_INNER: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '1rem',
  paddingBottom: '1rem',
  borderTop: '1px solid var(--color-border)',
}

const S_MOBILE_LINK_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.875rem',
  color: 'var(--color-muted-foreground)',
  transition: 'color 200ms ease-in-out',
  textDecoration: 'none',
}

const S_MOBILE_LINK_HOVER: React.CSSProperties = {
  color: 'var(--color-foreground)',
}

const S_SMALL_SVG: React.CSSProperties = {
  width: '1rem',
  height: '1rem',
}

// ── NavButton sub-component ─────────────────────────────────

interface NavButtonProps {
  href: string
  title: string
  arrowUp?: boolean
}

const NavButton: React.FC<NavButtonProps> = ({ href, title, arrowUp }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const linkStyle = useMemo(() => mergeStyles(
    S_NAV_LINK_BASE,
    isHovered ? S_NAV_LINK_HOVER : undefined,
    isActive ? S_NAV_LINK_ACTIVE : undefined,
  ), [isHovered, isActive])

  const svgStyle = useMemo(() => mergeStyles(
    S_SVG_BASE,
    isHovered ? S_SVG_HOVER : undefined,
  ), [isHovered])

  return (
    <a
      href={href}
      style={linkStyle}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false) }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      <svg
        style={svgStyle}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {arrowUp
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        }
      </svg>
    </a>
  )
}

// ── MobileNavLink sub-component ─────────────────────────────

interface MobileNavLinkProps {
  href: string
  label: string
  arrowLeft?: boolean
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, label, arrowLeft }) => {
  const [isHovered, setIsHovered] = useState(false)

  const linkStyle = useMemo(() => mergeStyles(
    S_MOBILE_LINK_BASE,
    isHovered ? S_MOBILE_LINK_HOVER : undefined,
  ), [isHovered])

  return (
    <a
      href={href}
      style={linkStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {arrowLeft && (
        <svg style={{ ...S_SMALL_SVG, marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
      {label}
      {!arrowLeft && (
        <svg style={{ ...S_SMALL_SVG, marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </a>
  )
}

// ── ComponentLayout ─────────────────────────────────────────

/**
 * ComponentLayout 컴포넌트 / ComponentLayout component
 *
 * 컴포넌트 문서 페이지 레이아웃을 제공하는 컴포넌트입니다.
 * 제목, 설명, Breadcrumb, 이전/다음 페이지 네비게이션을 포함합니다.
 *
 * Component that provides layout for component documentation pages.
 * Includes title, description, Breadcrumb, and previous/next page navigation.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ComponentLayout
 *   title="Button 컴포넌트"
 *   description="버튼 컴포넌트 사용법"
 * >
 *   <Button>예제</Button>
 * </ComponentLayout>
 *
 * @example
 * // 이전/다음 페이지 네비게이션 포함 / With previous/next page navigation
 * <ComponentLayout
 *   title="Input 컴포넌트"
 *   description="입력 컴포넌트 사용법"
 *   prevPage={{ title: "Button", href: "/components/button" }}
 *   nextPage={{ title: "Select", href: "/components/select" }}
 * >
 *   <Input placeholder="입력하세요" />
 * </ComponentLayout>
 *
 * @param {ComponentLayoutProps} props - ComponentLayout 컴포넌트의 props / ComponentLayout component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ComponentLayout 컴포넌트 / ComponentLayout component
 */
const ComponentLayout = React.forwardRef<HTMLDivElement, ComponentLayoutProps>(
  ({
    dot: dotProp,
    style,
    title,
    description,
    children,
    prevPage,
    nextPage,
    breadcrumbItems = [
      { label: "Components", href: "/components" }
    ],
    ...props
  }, ref) => {
    const { isDesktop } = useWindowSize()

    const mainStyle = useMemo(() => mergeStyles(
      S_MAIN,
      resolveDot(dotProp),
      style,
    ), [dotProp, style])

    return (
      <div style={S_OUTER}>
        {/* 고정된 페이지 네비게이션 - 위쪽 (desktop only) */}
        {isDesktop && (
          <div style={S_NAV_TOP_LG}>
            <div style={S_FLEX_COL}>
              {prevPage && (
                <NavButton
                  href={prevPage.href}
                  title={`이전: ${prevPage.title}`}
                  arrowUp
                />
              )}
            </div>
          </div>
        )}

        {/* 고정된 페이지 네비게이션 - 아래쪽 (desktop only) */}
        {isDesktop && (
          <div style={S_NAV_BOTTOM}>
            <div style={S_FLEX_COL}>
              {nextPage && (
                <NavButton
                  href={nextPage.href}
                  title={`다음: ${nextPage.title}`}
                />
              )}
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div
          ref={ref}
          style={mainStyle}
          {...props}
        >
          <div style={S_INNER}>
            {/* 브레드크럼 */}
            <Breadcrumb style={S_BREADCRUMB_MARGIN}>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem
                  key={index}
                  href={item.href}
                  isCurrent={index === breadcrumbItems.length - 1}
                >
                  {item.label}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>

            {/* 페이지 헤더 */}
            <div style={S_HEADER}>
              <h1 style={S_H1}>{title}</h1>
              <p style={S_DESCRIPTION}>
                {description}
              </p>
            </div>

            {/* 페이지 콘텐츠 */}
            <div style={S_CONTENT}>
              {children}
            </div>

            {/* 모바일 페이지 네비게이션 */}
            <div style={S_MOBILE_NAV}>
              <div style={S_MOBILE_NAV_INNER}>
                {prevPage && (
                  <MobileNavLink
                    href={prevPage.href}
                    label={prevPage.title}
                    arrowLeft
                  />
                )}
                {nextPage && (
                  <MobileNavLink
                    href={nextPage.href}
                    label={nextPage.title}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
ComponentLayout.displayName = "ComponentLayout"

export { ComponentLayout }
