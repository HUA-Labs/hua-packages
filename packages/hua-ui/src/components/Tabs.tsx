"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ── Style constants ───────────────────────────────────────────────

const BASE_LIST_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const VARIANT_LIST_STYLES: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--color-muted)",
    ...resolveDot("p-3 rounded-xl"),
    border:
      "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
  },
  pills: {
    backgroundColor: "var(--color-muted)",
    ...resolveDot("p-3 rounded-xl"),
    border:
      "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
  },
  underline: {
    borderBottom: "1px solid var(--color-border)",
    padding: "0",
    borderRadius: "0",
    backgroundColor: "transparent",
  },
  cards: {
    backgroundColor: "color-mix(in srgb, var(--color-muted) 80%, transparent)",
    ...resolveDot("p-3 rounded-xl"),
    border:
      "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
  },
};

const SIZE_LIST_STYLES: Record<string, React.CSSProperties> = {
  sm: { height: "3rem" },
  md: { height: "3.5rem" },
  lg: { height: "4rem" },
};

const BASE_TRIGGER_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  fontWeight: 500,
  transition: "all 200ms ease-in-out",
  cursor: "pointer",
  border: "none",
  background: "none",
  outline: "none",
};

const SIZE_TRIGGER_STYLES: Record<string, React.CSSProperties> = {
  sm: { height: "2.5rem", ...resolveDot("py-2 px-4"), fontSize: "0.75rem" },
  md: {
    height: "3rem",
    paddingTop: "0.625rem",
    paddingBottom: "0.625rem",
    ...resolveDot("px-5"),
    fontSize: "0.875rem",
  },
  lg: { height: "3.5rem", ...resolveDot("py-3 px-6"), fontSize: "1rem" },
};

const ACTIVE_TRIGGER_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const INACTIVE_TRIGGER_STYLE: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
};

const ACTIVE_UNDERLINE_TRIGGER_STYLE: React.CSSProperties = {
  borderBottom: "2px solid var(--color-primary)",
  color: "var(--color-primary)",
  borderRadius: "0",
  backgroundColor: "transparent",
  boxShadow: "none",
  marginBottom: "-1px",
};

const INACTIVE_UNDERLINE_TRIGGER_STYLE: React.CSSProperties = {
  borderBottom: "2px solid transparent",
  color: "var(--color-muted-foreground)",
  borderRadius: "0",
  backgroundColor: "transparent",
  boxShadow: "none",
  marginBottom: "-1px",
};

const VARIANT_TRIGGER_BASE_STYLES: Record<string, React.CSSProperties> = {
  default: {
    ...resolveDot("rounded-lg px-4"),
    paddingTop: "0.625rem",
    paddingBottom: "0.625rem",
  },
  pills: {
    ...resolveDot("rounded-lg px-4"),
    paddingTop: "0.625rem",
    paddingBottom: "0.625rem",
  },
  underline: { borderRadius: "0" },
  cards: {
    ...resolveDot("rounded-lg px-4"),
    paddingTop: "0.625rem",
    paddingBottom: "0.625rem",
  },
};

const HOVER_TRIGGER_STYLE: React.CSSProperties = {
  color: "var(--color-foreground)",
  backgroundColor: "var(--color-muted)",
};

const HOVER_UNDERLINE_TRIGGER_STYLE: React.CSSProperties = {
  color: "var(--color-foreground)",
  backgroundColor: "transparent",
};

const FOCUS_RING_STYLE: React.CSSProperties = {
  boxShadow: "0 0 0 1px var(--color-ring), 0 0 0 3px var(--color-ring)",
};

const DISABLED_TRIGGER_STYLE: React.CSSProperties = {
  opacity: 0.5,
  pointerEvents: "none",
};

const CONTENT_BASE_STYLE: React.CSSProperties = {
  ...resolveDot("mt-2"),
};

// ── TabsContent ───────────────────────────────────────────────────

/**
 * TabsContent component props
 * @property {string} value - Unique value for tab panel (must match TabsTrigger value)
 * @property {boolean} [active] - Tab panel active state (auto-set)
 */
