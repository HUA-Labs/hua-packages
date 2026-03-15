"use client";

/**
 * SDUI Component Registry
 *
 * 컴포넌트 타입 문자열 → 실제 React 컴포넌트 매핑
 * dot 기반 cross-platform 스타일링
 */

import React, { useState } from "react";
import type { SDUIComponentRegistry } from "./types";
import { resolveDot, mergeStyles } from "../hooks/useDotMap";

// hua-ui primitives (dot 지원)
import { Box as PrimitiveBox } from "../components/Box";
import { Text as PrimitiveText } from "../components/Text";

// 기본 컴포넌트들
import { Button } from "../components/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/Card";
import { Badge } from "../components/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/Avatar";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Label } from "../components/Label";
import { Checkbox, type CheckboxProps } from "../components/Checkbox";
import { Switch, type SwitchProps } from "../components/Switch";
import { type InputProps } from "../components/Input";
import { type TextareaProps } from "../components/Textarea";
import { Skeleton } from "../components/Skeleton";
import { Progress } from "../components/Progress";
import { Alert } from "../components/Alert";
import { Icon } from "../components/Icon";
import type { IconName } from "../lib/icons";

// Advanced 컴포넌트들
import { HeroSection } from "../components/HeroSection";
import { ScrollProgress } from "../components/ScrollProgress";

// Batch A1 — Layout
import { Stack } from "../components/Stack";
import { Panel } from "../components/Panel";
import { SectionHeader } from "../components/SectionHeader";
import { ComponentLayout } from "../components/ComponentLayout";
import { Pressable } from "../components/Pressable";

// Batch A2 — Navigation
import { Breadcrumb } from "../components/Breadcrumb";
import { Pagination } from "../components/Pagination";
import { Navigation } from "../components/Navigation";
import { PageNavigation } from "../components/PageNavigation";
import { DotNav } from "../components/advanced/DotNav";
import type { DotNavItem } from "../components/advanced/DotNav";

// Batch A3 — Display
import { FeatureCard } from "../components/FeatureCard";
import { InfoCard } from "../components/InfoCard";
import { StatsPanel } from "../components/StatsPanel";
import type { StatsPanelItem } from "../components/StatsPanel";
import { LanguageToggle } from "../components/LanguageToggle";
import { ThemeToggle } from "../components/ThemeToggle";

// Batch A4 — Overlay
import { Modal } from "../components/Modal";
import { Tooltip } from "../components/Tooltip";
import { Popover } from "../components/Popover";
import { Drawer } from "../components/Drawer";
import { BottomSheet } from "../components/BottomSheet";

// Interactive 컴포넌트들
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/Accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";

// ── Helpers ──────────────────────────────────────────────

/** dot 토큰 조합 (falsy 자동 필터) */
function buildDot(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

const justifyDot: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};
const alignDot: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};
const textAlignDot: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/** 임의값 style props → CSSProperties */
function buildCustomStyle(
  base: React.CSSProperties | undefined,
  overrides: {
    backgroundColor?: string;
    padding?: string | number;
    margin?: string | number;
    borderRadius?: string | number;
    border?: string;
  },
): React.CSSProperties | undefined {
  const s: React.CSSProperties = {
    ...base,
    ...(overrides.backgroundColor && {
      backgroundColor: overrides.backgroundColor,
    }),
    ...(overrides.padding !== undefined && {
      padding:
        typeof overrides.padding === "number"
          ? `${overrides.padding}px`
          : overrides.padding,
    }),
    ...(overrides.margin !== undefined && {
      margin:
        typeof overrides.margin === "number"
          ? `${overrides.margin}px`
          : overrides.margin,
    }),
    ...(overrides.borderRadius !== undefined && {
      borderRadius:
        typeof overrides.borderRadius === "number"
          ? `${overrides.borderRadius}px`
          : overrides.borderRadius,
    }),
    ...(overrides.border && { border: overrides.border }),
  };
  return Object.keys(s).length > 0 ? s : undefined;
}

