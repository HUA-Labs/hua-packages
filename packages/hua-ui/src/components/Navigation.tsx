"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ---------------------------------------------------------------------------
// Static style constants
// ---------------------------------------------------------------------------

const WRAPPER_BASE: React.CSSProperties = {
  width: "100%",
};

// --- NavigationList ---

const LIST_BASE: React.CSSProperties = {
  display: "flex",
};

const LIST_VARIANT: Record<string, React.CSSProperties> = {
  pills: {
    backgroundColor: "var(--color-muted)",
    ...resolveDot("p-1 rounded-xl"),
  },
  underline: {
    borderBottom: "1px solid var(--color-border)",
  },
  cards: {
    backgroundColor: "color-mix(in srgb, var(--color-muted) 50%, transparent)",
    ...resolveDot("p-1 rounded-xl"),
  },
};

const LIST_SCALE_GAP: Record<string, React.CSSProperties> = {
  small: resolveDot("gap-1"),
  medium: resolveDot("gap-2"),
  large: resolveDot("gap-3"),
};

// --- NavigationItem ---

const ITEM_BASE: React.CSSProperties = {
  ...resolveDot("rounded-lg"),
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "all 200ms ease-in-out",
  cursor: "pointer",
  outline: "none",
  border: "none",
  background: "none",
  lineHeight: 1.25,
};

/** Active state styles per variant */
const ITEM_ACTIVE: Record<string, React.CSSProperties> = {
  pills: {
    backgroundColor: "var(--color-background)",
    color: "var(--color-foreground)",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
  },
  underline: {
    borderBottom: "2px solid var(--color-primary)",
    color: "var(--color-primary)",
    borderRadius: 0,
    paddingBottom: "calc(0.5rem - 2px)", // compensate for border
  },
  cards: {
    backgroundColor: "var(--color-background)",
    color: "var(--color-foreground)",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
    border: "1px solid var(--color-border)",
  },
};

/** Idle state styles per variant */
const ITEM_IDLE: Record<string, React.CSSProperties> = {
  pills: {
    color: "var(--color-muted-foreground)",
  },
  underline: {
    borderBottom: "2px solid transparent",
    color: "var(--color-muted-foreground)",
    borderRadius: 0,
    paddingBottom: "calc(0.5rem - 2px)",
  },
  cards: {
    color: "var(--color-muted-foreground)",
  },
};

/** Hover overlay for idle items */
const ITEM_HOVER_IDLE: React.CSSProperties = {
  color: "var(--color-foreground)",
};

/** Scale-based padding/font-size per scale */
const ITEM_SCALE: Record<string, React.CSSProperties> = {
  small: { fontSize: "0.75rem", ...resolveDot("py-1 px-2") },
  medium: { fontSize: "0.875rem", ...resolveDot("py-2 px-3") },
  large: { fontSize: "1rem", ...resolveDot("py-3 px-4") },
};

/** Focus ring style */
const ITEM_FOCUS: React.CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 1px var(--color-ring), 0 0 0 3px color-mix(in srgb, var(--color-ring) 30%, transparent)",
};

// --- NavigationContent ---

const CONTENT_BASE: React.CSSProperties = {
  ...resolveDot("mt-4"),
};

// ---------------------------------------------------------------------------
// Props interfaces
// ---------------------------------------------------------------------------

/**
 * Navigation 컴포넌트의 props / Navigation component props
 * @typedef {Object} NavigationProps
 * @property {string} [value] - 제어 모드에서 활성 탭 값 / Active tab value in controlled mode
 * @property {string} [defaultValue] - 비제어 모드에서 기본 활성 탭 값 / Default active tab value in uncontrolled mode
 * @property {(value: string) => void} [onValueChange] - 탭 변경 콜백 / Tab change callback
 * @property {"pills" | "underline" | "cards"} [variant="pills"] - Navigation 스타일 변형 / Navigation style variant
 * @property {"small" | "medium" | "large"} [scale="medium"] - Navigation 크기 / Navigation size
 * @property {string} [dot] - dot 유틸리티 문자열 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>}
 */
export interface NavigationProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "style"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "pills" | "underline" | "cards";
  scale?: "small" | "medium" | "large";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * NavigationList 컴포넌트의 props / NavigationList component props
 * @typedef {Object} NavigationListProps
 * @property {string} [value] - 활성 탭 값 / Active tab value
 * @property {(value: string) => void} [onValueChange] - 탭 변경 콜백 / Tab change callback
 * @property {"pills" | "underline" | "cards"} [variant="pills"] - Navigation 스타일 변형 / Navigation style variant
 * @property {"small" | "medium" | "large"} [scale="medium"] - Navigation 크기 / Navigation size
 * @property {string} [dot] - dot 유틸리티 문자열 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>}
 */
