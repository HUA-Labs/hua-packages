"use client";

import React, { useState, useMemo } from "react";
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
  flip,
  shift,
  arrow as arrowMiddleware,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingArrow,
  type Placement,
} from "@floating-ui/react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { EASING_FUNCTIONS, DURATIONS } from "../lib/motion/presets";

// ---------------------------------------------------------------------------
// Static style objects
// ---------------------------------------------------------------------------

const TRIGGER_WRAPPER_STYLE: React.CSSProperties = {
  display: "inline-block",
  cursor: "pointer",
};

const FLOATING_PANEL_BASE: React.CSSProperties = {
  zIndex: 50,
  minWidth: "8rem",
  width: "max-content",
  ...resolveDot("py-1"),
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-popover, var(--dropdown-bg, #fff))",
  color: "var(--color-popover-foreground)",
};

const ROUNDED_CSS: Record<string, React.CSSProperties> = {
  none: resolveDot("rounded-none") ?? {},
  sm: resolveDot("rounded") ?? {},
  md: resolveDot("rounded-md") ?? {},
  lg: resolveDot("rounded-lg") ?? {},
  xl: resolveDot("rounded-xl") ?? {},
  full: resolveDot("rounded-full") ?? {},
};

const SHADOW_CSS: Record<string, React.CSSProperties> = {
  none: {},
  sm: resolveDot("shadow-sm") ?? {},
  md: resolveDot("shadow-md") ?? {},
  lg: resolveDot("shadow-lg") ?? {},
  xl: resolveDot("shadow-xl") ?? {},
  "2xl": resolveDot("shadow-2xl") ?? {},
};

// DropdownItem variants
const ITEM_BASE_STYLE: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  ...resolveDot("gap-2 px-3 py-2"),
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "background-color 200ms ease-in-out, color 200ms ease-in-out",
  background: "none",
  border: "none",
  textAlign: "left" as const,
  cursor: "pointer",
  outline: "none",
  color: "var(--color-foreground)",
};

const ITEM_VARIANT_STYLE: Record<string, React.CSSProperties> = {
  default: {
    color: "var(--color-foreground)",
  },
  destructive: {
    color: "var(--color-destructive)",
  },
  disabled: {
    color: "var(--color-muted-foreground)",
    cursor: "not-allowed",
  },
};

const ITEM_HOVER_STYLE: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--color-muted)",
  },
  destructive: {
    backgroundColor:
      "color-mix(in srgb, var(--color-destructive) 10%, transparent)",
  },
  disabled: {},
};

const ITEM_FOCUS_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-muted)",
  outline: "none",
};

const ITEM_ICON_STYLE: React.CSSProperties = {
  flexShrink: 0,
  width: "1rem",
  height: "1rem",
};

const ITEM_LABEL_STYLE: React.CSSProperties = {
  flex: 1,
  textAlign: "left",
};

// DropdownSeparator
const SEPARATOR_STYLE: React.CSSProperties = {
  height: "1px",
  backgroundColor: "var(--color-border)",
  ...resolveDot("my-2"),
};

// DropdownLabel
const LABEL_STYLE: React.CSSProperties = {
  ...resolveDot("px-4 py-2"),
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

// DropdownMenu
const MENU_STYLE: React.CSSProperties = {
  ...resolveDot("py-1"),
};

// DropdownGroup
const GROUP_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  ...resolveDot("gap-1"),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveFloatingPlacement(
  placement: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
): Placement {
  if (align === "center") return placement;
  return `${placement}-${align}`;
}

const ARROW_SIZE = 8;

// ---------------------------------------------------------------------------
// Dropdown (root)
// ---------------------------------------------------------------------------

export interface DropdownProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  offset?: number;
  disabled?: boolean;
  showArrow?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  dot?: string;
  style?: React.CSSProperties;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      dot: dotProp,
      trigger,
      children,
      open: controlledOpen,
      onOpenChange,
      placement = "bottom",
      align = "start",
      offset = 8,
      disabled = false,
      showArrow = false,
      rounded = "lg",
      shadow = "md",
      style,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const arrowRef = React.useRef<SVGSVGElement>(null);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (disabled && newOpen) return;
        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [disabled, isControlled, onOpenChange],
    );

    const floatingPlacement = resolveFloatingPlacement(placement, align);

    const middleware = [
      offsetMiddleware(offset),
      flip(),
      shift({ padding: 8 }),
    ];
    if (showArrow) {
      middleware.push(arrowMiddleware({ element: arrowRef, padding: 8 }));
    }

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: handleOpenChange,
      placement: floatingPlacement,
      middleware,
      whileElementsMounted: autoUpdate,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "menu" });

    const { getReferenceProps, getFloatingProps } = useInteractions([
      click,
      dismiss,
      role,
    ]);

    const rootStyle = useMemo(
      () =>
        mergeStyles(
          { position: "relative", display: "inline-block" },
          resolveDot(dotProp),
          style,
        ),
      [dotProp, style],
    );

    const panelStyle = useMemo(
      () =>
        mergeStyles(
          FLOATING_PANEL_BASE,
          ROUNDED_CSS[rounded],
          SHADOW_CSS[shadow],
          {
            animation: `dropdownEnter ${DURATIONS.soft}ms ${EASING_FUNCTIONS.soft}`,
            transformOrigin: "top",
          },
          floatingStyles,
        ),
      [rounded, shadow, floatingStyles],
    );

    return (
      <div ref={ref} style={rootStyle} {...props}>
        {/* Trigger */}
        <div
          ref={refs.setReference}
          style={TRIGGER_WRAPPER_STYLE}
          {...getReferenceProps()}
        >
          {trigger}
        </div>

        {/* Dropdown via Portal */}
        {isOpen && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={panelStyle}
              {...getFloatingProps()}
            >
              {showArrow && (
                <FloatingArrow
                  ref={arrowRef}
                  context={context}
                  width={ARROW_SIZE * 2}
                  height={ARROW_SIZE}
                  style={{
                    fill: "var(--color-popover, var(--dropdown-bg, #fff))",
                  }}
                />
              )}
              {children}
            </div>
          </FloatingPortal>
        )}
      </div>
    );
  },
);
Dropdown.displayName = "Dropdown";