/** 타이포그래피 style props */
interface TypographyStyleProps {
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: string;
  letterSpacing?: string;
}

function buildTypoStyle(
  base: React.CSSProperties | undefined,
  t: TypographyStyleProps,
): React.CSSProperties | undefined {
  const extra: React.CSSProperties = {};
  if (t.fontSize) extra.fontSize = t.fontSize;
  if (t.lineHeight) extra.lineHeight = t.lineHeight;
  if (t.fontWeight) extra.fontWeight = t.fontWeight;
  if (t.letterSpacing) extra.letterSpacing = t.letterSpacing;
  if (Object.keys(extra).length === 0) return base;
  return base ? { ...base, ...extra } : extra;
}

// ── Layout ──────────────────────────────────────────────

const Box: React.FC<{
  justify?: "start" | "center" | "end" | "between";
  align?: "start" | "center" | "end" | "stretch";
  backgroundColor?: string;
  padding?: string | number;
  margin?: string | number;
  borderRadius?: string | number;
  border?: string;
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  children,
  justify,
  align,
  style,
  backgroundColor,
  padding,
  margin,
  borderRadius,
  border,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveBox
    dot={buildDot(
      (justify || align) && "flex",
      justify && justifyDot[justify],
      align && alignDot[align],
      dotProp,
    )}
    style={buildCustomStyle(style, {
      backgroundColor,
      padding,
      margin,
      borderRadius,
      border,
    })}
    {...rest}
  >
    {children}
  </PrimitiveBox>
);

const Spacer: React.FC<{ size?: number; dot?: string }> = ({
  size = 16,
  dot: dotProp,
}) => (
  <PrimitiveBox
    dot={buildDot("shrink-0", dotProp)}
    style={{ width: size, height: size }}
  />
);

const Flex: React.FC<{
  direction?: "row" | "column";
  gap?: number;
  justify?: "start" | "center" | "end" | "between";
  align?: "start" | "center" | "end" | "stretch";
  backgroundColor?: string;
  padding?: string | number;
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  children,
  direction = "row",
  gap = 0,
  justify = "start",
  align = "stretch",
  style,
  backgroundColor,
  padding,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveBox
    dot={buildDot(
      "flex",
      direction === "column" && "flex-col",
      gap > 0 && `gap-${gap}`,
      justifyDot[justify],
      alignDot[align],
      dotProp,
    )}
    style={buildCustomStyle(style, { backgroundColor, padding })}
    {...rest}
  >
    {children}
  </PrimitiveBox>
);

const Grid: React.FC<{
  cols?: number;
  gap?: number;
  backgroundColor?: string;
  padding?: string | number;
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  children,
  cols = 1,
  gap = 4,
  style,
  backgroundColor,
  padding,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveBox
    dot={buildDot(
      "grid",
      `grid-cols-${cols}`,
      gap > 0 && `gap-${gap}`,
      dotProp,
    )}
    style={buildCustomStyle(style, { backgroundColor, padding })}
    {...rest}
  >
    {children}
  </PrimitiveBox>
);

const Section: React.FC<{
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ children, dot: dotProp, ...rest }) => (
  <PrimitiveBox as="section" dot={buildDot("py-10", dotProp)} {...rest}>
    {children}
  </PrimitiveBox>
);

const Divider: React.FC<{
  dot?: string;
  style?: React.CSSProperties;
}> = ({ dot: dotProp, style, ...rest }) => (
  <hr
    style={mergeStyles(resolveDot(buildDot("border-border", dotProp)), style)}
    {...rest}
  />
);

// ── Typography ──────────────────────────────────────────

const variantDotMap: Record<string, string> = {
  body: "text-foreground",
  muted: "text-muted-foreground text-sm",
  lead: "text-xl text-muted-foreground",
};

const Text: React.FC<
  {
    variant?: "body" | "muted" | "lead";
    align?: "left" | "center" | "right";
    dot?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  } & TypographyStyleProps