export interface NavigationListProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "style"
> {
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: "pills" | "underline" | "cards";
  scale?: "small" | "medium" | "large";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * NavigationItem 컴포넌트의 props / NavigationItem component props
 * @typedef {Object} NavigationItemProps
 * @property {string} value - 탭 값 / Tab value
 * @property {(value: string) => void} [onValueChange] - 탭 변경 콜백 / Tab change callback
 * @property {"pills" | "underline" | "cards"} [variant] - Navigation 스타일 변형 (자동으로 설정됨) / Navigation style variant (auto-set)
 * @property {"small" | "medium" | "large"} [scale] - Navigation 크기 (자동으로 설정됨) / Navigation size (auto-set)
 * @property {boolean} [active] - 활성 상태 (자동으로 설정됨) / Active state (auto-set)
 * @property {string} [dot] - dot 유틸리티 문자열 / dot utility string
 * @extends {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'>}
 */
export interface NavigationItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "style"
> {
  value: string;
  onValueChange?: (value: string) => void;
  variant?: "pills" | "underline" | "cards";
  scale?: "small" | "medium" | "large";
  active?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * NavigationContent 컴포넌트의 props / NavigationContent component props
 * @typedef {Object} NavigationContentProps
 * @property {string} value - 탭 값 / Tab value
 * @property {boolean} [active] - 활성 상태 (자동으로 설정됨) / Active state (auto-set)
 * @property {string} [dot] - dot 유틸리티 문자열 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>}
 */
export interface NavigationContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "style"
> {
  value: string;
  active?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Navigation (root)
// ---------------------------------------------------------------------------

/**
 * Navigation 컴포넌트 / Navigation component
 *
 * 탭 네비게이션 컴포넌트입니다.
 * NavigationList, NavigationItem, NavigationContent와 함께 사용합니다.
 *
 * Tab navigation component.
 * Used with NavigationList, NavigationItem, and NavigationContent.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Navigation>
 *   <Navigation.List>
 *     <Navigation.Item value="tab1">탭 1</Navigation.Item>
 *     <Navigation.Item value="tab2">탭 2</Navigation.Item>
 *   </Navigation.List>
 *   <Navigation.Content value="tab1">내용 1</Navigation.Content>
 * </Navigation>
 *
 * @param {NavigationProps} props - Navigation 컴포넌트의 props / Navigation component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Navigation 컴포넌트 / Navigation component
 */
const Navigation = React.forwardRef<HTMLDivElement, NavigationProps>(
  (
    {
      dot: dotProp,
      style,
      value,
      defaultValue,
      onValueChange,
      variant = "pills",
      scale = "medium",
      children,
      ...props
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState(value || defaultValue || "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : activeTab;

    const _handleTabChange = (newValue: string) => {
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
      () => mergeStyles(WRAPPER_BASE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    return (
      <div ref={ref} style={computedStyle} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value: currentValue,
              variant,
              scale,
            } as Partial<NavigationListProps | NavigationItemProps>);
          }
          return child;
        })}
      </div>
    );
  },
);
Navigation.displayName = "Navigation";

// ---------------------------------------------------------------------------
// NavigationList
// ---------------------------------------------------------------------------

const NavigationList = React.forwardRef<HTMLDivElement, NavigationListProps>(
  (
    {
      dot: dotProp,
      style,
      value,
      onValueChange: _onValueChange,
      variant = "pills",
      scale = "medium",
      children,
      ...props
    },
    ref,
  ) => {
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          LIST_BASE,
          LIST_VARIANT[variant] ?? LIST_VARIANT.pills,
          LIST_SCALE_GAP[scale] ?? LIST_SCALE_GAP.medium,
          resolveDot(dotProp),
          style,
        ),
      [variant, scale, dotProp, style],
    );

    return (
      <div ref={ref} style={computedStyle} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value,
              variant,
              scale,
            } as Partial<NavigationItemProps>);
          }
          return child;
        })}
      </div>
    );
  },
);
NavigationList.displayName = "NavigationList";

// ---------------------------------------------------------------------------
// NavigationItem
// ---------------------------------------------------------------------------

const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  (
    {
      dot: dotProp,
      style,
      value,
      onValueChange,
      variant = "pills",
      scale = "medium",
      active = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const computedStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          ITEM_BASE,
          ITEM_SCALE[scale] ?? ITEM_SCALE.medium,
          active
            ? (ITEM_ACTIVE[variant] ?? ITEM_ACTIVE.pills)
            : (ITEM_IDLE[variant] ?? ITEM_IDLE.pills),
          isHovered && !active ? ITEM_HOVER_IDLE : undefined,
          isFocused ? ITEM_FOCUS : undefined,
          resolveDot(dotProp),
          style,
        ),
      [variant, scale, active, isHovered, isFocused, dotProp, style],
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onValueChange?.(value);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        style={computedStyle}
        onClick={handleClick}
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
NavigationItem.displayName = "NavigationItem";

// ---------------------------------------------------------------------------
// NavigationContent
// ---------------------------------------------------------------------------

const NavigationContent = React.forwardRef<
  HTMLDivElement,
  NavigationContentProps
>(({ dot: dotProp, style, active = false, ...props }, ref) => {
  if (!active) return null;

  const computedStyle = mergeStyles(CONTENT_BASE, resolveDot(dotProp), style);

  return <div ref={ref} style={computedStyle} {...props} />;
});
NavigationContent.displayName = "NavigationContent";

// ---------------------------------------------------------------------------
// Compound component
// ---------------------------------------------------------------------------

export interface NavigationComponent extends React.ForwardRefExoticComponent<
  NavigationProps & React.RefAttributes<HTMLDivElement>
> {
  List: typeof NavigationList;
  Item: typeof NavigationItem;
  Content: typeof NavigationContent;
}

const NavigationComponent = Navigation as NavigationComponent;
NavigationComponent.List = NavigationList;
NavigationComponent.Item = NavigationItem;
NavigationComponent.Content = NavigationContent;

export {
  NavigationComponent as Navigation,
  NavigationList,
  NavigationItem,
  NavigationContent,
};
