"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
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
  /** Default collapsed state for this section */
  defaultCollapsed?: boolean;
}

export interface DashboardSidebarProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
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
  variant?: "default" | "transparent";
  /** @deprecated Edge handle replaces toggle button */
  hideToggle?: boolean;
  itemDot?: string;
  activeDot?: string;
  /** @deprecated Use itemDot instead */
  itemClassName?: string;
  /** @deprecated Use activeDot instead */
  activeClassName?: string;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  hideMobileToggle?: boolean;
  /** Pinned item IDs — shown when sidebar is collapsed */
  pinnedItems?: string[];
  /** Default pinned items (used when pinnedItems is not controlled) */
  defaultPinnedItems?: string[];
  /** Called when pinned items change */
  onPinnedChange?: (pinnedIds: string[]) => void;
  dot?: string;
}

const DEFAULT_COLLAPSED = 72;
const DEFAULT_EXPANDED = 264;

export const DashboardSidebar = React.forwardRef<
  HTMLElement,
  DashboardSidebarProps
>(
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
      pinnedItems: externalPinned,
      defaultPinnedItems,
      onPinnedChange,
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    const itemDot = itemDotProp ?? itemClassName;
    const activeDot = activeDotProp ?? activeClassName;

    const [internalCollapsed, setInternalCollapsed] =
      React.useState(defaultCollapsed);
    const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const [handleHovered, setHandleHovered] = React.useState(false);
    const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(
      null,
    );
    const [collapsedSections, setCollapsedSections] = React.useState<
      Set<string>
    >(() => {
      const initial = new Set<string>();
      for (const s of sections) {
        if (s.defaultCollapsed) initial.add(s.id);
      }
      return initial;
    });
    const [internalPinned, setInternalPinned] = React.useState<Set<string>>(
      () => {
        if (defaultPinnedItems) return new Set(defaultPinnedItems);
        // Smart default: pin first section's items
        const first = sections[0];
        return first ? new Set(first.items.map((i) => i.id)) : new Set();
      },
    );
    const collapsed =
      typeof isCollapsed === "boolean" ? isCollapsed : internalCollapsed;
    const pinnedSet = externalPinned ? new Set(externalPinned) : internalPinned;

    const togglePin = (itemId: string) => {
      const next = new Set(pinnedSet);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      if (!externalPinned) setInternalPinned(next);
      onPinnedChange?.(Array.from(next));
    };

    const isItemPinned = (itemId: string) => pinnedSet.has(itemId);

    const toggleSection = (sectionId: string) => {
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
        return next;
      });
    };

    const isMobileOpen =
      typeof externalMobileOpen === "boolean"
        ? externalMobileOpen
        : internalMobileOpen;
    const setIsMobileOpen = (open: boolean) => {
      onMobileOpenChange?.(open);
      if (typeof externalMobileOpen !== "boolean") setInternalMobileOpen(open);
    };

    React.useEffect(() => {
      const checkMobile = () =>
        setIsMobile(window.innerWidth <= mobileBreakpoint);
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

    // ── Shared item renderer ──
    const renderItem = (item: SidebarNavItem) => {
      const pinned = isItemPinned(item.id);
      const isHovered = hoveredItemId === item.id;
      const activeStyle: React.CSSProperties = activeDot
        ? resolveDot(activeDot)
        : {
            backgroundColor: "var(--color-accent, #eef2ff)",
            color: "var(--color-accent-foreground, #4338ca)",
          };
      const defaultItemStyle: React.CSSProperties = itemDot
        ? resolveDot(itemDot)
        : { color: "var(--color-muted-foreground, #475569)" };
      const baseStyle: React.CSSProperties = {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: collapsed ? "center" : undefined,
        borderRadius: "0.5rem",
        paddingLeft: collapsed ? "0.5rem" : "0.75rem",
        paddingRight: collapsed ? "0.5rem" : "0.75rem",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        transition: "background-color 150ms",
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        background: "transparent",
        textDecoration: "none",
        ...(item.active ? activeStyle : defaultItemStyle),
      };

      const content = (
        <>
          {item.icon && (
            <span
              style={{ marginRight: collapsed ? 0 : "0.75rem", flexShrink: 0 }}
            >
              {typeof item.icon === "string" ? (
                <Icon
                  name={item.icon as IconName}
                  dot="h-5 w-5"
                  variant="inherit"
                />
              ) : (
                item.icon
              )}
            </span>
          )}
          {!collapsed && (
            <>
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
              {item.badge && !isHovered && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-muted-foreground, #94a3b8)",
                    flexShrink: 0,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </>
      );

      const handleItemClick = () => {
        if (isMobile) setIsMobileOpen(false);
      };

      const wrapWithHover = (node: React.ReactElement) => (
        <div
          key={item.id}
          style={{ position: "relative" }}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {node}
          {/* Pin button — always visible when pinned, on hover when not */}
          {!collapsed && (pinned || isHovered) && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePin(item.id);
              }}
              aria-label={pinned ? "Unpin" : "Pin"}
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1.25rem",
                height: "1.25rem",
                borderRadius: "0.25rem",
                border: "none",
                background: "transparent",
                color: pinned
                  ? "var(--color-accent-foreground, #4338ca)"
                  : "var(--color-muted-foreground, #94a3b8)",
                cursor: "pointer",
                opacity: pinned ? 0.8 : 0.4,
              }}
            >
              <Icon name={pinned ? "bookmark" : "bookmark"} dot="h-3 w-3" />
            </button>
          )}
        </div>
      );

      const itemNode = item.href ? (
        <a
          href={item.href}
          style={baseStyle}
          aria-current={item.active ? "page" : undefined}
          onClick={handleItemClick}
        >
          {content}
        </a>
      ) : (
        <button
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

      return wrapWithHover(itemNode);
    };

    // ── Sidebar content ──
    const sidebarBaseStyle: React.CSSProperties = {
      position: "relative",
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
      borderRight:
        variant === "transparent"
          ? "1px solid var(--color-border, rgba(226, 232, 240, 0.4))"
          : "1px solid var(--color-border, rgba(226, 232, 240, 0.6))",
      backgroundColor:
        variant === "transparent"
          ? undefined
          : "var(--color-background, rgba(255, 255, 255, 0.95))",
      boxShadow:
        variant === "transparent" ? undefined : "0 1px 3px rgba(0,0,0,0.1)",
    };

    const sidebarContent = (
      <aside
        ref={ref}
        role="navigation"
        aria-label="Dashboard navigation"
        style={mergeStyles(sidebarBaseStyle, resolveDot(dot), style)}
        {...props}
      >
        {/* Logo */}
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "0.5rem",
            paddingLeft: "0.25rem",
            paddingRight: "0.25rem",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {logo}
          {!collapsed && productSwitcher}
        </div>

        {/* Sections */}
        <div style={{ flex: 1, overflowY: collapsed ? "hidden" : "auto" }}>
          {collapsed ? (
            /* Collapsed: show only pinned + active items, no sections */
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {sections
                .flatMap((s) => s.items)
                .filter((item) => isItemPinned(item.id) || item.active)
                .map(renderItem)}
            </nav>
          ) : (
            /* Expanded: full section view with collapsible groups */
            sections.map((section) => {
              const isSectionCollapsed = collapsedSections.has(section.id);

              return (
                <div key={section.id} style={{ marginBottom: "1.5rem" }}>
                  {section.label && (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--color-muted-foreground, #94a3b8)",
                        marginBottom: isSectionCollapsed ? 0 : "0.5rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: "0.25rem",
                      }}
                      aria-expanded={!isSectionCollapsed}
                    >
                      <span>{section.label}</span>
                      <Icon
                        name={
                          isSectionCollapsed ? "chevronRight" : "chevronDown"
                        }
                        dot="h-3 w-3"
                        style={{ opacity: 0.5 }}
                      />
                    </button>
                  )}

                  {!isSectionCollapsed && (
                    <nav
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                      aria-label={section.label || "Navigation"}
                    >
                      {section.items.map(renderItem)}
                    </nav>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "1rem",
            borderTop: "1px solid var(--color-border, #f1f5f9)",
            paddingTop: "1rem",
            overflow: "hidden",
          }}
        >
          {footerActions}
          {!collapsed && (
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--color-muted-foreground, #94a3b8)",
              }}
            >
              <span>&copy; HUA Labs</span>
            </div>
          )}
        </div>

        {/* Edge handle — right side, vertically centered */}
        {!hideToggle && !isMobile && (
          <button
            type="button"
            onClick={toggleCollapsed}
            onMouseEnter={() => setHandleHovered(true)}
            onMouseLeave={() => setHandleHovered(false)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translate(50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.25rem",
              height: "2.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border, #e2e8f0)",
              backgroundColor: handleHovered
                ? "var(--color-accent, #f1f5f9)"
                : "var(--color-background, #ffffff)",
              color: "var(--color-muted-foreground, #64748b)",
              cursor: "pointer",
              zIndex: 10,
              transition: "background-color 150ms, opacity 150ms",
              opacity: handleHovered ? 1 : 0.6,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <Icon
              name={collapsed ? "chevronRight" : "chevronLeft"}
              dot="h-3 w-3"
            />
          </button>
        )}
      </aside>
    );

    // ── Mobile / Desktop render ──
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
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 40,
                  display: "flex",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: overlayBackground,
                  }}
                  onClick={() => setIsMobileOpen(false)}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 50,
                    height: "100%",
                    backgroundColor: "var(--color-background, #ffffff)",
                  }}
                >
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
  },
);

DashboardSidebar.displayName = "DashboardSidebar";
