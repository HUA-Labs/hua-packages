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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/Card";
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
    ...(overrides.backgroundColor && { backgroundColor: overrides.backgroundColor }),
    ...(overrides.padding !== undefined && {
      padding: typeof overrides.padding === "number" ? `${overrides.padding}px` : overrides.padding,
    }),
    ...(overrides.margin !== undefined && {
      margin: typeof overrides.margin === "number" ? `${overrides.margin}px` : overrides.margin,
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
    style={buildCustomStyle(style, { backgroundColor, padding, margin, borderRadius, border })}
    {...rest}
  >
    {children}
  </PrimitiveBox>
);

const Spacer: React.FC<{ size?: number; dot?: string }> = ({ size = 16, dot: dotProp }) => (
  <PrimitiveBox dot={buildDot("shrink-0", dotProp)} style={{ width: size, height: size }} />
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
    dot={buildDot("grid", `grid-cols-${cols}`, gap > 0 && `gap-${gap}`, dotProp)}
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
  <hr style={mergeStyles(resolveDot(buildDot("border-border", dotProp)), style)} {...rest} />
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
    style={buildTypoStyle(style, { fontSize, lineHeight, fontWeight, letterSpacing })}
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
    style={buildTypoStyle(style, { fontSize, lineHeight, fontWeight, letterSpacing })}
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
    style={buildTypoStyle(style, { fontSize, lineHeight, fontWeight, letterSpacing })}
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
    style={buildTypoStyle(style, { fontSize, lineHeight, fontWeight, letterSpacing })}
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
    style={buildTypoStyle(style, { fontSize, lineHeight, fontWeight, letterSpacing })}
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
    style={mergeStyles({ maxWidth: "100%", height: "auto" }, resolveDot(dotProp), style)}
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
const SDUICheckbox: React.FC<CheckboxProps> = ({ defaultChecked = false, onChange, ...props }) => {
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
const SDUISwitch: React.FC<SwitchProps> = ({ defaultChecked = false, onChange, ...props }) => {
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
const SDUIInput: React.FC<InputProps> = ({ defaultValue = "", onChange, ...props }) => {
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
const SDUITextarea: React.FC<TextareaProps> = ({ defaultValue = "", onChange, resize = "vertical", ...props }) => {
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
}> = ({
  items = [],
  type = "single",
  collapsible = true,
  defaultValue,
}) => {
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
}> = ({
  tabs = [],
  defaultValue,
  variant = "default",
}) => {
  const firstValue = tabs[0]?.value || "tab-0";

  return (
    <Tabs
      defaultValue={defaultValue || firstValue}
      variant={variant}
    >
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
};

/**
 * 레지스트리 확장 헬퍼
 */
export function extendRegistry(
  customComponents: SDUIComponentRegistry
): SDUIComponentRegistry {
  return {
    ...defaultRegistry,
    ...customComponents,
  };
}

/**
 * 컴포넌트 존재 여부 확인
 */
export function hasComponent(registry: SDUIComponentRegistry, type: string): boolean {
  return type in registry;
}
