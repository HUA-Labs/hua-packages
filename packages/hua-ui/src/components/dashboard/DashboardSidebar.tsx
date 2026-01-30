"use client";

import React from "react";
import { merge } from "../../lib/utils";
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
 * @extends {React.HTMLAttributes<HTMLElement>}
 */
export interface DashboardSidebarProps extends React.HTMLAttributes<HTMLElement> {
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
  /** 아이템 기본 클래스 오버라이드 / Item base class override */
  itemClassName?: string;
  /** 활성 아이템 클래스 오버라이드 / Active item class override */
  activeClassName?: string;
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
      itemClassName,
      activeClassName,
      className,
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const collapsed = typeof isCollapsed === "boolean" ? isCollapsed : internalCollapsed;

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

    const sidebarContent = (
      <aside
        ref={ref}
        role="navigation"
        aria-label="대시보드 네비게이션"
        className={merge(
          "flex h-full flex-col overflow-hidden px-3 py-4 transition-[width] duration-200",
          variant === "transparent"
            ? "border-r border-slate-200/40 dark:border-slate-800/60"
            : "border-r border-slate-200/60 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur",
          className
        )}
        style={{ width: widthStyle, minWidth: widthStyle }}
        {...props}
      >
        <div className="mb-6 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            {logo}
            {!collapsed && productSwitcher}
          </div>
          {!hideToggle && <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            aria-expanded={!collapsed}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
            <span className="sr-only">사이드바 토글</span>
          </button>}
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              {!collapsed && section.label && (
                <div className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500" role="heading" aria-level={2}>
                  {section.label}
                </div>
              )}
              <nav className="space-y-1" aria-label={section.label || "네비게이션"}>
                {section.items.map((item) => {
                  const defaultActive = "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100";
                  const defaultItem = "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800";
                  const baseClasses = merge(
                    "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
                    item.active
                      ? (activeClassName || defaultActive)
                      : (itemClassName || defaultItem)
                  );

                  const content = (
                    <>
                      {item.icon && (
                        <span className="mr-3">
                          {typeof item.icon === "string" ? (
                            <Icon name={item.icon as IconName} className="h-5 w-5" variant="inherit" />
                          ) : (
                            item.icon
                          )}
                        </span>
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && <span className="text-xs text-slate-400">{item.badge}</span>}
                        </>
                      )}
                    </>
                  );

                  const itemNode = item.href ? (
                    <a
                      key={item.id}
                      href={item.href}
                      className={baseClasses}
                      aria-current={item.active ? "page" : undefined}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className={baseClasses}
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

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {footerActions}
          <div className="mt-2 hidden text-xs text-slate-400 lg:block">
            <span>ⓒ HUA Labs</span>
          </div>
        </div>

      </aside>
    );

    return (
      <>
        {isMobile ? (
          <>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:text-slate-200"
              onClick={() => setIsMobileOpen(true)}
            >
              <Icon name="menu" className="h-4 w-4" />
            </button>
            {isMobileOpen && (
              <div className="fixed inset-0 z-40 flex">
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayBackground }}
                  onClick={() => setIsMobileOpen(false)}
                />
                <div className="relative z-50 h-full">
                  {sidebarContent}
                  <button
                    className="absolute top-4 right-4 rounded-full border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon name="close" className="h-4 w-4" />
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