export interface TabsContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  value: string;
  active?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TabsContent component
 * Displays the tab content panel. Used inside Tabs component.
 */
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ dot: dotProp, value, active, children, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const computedStyle = useMemo(
      () =>
        mergeStyles(
          CONTENT_BASE_STYLE,
          isFocused ? FOCUS_RING_STYLE : undefined,
          resolveDot(dotProp),
          style,
        ),
      [dotProp, isFocused, style],
    );

    if (active === false) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        hidden={!active}
        style={computedStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsContent.displayName = "TabsContent";

// ── Tabs ─────────────────────────────────────────────────────────

/**
 * Tabs component props
 * @property {string} [value] - Currently active tab value (controlled component)
 * @property {string} [defaultValue] - Initial active tab value (uncontrolled component)
 * @property {(value: string) => void} [onValueChange] - Callback when tab changes
 * @property {"horizontal" | "vertical"} [orientation="horizontal"] - Tab orientation
 * @property {"default" | "pills" | "underline" | "cards"} [variant="default"] - Tab style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Tab size
 */
export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline" | "cards";
  size?: "sm" | "md" | "lg";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * Tabs component
 *
 * Component that provides tab navigation.
 * Supports keyboard navigation (Arrow keys, Home/End) and automatically sets ARIA attributes.
 *
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 *
 * @example
 * // Controlled component
 * const [activeTab, setActiveTab] = useState("tab1")
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content</TabsContent>
 * </Tabs>
 *
 * @example
 * // Various variants
 * <Tabs variant="pills" size="lg">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Pills style</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 */
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      dot: dotProp,
      value,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      variant = "default",
      size = "md",
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = React.useState(
      value || defaultValue || "",
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : activeTab;

    const handleTabChange = (newValue: string) => {
      if (!isControlled) {
        setActiveTab(newValue);
      }
      onValueChange?.(newValue);
    };

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value);
      }
    }, [value]);

    const computedStyle = useMemo(
      () =>
        mergeStyles(
          { width: "100%" } as React.CSSProperties,
          orientation === "vertical"
            ? ({ display: "flex" } as React.CSSProperties)
            : undefined,
          resolveDot(dotProp),
          style,
        ),
      [orientation, dotProp, style],
    );

    return (
      <div ref={ref} style={computedStyle} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === TabsContent) {
              const childProps = child.props as TabsContentProps;
              return React.cloneElement(child, {
                active: childProps.value === currentValue,
              } as Partial<TabsContentProps>);
            }
            if (child.type === TabsList) {
              return React.cloneElement(child, {
                value: currentValue,
                onValueChange: handleTabChange,
                orientation,
                variant,
                size,
              } as Partial<TabsListProps>);
            }
            if (typeof child.type !== "string") {
              return React.cloneElement(child, {
                value: currentValue,
                onValueChange: handleTabChange,
                orientation,
                variant,
                size,
              } as Record<string, unknown>);
            }
          }
          return child;
        })}
      </div>
    );
  },
);
Tabs.displayName = "Tabs";

// ── TabsList ──────────────────────────────────────────────────────

/**
 * TabsList component props
 * @property {string} [value] - Currently active tab value (auto-passed from Tabs)
 * @property {(value: string) => void} [onValueChange] - Tab change callback (auto-passed from Tabs)
 * @property {"horizontal" | "vertical"} [orientation] - Tab orientation (auto-passed from Tabs)
 * @property {"default" | "pills" | "underline" | "cards"} [variant] - Tab style (auto-passed from Tabs)
 * @property {"sm" | "md" | "lg"} [size] - Tab size (auto-passed from Tabs)
 */
export interface TabsListProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline" | "cards";
  size?: "sm" | "md" | "lg";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TabsList component
 * Displays the list of tab triggers. Used inside Tabs component.
 */
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      dot: dotProp,
      value,
      onValueChange,
      orientation = "horizontal",
      variant = "default",
      size = "md",
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const listRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => listRef.current as HTMLDivElement);

    const tabValues = useMemo(() => {
      const values: string[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { value?: string };
          if (childProps.value) {
            values.push(childProps.value);
          }
        }
      });
      return values;
    }, [children]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!value || tabValues.length === 0) return;

      const currentIndex = tabValues.indexOf(value);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      if (orientation === "horizontal") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1;
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === "Home") {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          newIndex = tabValues.length - 1;
        }
      } else {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === "Home") {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          newIndex = tabValues.length - 1;
        }
      }

      if (newIndex !== currentIndex && tabValues[newIndex]) {
        onValueChange?.(tabValues[newIndex]);
        const triggerElement = listRef.current?.querySelector(
          `[data-tab-value="${tabValues[newIndex]}"]`,
        ) as HTMLElement;
        triggerElement?.focus();
      }
    };

    const computedStyle = useMemo(
      () =>
        mergeStyles(
          BASE_LIST_STYLE,
          orientation === "vertical"
            ? ({ flexDirection: "column" } as React.CSSProperties)
            : undefined,
          VARIANT_LIST_STYLES[variant] ?? VARIANT_LIST_STYLES.default,
          SIZE_LIST_STYLES[size] ?? SIZE_LIST_STYLES.md,
          resolveDot(dotProp),
          style,
        ),
      [orientation, variant, size, dotProp, style],
    );

    return (
      <div
        ref={listRef}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        style={computedStyle}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (typeof child.type === "string") {
              return child;
            }
            const childProps = child.props as { value?: string };
            return React.cloneElement(child, {
              onValueChange,
              orientation,
              variant,
              size,
              active: childProps.value === value,
            } as Partial<TabsTriggerProps>);
          }
          return child;
        })}
      </div>
    );
  },
);
TabsList.displayName = "TabsList";

