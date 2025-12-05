"use client";

import * as React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { Tooltip } from "../Tooltip";

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: IconName | React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  label?: string;
  items: SidebarNavItem[];
}

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
}

const DEFAULT_COLLAPSED = 72;
const DEFAULT_EXPANDED = 264;

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
        className={merge(
          "flex h-full flex-col border-r border-slate-200/60 bg-white/95 px-3 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur transition-[width] duration-200",
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
          <button
            type="button"
            onClick={toggleCollapsed}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
            <span className="sr-only">사이드바 토글</span>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              {!collapsed && section.label && (
                <div className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {section.label}
                </div>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const baseClasses = merge(
                    "group flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70",
                    item.active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-200"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  );

                  const content = (
                    <>
                      {item.icon && (
                        <span className="mr-3">
                          {typeof item.icon === "string" ? (
                            <Icon name={item.icon as IconName} className="h-5 w-5" />
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
              메뉴
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