> = ({
  children,
  variant = "body",
  align = "center",
  style,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveText
    as="p"
    dot={buildDot(variantDotMap[variant], textAlignDot[align], dotProp)}
    style={buildTypoStyle(style, {
      fontSize,
      lineHeight,
      fontWeight,
      letterSpacing,
    })}
    {...rest}
  >
    {children}
  </PrimitiveText>
);

type HeadingProps = {
  align?: "left" | "center" | "right";
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & TypographyStyleProps;

const H1: React.FC<HeadingProps> = ({
  children,
  align = "center",
  style,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveText
    as="h1"
    dot={buildDot("text-4xl font-bold", textAlignDot[align], dotProp)}
    style={buildTypoStyle(style, {
      fontSize,
      lineHeight,
      fontWeight,
      letterSpacing,
    })}
    {...rest}
  >
    {children}
  </PrimitiveText>
);

const H2: React.FC<HeadingProps> = ({
  children,
  align = "center",
  style,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveText
    as="h2"
    dot={buildDot("text-3xl font-bold", textAlignDot[align], dotProp)}
    style={buildTypoStyle(style, {
      fontSize,
      lineHeight,
      fontWeight,
      letterSpacing,
    })}
    {...rest}
  >
    {children}
  </PrimitiveText>
);

const H3: React.FC<HeadingProps> = ({
  children,
  align = "center",
  style,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveText
    as="h3"
    dot={buildDot("text-2xl font-semibold", textAlignDot[align], dotProp)}
    style={buildTypoStyle(style, {
      fontSize,
      lineHeight,
      fontWeight,
      letterSpacing,
    })}
    {...rest}
  >
    {children}
  </PrimitiveText>
);

const H4: React.FC<HeadingProps> = ({
  children,
  align = "center",
  style,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  dot: dotProp,
  ...rest
}) => (
  <PrimitiveText
    as="h4"
    dot={buildDot("text-xl font-semibold", textAlignDot[align], dotProp)}
    style={buildTypoStyle(style, {
      fontSize,
      lineHeight,
      fontWeight,
      letterSpacing,
    })}
    {...rest}
  >
    {children}
  </PrimitiveText>
);

const Link: React.FC<{
  href?: string;
  target?: string;
  rel?: string;
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ children, href = "#", dot: dotProp, style, ...rest }) => {
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  return (
    <a
      href={href}
      style={mergeStyles(resolveDot(buildDot("text-primary", dotProp)), style)}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
};

const Image: React.FC<{
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  dot?: string;
  style?: React.CSSProperties;
}> = ({ alt = "", dot: dotProp, style, ...rest }) => (
  <img
    alt={alt}
    style={mergeStyles(
      { maxWidth: "100%", height: "auto" },
      resolveDot(dotProp),
      style,
    )}
    {...rest}
  />
);

// SDUI용 Icon 래퍼
const SDUIIcon: React.FC<{ name?: string; size?: number }> = ({
  name = "star",
  size = 24,
}) => <Icon name={name as IconName} size={size} />;

// ── Advanced ────────────────────────────────────────────

const Header: React.FC<{
  sticky?: boolean;
  transparent?: boolean;
  blur?: boolean;
  overlay?: boolean;
  dot?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  children,
  sticky = true,
  transparent = false,
  blur = true,
  overlay = false,
  dot: dotProp,
  style,
  ...rest
}) => (
  <PrimitiveBox
    as="header"
    dot={buildDot(
      "w-full px-4 py-3 z-50",
      overlay
        ? "absolute top-0 left-0 right-0"
        : sticky
          ? "sticky top-0"
          : undefined,
      transparent ? "bg-transparent" : "bg-background/80",
      blur && !transparent && "backdrop-blur-md",
      !transparent && "border-b border-border",
      dotProp,
    )}
    style={style}
    {...rest}
  >
    <PrimitiveBox dot="max-w-7xl mx-auto">{children}</PrimitiveBox>
  </PrimitiveBox>
);

/**
 * SDUI용 Uncontrolled 래퍼 컴포넌트들
 * 프리뷰에서 인터랙션이 동작하도록 자체 상태 관리
 */

// Uncontrolled Checkbox - 클릭하면 상태 토글
const SDUICheckbox: React.FC<CheckboxProps> = ({
  defaultChecked = false,
  onChange,
  ...props
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Checkbox
      {...props}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked);
        onChange?.(e);
      }}
    />
  );
};

// Uncontrolled Switch - 클릭하면 상태 토글
const SDUISwitch: React.FC<SwitchProps> = ({
  defaultChecked = false,
  onChange,
  ...props
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Switch
      {...props}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked);
        onChange?.(e);
      }}
    />
  );
};

