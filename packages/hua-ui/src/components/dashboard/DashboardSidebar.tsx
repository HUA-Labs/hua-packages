"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { Tooltip } from "../Tooltip";

/**
 * 사이드바 네비게이션 아이템 인터페이스 / SidebarNavItem interface
 * @typedef {Object} SidebarNavItem
 * @property {string} id - 아이템 고유 ID / Item unique ID
 * @property {string} label - 아이템 라벨 / Item label
 * @property {string} [href] - 링크 URL / Link URL
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {React.ReactNode} [badge] - 배지 / Badge
 * @property {boolean} [active] - 활성 상태 / Active state
 * @property {() => void} [onClick] - 클릭 핸들러 / Click handler
 */
export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: IconName | React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

/**
 * 사이드바 섹션 인터페이스 / SidebarSection interface
 * @typedef {Object} SidebarSection
 * @property {string} id - 섹션 고유 ID / Section unique ID
 * @property {string} [label] - 섹션 라벨 / Section label
 * @property {SidebarNavItem[]} items - 섹션 내 아이템 배열 / Items array in section
 */
export interface SidebarSection {
  id: string;
  label?: string;
  items: SidebarNavItem[];
}

/**
 * DashboardSidebar 컴포넌트의 props / DashboardSidebar component props
 * @typedef {Object} DashboardSidebarProps
 * @property {React.ReactNode} [logo] - 로고 컴포넌트 / Logo component
 * @property {React.ReactNode} [productSwitcher] - 제품 전환 컴포넌트 / Product switcher component
 * @property {SidebarSection[]} sections - 사이드바 섹션 배열 / Sidebar sections array
 * @property {React.ReactNode} [footerActions] - 푸터 액션 컴포넌트 / Footer actions component
 * @property {boolean} [isCollapsed] - 접힘 상태 (제어) / Collapsed state (controlled)
 * @property {boolean} [defaultCollapsed=false] - 기본 접힘 상태 / Default collapsed state
 * @property {(collapsed: boolean) => void} [onToggleCollapsed] - 접힘 상태 변경 핸들러 / Collapsed state change handler
 * @property {number} [collapsedWidth=72] - 접힘 상태 너비 (px) / Collapsed width (px)
 * @property {number} [expandedWidth=264] - 펼침 상태 너비 (px) / Expanded width (px)
 * @property {number} [mobileBreakpoint=1024] - 모바일 브레이크포인트 (px) / Mobile breakpoint (px)
 * @property {string} [overlayBackground] - 모바일 오버레이 배경색 / Mobile overlay background color
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface DashboardSidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'className'> {
  logo?: React.ReactNode;
  productSwitcher?: React.ReactNode;
  sections: SidebarSection[];
  footerActions?: React.ReactNode;
  isCollapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
  collapsedWidth?: number;
  expandedWidth?: number;
  mobileBreakpoint?: number;
  overlayBackground?: string;
  /** 사이드바 스타일 변형 / Sidebar style variant */
  variant?: "default" | "transparent";
  /** 토글 버튼 숨기기 / Hide collapse toggle button */
  hideToggle?: boolean;
  /** 아이템 기본 dot 스타일 오버라이드 / Item base dot style override */
  itemDot?: string;
  /** 활성 아이템 dot 스타일 오버라이드 / Active item dot style override */
  activeDot?: string;
  /** @deprecated Use itemDot instead */
  itemClassName?: string;
  /** @deprecated Use activeDot instead */
  activeClassName?: string;
  /** 모바일 열림 상태 (제어) / Mobile open state (controlled) */
  isMobileOpen?: boolean;
  /** 모바일 열림 상태 변경 핸들러 / Mobile open state change handler */
  onMobileOpenChange?: (open: boolean) => void;
  /** 모바일 토글 버튼 숨기기 (외부에서 제어할 때) / Hide mobile toggle button (when controlled externally) */
  hideMobileToggle?: boolean;
  dot?: string;
}

const DEFAULT_COLLAPSED = 72;
const DEFAULT_EXPANDED = 264;