// ── TabsTrigger ───────────────────────────────────────────────────

/**
 * TabsTrigger component props
 * @property {string} value - Unique trigger value (must match TabsContent value)
 * @property {(value: string) => void} [onValueChange] - Tab change callback (auto-passed from TabsList)
 * @property {"horizontal" | "vertical"} [orientation] - Tab orientation (auto-passed from TabsList)
 * @property {"default" | "pills" | "underline" | "cards"} [variant] - Tab style (auto-passed from TabsList)
 * @property {"sm" | "md" | "lg"} [size] - Tab size (auto-passed from TabsList)
 * @property {boolean} [active] - Active state (auto-set)
 */
export interface TabsTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  value: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline" | "cards";
  size?: "sm" | "md" | "lg";
  active?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TabsTrigger component
 * Button that activates a tab. Used inside TabsList component.
 */
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      dot: dotProp,
      value,
      onValueChange,
      orientation: _orientation = "horizontal",
      variant = "default",
      size = "md",
      active = false,
      children,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const computedStyle = useMemo(() => {
      const isUnderline = variant === "underline";

      const activeStyle = isUnderline
        ? ACTIVE_UNDERLINE_TRIGGER_STYLE
        : ACTIVE_TRIGGER_STYLE;
      const inactiveStyle = isUnderline
        ? INACTIVE_UNDERLINE_TRIGGER_STYLE
        : INACTIVE_TRIGGER_STYLE;
      const hoverStyle = isUnderline
        ? HOVER_UNDERLINE_TRIGGER_STYLE
        : HOVER_TRIGGER_STYLE;

      return mergeStyles(
        BASE_TRIGGER_STYLE,
        VARIANT_TRIGGER_BASE_STYLES[variant] ??
          VARIANT_TRIGGER_BASE_STYLES.default,
        SIZE_TRIGGER_STYLES[size] ?? SIZE_TRIGGER_STYLES.md,
        active ? activeStyle : inactiveStyle,
        !active && isHovered && !disabled ? hoverStyle : undefined,
        isFocused ? FOCUS_RING_STYLE : undefined,
        disabled ? DISABLED_TRIGGER_STYLE : undefined,
        resolveDot(dotProp),
        style,
      );
    }, [variant, size, active, isHovered, isFocused, disabled, dotProp, style]);

    const handleClick = () => {
      if (onValueChange) {
        onValueChange(value);
      }
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        aria-controls={`tabpanel-${value}`}
        id={`tab-${value}`}
        data-tab-value={value}
        tabIndex={active ? 0 : -1}
        style={computedStyle}
        onClick={handleClick}
        type="button"
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

// ── Convenience components ────────────────────────────────────────

const TabsPills = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ dot, style, ...props }, ref) => (
    <Tabs ref={ref} variant="pills" dot={dot} style={style} {...props} />
  ),
);
TabsPills.displayName = "TabsPills";

const TabsUnderline = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ dot, style, ...props }, ref) => (
    <Tabs ref={ref} variant="underline" dot={dot} style={style} {...props} />
  ),
);
TabsUnderline.displayName = "TabsUnderline";

const TabsCards = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ dot, style, ...props }, ref) => (
    <Tabs ref={ref} variant="cards" dot={dot} style={style} {...props} />
  ),
);
TabsCards.displayName = "TabsCards";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsPills,
  TabsUnderline,
  TabsCards,
};