// ---------------------------------------------------------------------------
// DropdownItem
// ---------------------------------------------------------------------------

export interface DropdownItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "disabled";
  dot?: string;
  style?: React.CSSProperties;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  (
    {
      dot: dotProp,
      icon,
      variant = "default",
      children,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isDisabled = disabled || variant === "disabled";

    const computedStyle = useMemo(() => {
      const variantStyle =
        ITEM_VARIANT_STYLE[variant] ?? ITEM_VARIANT_STYLE.default;
      const hoverStyle =
        isHovered && !isDisabled
          ? (ITEM_HOVER_STYLE[variant] ?? ITEM_HOVER_STYLE.default)
          : undefined;
      const focusStyle =
        isFocused && !isDisabled ? ITEM_FOCUS_STYLE : undefined;
      return mergeStyles(
        ITEM_BASE_STYLE,
        variantStyle,
        hoverStyle,
        focusStyle,
        resolveDot(dotProp),
        style,
      );
    }, [variant, isHovered, isFocused, isDisabled, dotProp, style]);

    return (
      <button
        ref={ref}
        style={computedStyle}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {icon && <div style={ITEM_ICON_STYLE}>{icon}</div>}
        <span style={ITEM_LABEL_STYLE}>{children}</span>
      </button>
    );
  },
);
DropdownItem.displayName = "DropdownItem";

// ---------------------------------------------------------------------------
// DropdownSeparator
// ---------------------------------------------------------------------------

export interface DropdownSeparatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownSeparatorProps
>(({ dot: dotProp, style, ...props }, ref) => {
  const computedStyle = useMemo(
    () => mergeStyles(SEPARATOR_STYLE, resolveDot(dotProp), style),
    [dotProp, style],
  );
  return <div ref={ref} style={computedStyle} {...props} />;
});
DropdownSeparator.displayName = "DropdownSeparator";

// ---------------------------------------------------------------------------
// DropdownLabel
// ---------------------------------------------------------------------------

export interface DropdownLabelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ dot: dotProp, children, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(LABEL_STYLE, resolveDot(dotProp), style),
      [dotProp, style],
    );
    return (
      <div ref={ref} style={computedStyle} {...props}>
        {children}
      </div>
    );
  },
);
DropdownLabel.displayName = "DropdownLabel";

// ---------------------------------------------------------------------------
// DropdownMenu
// ---------------------------------------------------------------------------

export interface DropdownMenuProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ dot: dotProp, children, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(MENU_STYLE, resolveDot(dotProp), style),
      [dotProp, style],
    );
    return (
      <div ref={ref} style={computedStyle} {...props}>
        {children}
      </div>
    );
  },
);
DropdownMenu.displayName = "DropdownMenu";

// ---------------------------------------------------------------------------
// DropdownGroup
// ---------------------------------------------------------------------------

export interface DropdownGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const DropdownGroup = React.forwardRef<HTMLDivElement, DropdownGroupProps>(
  ({ dot: dotProp, children, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(GROUP_STYLE, resolveDot(dotProp), style),
      [dotProp, style],
    );
    return (
      <div ref={ref} style={computedStyle} {...props}>
        {children}
      </div>
    );
  },
);
DropdownGroup.displayName = "DropdownGroup";

export {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownMenu,
  DropdownGroup,
};