/**
 * DashboardSidebar 컴포넌트
 *
 * 대시보드용 사이드바 네비게이션 컴포넌트입니다.
 * 접기/펼치기 기능과 모바일 반응형을 지원하며, 섹션별로 네비게이션 아이템을 구성할 수 있습니다.
 *
 * Sidebar navigation component for dashboards.
 * Supports collapse/expand functionality and mobile responsiveness, with section-based navigation items.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <DashboardSidebar
 *   logo={<Logo />}
 *   sections={[
 *     {
 *       id: "main",
 *       label: "메인",
 *       items: [
 *         { id: "dashboard", label: "대시보드", href: "/dashboard", icon: "layout" },
 *         { id: "transactions", label: "거래", href: "/transactions", icon: "creditCard" }
 *       ]
 *     }
 *   ]}
 * />
 *
 * @example
 * // 접힘 상태 제어 / Collapse state control
 * <DashboardSidebar
 *   sections={sections}
 *   isCollapsed={collapsed}
 *   onToggleCollapsed={setCollapsed}
 *   collapsedWidth={80}
 *   expandedWidth={280}
 * />
 *
 * @param {DashboardSidebarProps} props - DashboardSidebar 컴포넌트의 props / DashboardSidebar component props
 * @param {React.Ref<HTMLElement>} ref - aside 요소 ref / aside element ref
 * @returns {JSX.Element} DashboardSidebar 컴포넌트 / DashboardSidebar component
 */
