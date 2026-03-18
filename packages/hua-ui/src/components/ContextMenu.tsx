"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { createGlassStyle } from "../lib/styles/glass";

// ---------------------------------------------------------------------------
// Static style objects
// ---------------------------------------------------------------------------

const WRAPPER_STYLE: React.CSSProperties = {
  position: "relative",
};

const TRIGGER_WRAPPER_STYLE: React.CSSProperties = {
  display: "inline-block",
};

const PANEL_BASE_STYLE: React.CSSProperties = {
  position: "fixed",
  zIndex: 50,
  minWidth: "200px",
  ...resolveDot("py-2 rounded-lg"),
  ...createGlassStyle("light"),
  backgroundColor: "var(--context-menu-bg, #fff)",
  color: "var(--context-menu-foreground)",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const ITEM_BASE_STYLE: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  ...resolveDot("gap-3 px-4 py-3"),
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "background-color 200ms ease-in-out, color 200ms ease-in-out",
  background: "none",
  border: "none",
  textAlign: "left" as const,
  cursor: "pointer",
  outline: "none",
  color: "var(--context-menu-item-default-color)",
};

const ITEM_VARIANT_STYLE: Record<string, React.CSSProperties> = {
  default: {
    color: "var(--context-menu-item-default-color)",
  },
  destructive: {
    color: "var(--context-menu-item-destructive-color)",
  },
  disabled: {
    color: "var(--context-menu-item-muted-color)",
    cursor: "not-allowed",
  },
};

const ITEM_HOVER_STYLE: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--context-menu-item-hover-bg)",
  },
  destructive: {
    backgroundColor: "var(--context-menu-item-destructive-hover-bg)",
  },
  disabled: {},
};