// Uncontrolled Input - 자체 상태 관리
const SDUIInput: React.FC<InputProps> = ({
  defaultValue = "",
  onChange,
  ...props
}) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
    />
  );
};

// Uncontrolled Textarea - 자체 상태 관리 + resize 지원
const SDUITextarea: React.FC<TextareaProps> = ({
  defaultValue = "",
  onChange,
  resize = "vertical",
  ...props
}) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <Textarea
      {...props}
      resize={resize}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
    />
  );
};

/**
 * SDUI용 간단한 Accordion - 데이터 기반
 */
interface SimpleAccordionItem {
  title: string;
  content: string;
  value?: string;
}

const SDUIAccordion: React.FC<{
  items?: SimpleAccordionItem[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
}> = ({ items = [], type = "single", collapsible = true, defaultValue }) => {
  return (
    <Accordion
      type={type}
      collapsible={collapsible}
      defaultValue={defaultValue}
    >
      {items.map((item, index) => {
        const value = item.value || `item-${index}`;
        return (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

/**
 * SDUI용 간단한 Tabs - 데이터 기반
 */
interface SimpleTabItem {
  label: string;
  content: string;
  value?: string;
}

const SDUITabs: React.FC<{
  tabs?: SimpleTabItem[];
  defaultValue?: string;
  variant?: "default" | "pills" | "underline" | "cards";
}> = ({ tabs = [], defaultValue, variant = "default" }) => {
  const firstValue = tabs[0]?.value || "tab-0";

  return (
    <Tabs defaultValue={defaultValue || firstValue} variant={variant}>
      <TabsList>
        {tabs.map((tab, index) => {
          const value = tab.value || `tab-${index}`;
          return (
            <TabsTrigger key={value} value={value}>
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab, index) => {
        const value = tab.value || `tab-${index}`;
        return (
          <TabsContent key={value} value={value}>
            {tab.content}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

// ── Batch A1 — Layout SDUI wrappers ─────────────────────────────────────────

const SDUIStack: React.FC<{
  direction?: "vertical" | "horizontal";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  direction = "vertical",
  spacing = "md",
  align = "start",
  justify = "start",
  wrap = false,
  dot: dotProp,
  ...rest
}) => (
  <Stack
    direction={direction}
    spacing={spacing}
    align={align}
    justify={justify}
    wrap={wrap}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  >
    {children}
  </Stack>
);

const SDUIPanel: React.FC<{
  style?:
    | "default"
    | "solid"
    | "glass"
    | "outline"
    | "elevated"
    | "neon"
    | "holographic"
    | "cyberpunk"
    | "minimal"
    | "luxury";
  effect?: "none" | "glow" | "shadow" | "gradient" | "animated";
  padding?:
    | "none"
    | "small"
    | "sm"
    | "medium"
    | "md"
    | "large"
    | "lg"
    | "xl"
    | "custom";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | "custom";
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  style: panelStyle = "default",
  effect = "none",
  padding = "md",
  rounded = "lg",
  dot: dotProp,
  ...rest
}) => (
  <Panel
    style={panelStyle}
    effect={effect}
    padding={padding}
    rounded={rounded}
    dot={dotProp}
    {...(rest as Omit<React.HTMLAttributes<HTMLDivElement>, "style">)}
  >
    {children}
  </Panel>
);

const SDUISectionHeader: React.FC<{
  title?: string;
  description?: string;
  dot?: string;
  [key: string]: unknown;
}> = ({ title = "Section", description, dot: dotProp, ...rest }) => (
  <SectionHeader
    title={title}
    description={description}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  />
);

const SDUIComponentLayout: React.FC<{
  title?: string;
  description?: string;
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  title = "Component",
  description = "",
  dot: dotProp,
  ...rest
}) => (
  <ComponentLayout
    title={title}
    description={description}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  >
    {children}
  </ComponentLayout>
);

const SDUIPressable: React.FC<{
  dot?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({ children, dot: dotProp, disabled, ...rest }) => (
  <Pressable
    dot={dotProp}
    disabled={disabled}
    {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
  >
    {children}
  </Pressable>
);

// ── Batch A2 — Navigation SDUI wrappers ─────────────────────────────────────

const SDUIBreadcrumb: React.FC<{
  items?: Array<{ label: string; href?: string }>;
  showHomeIcon?: boolean;
  variant?: "default" | "subtle" | "transparent" | "glass";
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  items,
  showHomeIcon,
  variant = "default",
  dot: dotProp,
  children,
  ...rest
}) => (
  <Breadcrumb
    items={items}
    showHomeIcon={showHomeIcon}
    variant={variant}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  >
    {children}
  </Breadcrumb>
);

const SDUIPagination: React.FC<{
  totalPages?: number;
  variant?: "default" | "outlined" | "minimal";
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  dot?: string;
  [key: string]: unknown;
}> = ({
  totalPages = 10,
  variant = "default",
  size = "md",
  shape = "square",
  dot: dotProp,
  ...rest
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      variant={variant}
      size={size}
      shape={shape}
      dot={dotProp}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    />
  );
};

const SDUINavigation: React.FC<{
  defaultValue?: string;
  variant?: "pills" | "underline" | "cards";
  scale?: "small" | "medium" | "large";
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  defaultValue,
  variant = "pills",
  scale = "medium",
  dot: dotProp,
  ...rest
}) => (
  <Navigation
    defaultValue={defaultValue}
    variant={variant}
    scale={scale}
    dot={dotProp}
    {...(rest as Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue">)}
  >
    {children}
  </Navigation>
);

const SDUIPageNavigation: React.FC<{
  prevPage?: { title: string; href: string };
  nextPage?: { title: string; href: string };
  showOnMobile?: boolean;
  dot?: string;
  [key: string]: unknown;
}> = ({ prevPage, nextPage, showOnMobile = true, dot: dotProp, ...rest }) => (
  <PageNavigation
    prevPage={prevPage}
    nextPage={nextPage}
    showOnMobile={showOnMobile}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  />
);

const SDUIDotNav: React.FC<{
  items?: DotNavItem[];
  position?: "left" | "right";
  dot?: string;
  [key: string]: unknown;
}> = ({ items = [], position = "right", dot: dotProp, ...rest }) => (
  <DotNav
    items={items}
    position={position}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLElement>)}
  />
);

// ── Batch A3 — Display SDUI wrappers ────────────────────────────────────────

const SDUIFeatureCard: React.FC<{
  title?: string;
  description?: string;
  icon?: string;
  variant?: "default" | "gradient" | "glass" | "neon";
  size?: "sm" | "md" | "lg";
  hover?: "scale" | "glow" | "slide" | "none";
  gradient?: "blue" | "purple" | "green" | "orange" | "pink" | "custom";
  dot?: string;
  [key: string]: unknown;
}> = ({
  title = "Feature",
  description = "",
  icon,
  variant = "default",
  size = "md",
  hover = "scale",
  gradient = "blue",
  dot: dotProp,
  ...rest
}) => (
  <FeatureCard
    title={title}
    description={description}
    icon={icon as Parameters<typeof FeatureCard>[0]["icon"]}
    variant={variant}
    size={size}
    hover={hover}
    gradient={gradient}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  />
);

const SDUIInfoCard: React.FC<{
  title?: string;
  icon?: string;
  tone?: "blue" | "purple" | "green" | "orange";
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  title = "Info",
  icon = "info",
  tone = "blue",
  dot: dotProp,
  ...rest
}) => (
  <InfoCard
    title={title}
    icon={icon as Parameters<typeof InfoCard>[0]["icon"]}
    tone={tone}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  >
    {children}
  </InfoCard>
);

const SDUIStatsPanel: React.FC<{
  title?: string;
  items?: StatsPanelItem[];
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
  dot?: string;
  [key: string]: unknown;
}> = ({
  title,
  items = [],
  columns = 4,
  loading = false,
  dot: dotProp,
  ...rest
}) => (
  <StatsPanel
    title={title}
    items={items}
    columns={columns}
    loading={loading}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  />
);

const SDUILanguageToggle: React.FC<{
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon" | "dropdown";
  showLabel?: boolean;
  currentLanguage?: string;
  dot?: string;
  [key: string]: unknown;
}> = ({
  size = "md",
  variant = "button",
  showLabel = false,
  currentLanguage = "ko",
  dot: dotProp,
  ...rest
}) => {
  const [lang, setLang] = useState(currentLanguage);
  return (
    <LanguageToggle
      size={size}
      variant={variant}
      showLabel={showLabel}
      currentLanguage={lang}
      onLanguageChange={setLang}
      dot={dotProp}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    />
  );
};

const SDUIThemeToggle: React.FC<{
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon" | "switch";
  showLabel?: boolean;
  dot?: string;
  [key: string]: unknown;
}> = ({
  size = "md",
  variant = "button",
  showLabel = false,
  dot: dotProp,
  ...rest
}) => (
  <ThemeToggle
    size={size}
    variant={variant}
    showLabel={showLabel}
    dot={dotProp}
    {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
  />
);

// ── Batch A4 — Overlay SDUI wrappers ────────────────────────────────────────

const SDUIModal: React.FC<{
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  triggerLabel?: string;
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  title,
  description,
  size = "md",
  triggerLabel = "Open Modal",
  dot: dotProp,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { style: restStyle, ...restWithoutStyle } =
    rest as React.HTMLAttributes<HTMLDivElement>;
  return (
    <div {...restWithoutStyle} style={{ display: "contents", ...restStyle }}>
      <button
        onClick={() => setIsOpen(true)}
        style={mergeStyles(
          resolveDot(
            "inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer border-none",
          ),
          {},
        )}
      >
        {triggerLabel}
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        size={size}
        dot={dotProp}
      >
        {children}
      </Modal>
    </div>
  );
};

const SDUITooltip: React.FC<{
  content?: string;
  position?: "top" | "bottom" | "left" | "right";
  variant?: "default" | "light" | "dark";
  delay?: number;
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  content = "Tooltip",
  position = "top",
  variant = "default",
  delay = 300,
  dot: dotProp,
  ...rest
}) => (
  <Tooltip
    content={content}
    position={position}
    variant={variant}
    delay={delay}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  >
    {children}
  </Tooltip>
);

const SDUIPopover: React.FC<{
  triggerLabel?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  triggerLabel = "Open",
  position = "bottom",
  align = "center",
  dot: dotProp,
  ...rest
}) => (
  <Popover
    trigger={
      <button
        style={mergeStyles(
          resolveDot(
            "inline-flex items-center justify-center px-3 py-2 rounded-md border border-border bg-background text-sm cursor-pointer",
          ),
          {},
        )}
      >
        {triggerLabel}
      </button>
    }
    position={position}
    align={align}
    dot={dotProp}
    {...(rest as React.HTMLAttributes<HTMLDivElement>)}
  >
    {children}
  </Popover>
);

const SDUIDrawer: React.FC<{
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  triggerLabel?: string;
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  side = "right",
  size = "md",
  triggerLabel = "Open Drawer",
  dot: dotProp,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { style: restStyle, ...restWithoutStyle } =
    rest as React.HTMLAttributes<HTMLDivElement>;
  return (
    <div {...restWithoutStyle} style={{ display: "contents", ...restStyle }}>
      <button
        onClick={() => setIsOpen(true)}
        style={mergeStyles(
          resolveDot(
            "inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer border-none",
          ),
          {},
        )}
      >
        {triggerLabel}
      </button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        side={side}
        size={size}
        dot={dotProp}
      >
        {children}
      </Drawer>
    </div>
  );
};

const SDUIBottomSheet: React.FC<{
  height?: "sm" | "md" | "lg" | "xl" | "full";
  triggerLabel?: string;
  showDragHandle?: boolean;
  dot?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({
  children,
  height = "md",
  triggerLabel = "Open Sheet",
  showDragHandle = true,
  dot: dotProp,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { style: restStyle, ...restWithoutStyle } =
    rest as React.HTMLAttributes<HTMLDivElement>;
  return (
    <div {...restWithoutStyle} style={{ display: "contents", ...restStyle }}>
      <button
        onClick={() => setIsOpen(true)}
        style={mergeStyles(
          resolveDot(
            "inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer border-none",
          ),
          {},
        )}
      >
        {triggerLabel}
      </button>
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        height={height}
        showDragHandle={showDragHandle}
        dot={dotProp}
      >
        {children}
      </BottomSheet>
    </div>
  );
};

/**
 * 기본 컴포넌트 레지스트리
 */
export const defaultRegistry: SDUIComponentRegistry = {
  // 레이아웃
  Box,
  Spacer,
  Flex,
  Grid,
  Section,
  Container,
  Divider,

  // 타이포그래피
  Text,
  H1,
  H2,
  H3,
  H4,
  Link,

  // 미디어
  Image,
  Icon: SDUIIcon,

  // 기본 UI
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Input: SDUIInput,
  Textarea: SDUITextarea,
  Label,
  Checkbox: SDUICheckbox,
  Switch: SDUISwitch,
  Skeleton,
  Progress,

  // 카드
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,

  // 피드백
  Alert,

  // Advanced (Pro)
  Header,
  HeroSection,
  ScrollProgress,

  // Interactive (Pro)
  Accordion: SDUIAccordion,
  Tabs: SDUITabs,

  // Batch A1 — Layout
  Stack: SDUIStack,
  Panel: SDUIPanel,
  SectionHeader: SDUISectionHeader,
  ComponentLayout: SDUIComponentLayout,
  Pressable: SDUIPressable,

  // Batch A2 — Navigation
  Breadcrumb: SDUIBreadcrumb,
  Pagination: SDUIPagination,
  Navigation: SDUINavigation,
  PageNavigation: SDUIPageNavigation,
  DotNav: SDUIDotNav,

  // Batch A3 — Display
  FeatureCard: SDUIFeatureCard,
  InfoCard: SDUIInfoCard,
  StatsPanel: SDUIStatsPanel,
  LanguageToggle: SDUILanguageToggle,
  ThemeToggle: SDUIThemeToggle,

  // Batch A4 — Overlay
  Modal: SDUIModal,
  Tooltip: SDUITooltip,
  Popover: SDUIPopover,
  Drawer: SDUIDrawer,
  BottomSheet: SDUIBottomSheet,
};

/**
 * 레지스트리 확장 헬퍼
 */
export function extendRegistry(
  customComponents: SDUIComponentRegistry,
): SDUIComponentRegistry {
  return {
    ...defaultRegistry,
    ...customComponents,
  };
}

/**
 * 컴포넌트 존재 여부 확인
 */
export function hasComponent(
  registry: SDUIComponentRegistry,
  type: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(registry, type);
}