export const DashboardSidebar = React.forwardRef<HTMLElement, DashboardSidebarProps>(
  (
    {
      logo,
      productSwitcher,
      sections,
      footerActions,
      isCollapsed,
      defaultCollapsed = false,
      onToggleCollapsed,
      collapsedWidth = DEFAULT_COLLAPSED,
      expandedWidth = DEFAULT_EXPANDED,
      mobileBreakpoint = 1024,
      overlayBackground = "rgba(15, 23, 42, 0.45)",
      variant = "default",
      hideToggle = false,
      itemDot: itemDotProp,
      activeDot: activeDotProp,
      itemClassName,
      activeClassName,
      isMobileOpen: externalMobileOpen,
      onMobileOpenChange,
      hideMobileToggle = false,
      dot,
      style,
      ...props
    },
    ref
  ) => {
    // Backwards compat: itemClassName/activeClassName fall back to itemDot/activeDot
    const itemDot = itemDotProp ?? itemClassName;
    const activeDot = activeDotProp ?? activeClassName;

    const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
    const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const collapsed = typeof isCollapsed === "boolean" ? isCollapsed : internalCollapsed;

    const isMobileOpen = typeof externalMobileOpen === "boolean" ? externalMobileOpen : internalMobileOpen;
    const setIsMobileOpen = (open: boolean) => {
      onMobileOpenChange?.(open);
      if (typeof externalMobileOpen !== "boolean") setInternalMobileOpen(open);
    };

    React.useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= mobileBreakpoint);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, [mobileBreakpoint]);

    const toggleCollapsed = () => {
      const next = !collapsed;
      setInternalCollapsed(next);
      onToggleCollapsed?.(next);
    };

    const widthStyle = collapsed ? collapsedWidth : expandedWidth;

    const sidebarBaseStyle: React.CSSProperties = {
      display: "flex",
      height: "100%",
      flexDirection: "column",
      overflow: "hidden",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      transition: "width 200ms",
      width: widthStyle,
      minWidth: widthStyle,
      borderRight: variant === "transparent"
        ? "1px solid var(--color-border, rgba(226, 232, 240, 0.4))"
        : "1px solid var(--color-border, rgba(226, 232, 240, 0.6))",
      backgroundColor: variant === "transparent" ? undefined : "var(--color-background, rgba(255, 255, 255, 0.95))",
      boxShadow: variant === "transparent" ? undefined : "0 1px 3px rgba(0,0,0,0.1)",
    };

    const sidebarContent = (
      <aside
        ref={ref}
        role="navigation"
        aria-label="대시보드 네비게이션"
        style={mergeStyles(sidebarBaseStyle, resolveDot(dot), style)}
        {...props}
      >
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", paddingLeft: "0.25rem", paddingRight: "0.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {logo}
            {!collapsed && productSwitcher}
          </div>
          {!hideToggle && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              aria-expanded={!collapsed}
              style={{
                display: "inline-flex",
                height: "2rem",
                width: "2rem",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                border: "1px solid var(--color-border, #e2e8f0)",
                color: "var(--color-muted-foreground, #64748b)",
                transition: "colors 200ms",
                cursor: "pointer",
                background: "transparent",
              }}
            >
              <Icon name={collapsed ? "chevronRight" : "chevronLeft"} dot="h-4 w-4" />
              <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>사이드바 토글</span>
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {sections.map((section) => (
            <div key={section.id} style={{ marginBottom: "1.5rem" }}>
              {!collapsed && section.label && (
                <div
                  style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted-foreground, #94a3b8)", marginBottom: "0.5rem" }}
                  role="heading"
                  aria-level={2}
                >
                  {section.label}
                </div>
              )}
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }} aria-label={section.label || "네비게이션"}>
                {section.items.map((item) => {
                  const activeStyle: React.CSSProperties = activeDot
                    ? resolveDot(activeDot)
                    : { backgroundColor: "var(--color-accent, #eef2ff)", color: "var(--color-accent-foreground, #4338ca)" };
                  const defaultItemStyle: React.CSSProperties = itemDot
                    ? resolveDot(itemDot)
                    : { color: "var(--color-muted-foreground, #475569)" };
                  const baseStyle: React.CSSProperties = {
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    borderRadius: "0.5rem",
                    paddingLeft: "0.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "background-color 150ms",
                    cursor: "pointer",
                    border: "none",
                    textAlign: "left",
                    background: "transparent",
                    ...(item.active ? activeStyle : defaultItemStyle),
                  };

                  const content = (
                    <>
                      {item.icon && (
                        <span style={{ marginRight: collapsed ? 0 : "0.75rem" }}>
                          {typeof item.icon === "string" ? (
                            <Icon name={item.icon as IconName} dot="h-5 w-5" variant="inherit" />
                          ) : (
                            item.icon
                          )}
                        </span>
                      )}
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                          {item.badge && <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground, #94a3b8)" }}>{item.badge}</span>}
                        </>
                      )}
                    </>
                  );

                  const handleItemClick = () => {
                    if (isMobile) setIsMobileOpen(false);
                  };

                  const itemNode = item.href ? (
                    <a
                      key={item.id}
                      href={item.href}
                      style={baseStyle}
                      aria-current={item.active ? "page" : undefined}
                      onClick={handleItemClick}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        item.onClick?.();
                        handleItemClick();
                      }}
                      style={baseStyle}
                      aria-pressed={item.active}
                    >
                      {content}
                    </button>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.id} content={item.label}>
                        {itemNode}
                      </Tooltip>
                    );
                  }

                  return itemNode;
                })}
              </nav>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border, #f1f5f9)", paddingTop: "1rem" }}>
          {footerActions}
          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-muted-foreground, #94a3b8)" }}>
            <span>ⓒ HUA Labs</span>
          </div>
        </div>
      </aside>
    );

    return (
      <>
        {isMobile ? (
          <>
            {!hideMobileToggle && (
              <button
                style={{
                  position: "fixed",
                  top: "0.75rem",
                  left: "0.75rem",
                  zIndex: 30,
                  display: "inline-flex",
                  height: "2.5rem",
                  width: "2.5rem",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  backgroundColor: "var(--color-background, #ffffff)",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                onClick={() => setIsMobileOpen(true)}
              >
                <Icon name="menu" dot="h-5 w-5" />
              </button>
            )}
            {isMobileOpen && (
              <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex" }}>
                <div
                  style={{ position: "absolute", inset: 0, backgroundColor: overlayBackground }}
                  onClick={() => setIsMobileOpen(false)}
                />
                <div style={{ position: "relative", zIndex: 50, height: "100%", backgroundColor: "var(--color-background, #ffffff)" }}>
                  {sidebarContent}
                  <button
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      display: "inline-flex",
                      height: "2.5rem",
                      width: "2.5rem",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0.75rem",
                      color: "var(--color-muted-foreground, #64748b)",
                      transition: "background-color 150ms",
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                    }}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon name="close" dot="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          sidebarContent
        )}
      </>
    );
  }
);

DashboardSidebar.displayName = "DashboardSidebar";