const ITEM_ICON_WRAPPER_STYLE: React.CSSProperties = {
  flexShrink: 0,
  width: "1rem",
  height: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ITEM_LABEL_STYLE: React.CSSProperties = {
  flex: 1,
  textAlign: "left" as const,
};

const SEPARATOR_STYLE: React.CSSProperties = {
  height: "1px",
  backgroundColor: "var(--context-menu-separator-color)",
  ...resolveDot("my-2"),
};

const LABEL_STYLE: React.CSSProperties = {
  ...resolveDot("px-4 py-2"),
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--context-menu-label-color)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const GROUP_STYLE: React.CSSProperties = {
  ...resolveDot("py-1"),
};

// ---------------------------------------------------------------------------
// ContextMenu
// ---------------------------------------------------------------------------

/**
 * ContextMenu component props
 * @typedef {Object} ContextMenuProps
 * @property {React.ReactNode} children - ContextMenu content
 * @property {boolean} [open] - Open/close state in controlled mode
 * @property {(open: boolean) => void} [onOpenChange] - State change callback
 * @property {React.ReactNode} [trigger] - Trigger element to open context menu (right-click event)
 * @property {"top" | "bottom" | "left" | "right"} [placement="bottom"] - ContextMenu display position
 * @property {"start" | "center" | "end"} [align="start"] - ContextMenu alignment
 * @property {number} [offset=8] - Spacing between trigger and context menu (px)
 * @property {boolean} [disabled=false] - Disable context menu
 */
export interface ContextMenuProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  offset?: number;
  disabled?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * ContextMenu component
 *
 * Context menu component that appears on right-click.
 * Automatically connects right-click events to the trigger element.
 *
 * @component
 * @example
 * // Basic usage
 * <ContextMenu trigger={<div>Right-click here</div>}>
 *   <ContextMenuItem>Item 1</ContextMenuItem>
 *   <ContextMenuItem>Item 2</ContextMenuItem>
 * </ContextMenu>
 *
 * @example
 * // Controlled mode
 * const [open, setOpen] = useState(false)
 * <ContextMenu
 *   open={open}
 *   onOpenChange={setOpen}
 *   trigger={<div>Right-click</div>}
 * >
 *   <ContextMenuItem>Copy</ContextMenuItem>
 *   <ContextMenuItem>Delete</ContextMenuItem>
 * </ContextMenu>
 */
const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      dot: dotProp,
      style,
      children,
      open: controlledOpen,
      onOpenChange,
      trigger,
      placement: _placement = "bottom",
      align: _align = "start",
      offset: _offset = 8,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [coords, setCoords] = React.useState({ x: 0, y: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const wrapperStyle = useMemo(
      () => mergeStyles(WRAPPER_STYLE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (disabled) return;

        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [disabled, isControlled, onOpenChange],
    );

    const handleContextMenu = (event: React.MouseEvent) => {
      event.preventDefault();
      if (disabled) return;

      const x = event.clientX;
      const y = event.clientY;

      setCoords({ x, y });
      handleOpenChange(true);
    };

    const updatePosition = React.useCallback(() => {
      if (!menuRef.current) return;

      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = coords.x;
      let y = coords.y;

      if (x + menuRect.width > viewportWidth - 8) {
        x = viewportWidth - menuRect.width - 8;
      }
      if (y + menuRect.height > viewportHeight - 8) {
        y = viewportHeight - menuRect.height - 8;
      }
      if (x < 8) x = 8;
      if (y < 8) y = 8;

      setCoords({ x, y });
    }, [coords.x, coords.y]);

    React.useEffect(() => {
      if (isOpen) {
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);

        return () => {
          window.removeEventListener("resize", updatePosition);
          window.removeEventListener("scroll", updatePosition);
        };
      }
    }, [isOpen, updatePosition]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          menuRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !menuRef.current.contains(event.target as Node)
        ) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen, handleOpenChange]);

    return (
      <div ref={ref} style={wrapperStyle} {...props}>
        {/* Trigger */}
        {trigger && (
          <div
            ref={triggerRef}
            onContextMenu={handleContextMenu}
            style={TRIGGER_WRAPPER_STYLE}
          >
            {trigger}
          </div>
        )}

        {/* Context menu panel */}
        {isOpen && (
          <div
            ref={menuRef}
            data-testid="context-menu-panel"
            style={{
              ...PANEL_BASE_STYLE,
              left: coords.x,
              top: coords.y,
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);
ContextMenu.displayName = "ContextMenu";

// ---------------------------------------------------------------------------
// ContextMenuItem
// ---------------------------------------------------------------------------

export interface ContextMenuItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "disabled";
  dot?: string;
  style?: React.CSSProperties;
}

const ContextMenuItem = React.forwardRef<
  HTMLButtonElement,
  ContextMenuItemProps
>(
  (
    {
      dot: dotProp,
      style,
      icon,
      variant = "default",
      children,
      disabled,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isDisabled = disabled || variant === "disabled";

    const computedStyle = useMemo(() => {
      return mergeStyles(
        ITEM_BASE_STYLE,
        ITEM_VARIANT_STYLE[variant] ?? ITEM_VARIANT_STYLE.default,
        !isDisabled && isHovered
          ? (ITEM_HOVER_STYLE[variant] ?? ITEM_HOVER_STYLE.default)
          : undefined,
        !isDisabled && isFocused
          ? (ITEM_HOVER_STYLE[variant] ?? ITEM_HOVER_STYLE.default)
          : undefined,
        resolveDot(dotProp),
        style,
      );
    }, [variant, isHovered, isFocused, isDisabled, dotProp, style]);

    return (
      <button
        ref={ref}
        style={computedStyle}
        disabled={isDisabled}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      >
        {icon && <span style={ITEM_ICON_WRAPPER_STYLE}>{icon}</span>}
        <span style={ITEM_LABEL_STYLE}>{children}</span>
      </button>
    );
  },
);
ContextMenuItem.displayName = "ContextMenuItem";

// ---------------------------------------------------------------------------
// ContextMenuSeparator
// ---------------------------------------------------------------------------

export interface ContextMenuSeparatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  ContextMenuSeparatorProps
>(({ dot: dotProp, style, ...props }, ref) => {
  const computedStyle = useMemo(
    () => mergeStyles(SEPARATOR_STYLE, resolveDot(dotProp), style),
    [dotProp, style],
  );

  return <div ref={ref} style={computedStyle} {...props} />;
});
ContextMenuSeparator.displayName = "ContextMenuSeparator";

// ---------------------------------------------------------------------------
// ContextMenuLabel
// ---------------------------------------------------------------------------

export interface ContextMenuLabelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  ContextMenuLabelProps
>(({ dot: dotProp, style, children, ...props }, ref) => {
  const computedStyle = useMemo(
    () => mergeStyles(LABEL_STYLE, resolveDot(dotProp), style),
    [dotProp, style],
  );

  return (
    <div ref={ref} style={computedStyle} {...props}>
      {children}
    </div>
  );
});
ContextMenuLabel.displayName = "ContextMenuLabel";

// ---------------------------------------------------------------------------
// ContextMenuGroup
// ---------------------------------------------------------------------------

export interface ContextMenuGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const ContextMenuGroup = React.forwardRef<
  HTMLDivElement,
  ContextMenuGroupProps
>(({ dot: dotProp, style, children, ...props }, ref) => {
  const computedStyle = useMemo(
    () => mergeStyles(GROUP_STYLE, resolveDot(dotProp), style),
    [dotProp, style],
  );

  return (
    <div ref={ref} style={computedStyle} {...props}>
      {children}
    </div>
  );
});
ContextMenuGroup.displayName = "ContextMenuGroup";

export {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuGroup,
};
