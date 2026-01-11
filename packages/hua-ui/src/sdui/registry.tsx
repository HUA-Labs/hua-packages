"use client";

/**
 * SDUI Component Registry
 *
 * 컴포넌트 타입 문자열 → 실제 React 컴포넌트 매핑
 */

import React, { useState } from "react";
import type { SDUIComponentRegistry } from "./types";
import { cn } from "../lib/utils";

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

// 레이아웃 프리미티브
const Box: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  justify?: "start" | "center" | "end" | "between";
  align?: "start" | "center" | "end" | "stretch";
  // 커스텀 스타일 props (DOM에 직접 전달하지 않음)
  backgroundColor?: string;
  padding?: string | number;
  margin?: string | number;
  borderRadius?: string | number;
  border?: string;
}> = ({
  children,
  justify,
  align,
  className = "",
  style,
  // 커스텀 props 분리 (DOM에 전달 X)
  backgroundColor,
  padding,
  margin,
  borderRadius,
  border,
  ...props
}) => {
  // 커스텀 props를 style 객체로 병합
  const customStyle: React.CSSProperties = {
    ...style,
    ...(backgroundColor && { backgroundColor }),
    ...(padding !== undefined && { padding: typeof padding === 'number' ? `${padding}px` : padding }),
    ...(margin !== undefined && { margin: typeof margin === 'number' ? `${margin}px` : margin }),
    ...(borderRadius !== undefined && { borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius }),
    ...(border && { border }),
  };

  return (
    <div
      className={cn(
        (justify || align) && "flex",
        justify && justifyMap[justify],
        align && alignMap[align],
        className
      )}
      style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Spacer - 공백용 void 컴포넌트
const Spacer: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <div className={className} style={{ width: size, height: size, flexShrink: 0 }} />
);

// 정렬 매핑
const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};
const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const Flex: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  direction?: "row" | "column";
  gap?: number;
  justify?: "start" | "center" | "end" | "between";
  align?: "start" | "center" | "end" | "stretch";
  backgroundColor?: string;
  padding?: string | number;
}> = ({
  children,
  direction = "row",
  gap = 0,
  justify = "start",
  align = "stretch",
  className = "",
  style,
  backgroundColor,
  padding,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    gap: `${gap * 4}px`,
    ...style,
    ...(backgroundColor && { backgroundColor }),
    ...(padding !== undefined && { padding: typeof padding === 'number' ? `${padding}px` : padding }),
  };

  return (
    <div
      className={`flex ${direction === "column" ? "flex-col" : "flex-row"} ${justifyMap[justify]} ${alignMap[align]} ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </div>
  );
};

const Grid: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  cols?: number;
  gap?: number;
  backgroundColor?: string;
  padding?: string | number;
}> = ({
  children,
  cols = 1,
  gap = 4,
  className = "",
  style,
  backgroundColor,
  padding,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gap * 4}px`,
    ...style,
    ...(backgroundColor && { backgroundColor }),
    ...(padding !== undefined && { padding: typeof padding === 'number' ? `${padding}px` : padding }),
  };

  return (
    <div
      className={`grid ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </div>
  );
};

// 텍스트 정렬 매핑
const textAlignMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// 타이포그래피 스타일 props 타입
interface TypographyStyleProps {
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: string;
  letterSpacing?: string;
}

// 타이포그래피 스타일 props를 style 객체로 변환
function getTypographyStyle(props: TypographyStyleProps): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (props.fontSize) style.fontSize = props.fontSize;
  if (props.lineHeight) style.lineHeight = props.lineHeight;
  if (props.fontWeight) style.fontWeight = props.fontWeight;
  if (props.letterSpacing) style.letterSpacing = props.letterSpacing;
  return style;
}

const Text: React.FC<React.HTMLAttributes<HTMLParagraphElement> & {
  variant?: "body" | "muted" | "lead";
  align?: "left" | "center" | "right";
} & TypographyStyleProps> = ({
  children,
  variant = "body",
  align = "center",
  className = "",
  style,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  ...props
}) => {
  const variantClasses = {
    body: "text-foreground",
    muted: "text-muted-foreground text-sm",
    lead: "text-xl text-muted-foreground",
  };
  const typoStyle = getTypographyStyle({ fontSize, lineHeight, fontWeight, letterSpacing });
  const mergedStyle = Object.keys(typoStyle).length > 0 ? { ...style, ...typoStyle } : style;

  return (
    <p
      className={`${variantClasses[variant]} ${textAlignMap[align]} ${className}`}
      style={mergedStyle}
      {...props}
    >
      {children}
    </p>
  );
};

// Heading 컴포넌트들 (정렬 + 타이포그래피 스타일 지원)
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  align?: "left" | "center" | "right";
} & TypographyStyleProps;

const H1: React.FC<HeadingProps> = ({
  children, align = "center", className = "", style,
  fontSize, lineHeight, fontWeight, letterSpacing,
  ...props
}) => {
  const typoStyle = getTypographyStyle({ fontSize, lineHeight, fontWeight, letterSpacing });
  const mergedStyle = Object.keys(typoStyle).length > 0 ? { ...style, ...typoStyle } : style;
  return (
    <h1 className={`text-4xl md:text-5xl font-bold ${textAlignMap[align]} ${className}`} style={mergedStyle} {...props}>{children}</h1>
  );
};

const H2: React.FC<HeadingProps> = ({
  children, align = "center", className = "", style,
  fontSize, lineHeight, fontWeight, letterSpacing,
  ...props
}) => {
  const typoStyle = getTypographyStyle({ fontSize, lineHeight, fontWeight, letterSpacing });
  const mergedStyle = Object.keys(typoStyle).length > 0 ? { ...style, ...typoStyle } : style;
  return (
    <h2 className={`text-3xl md:text-4xl font-bold ${textAlignMap[align]} ${className}`} style={mergedStyle} {...props}>{children}</h2>
  );
};

const H3: React.FC<HeadingProps> = ({
  children, align = "center", className = "", style,
  fontSize, lineHeight, fontWeight, letterSpacing,
  ...props
}) => {
  const typoStyle = getTypographyStyle({ fontSize, lineHeight, fontWeight, letterSpacing });
  const mergedStyle = Object.keys(typoStyle).length > 0 ? { ...style, ...typoStyle } : style;
  return (
    <h3 className={`text-2xl md:text-3xl font-semibold ${textAlignMap[align]} ${className}`} style={mergedStyle} {...props}>{children}</h3>
  );
};

const H4: React.FC<HeadingProps> = ({
  children, align = "center", className = "", style,
  fontSize, lineHeight, fontWeight, letterSpacing,
  ...props
}) => {
  const typoStyle = getTypographyStyle({ fontSize, lineHeight, fontWeight, letterSpacing });
  const mergedStyle = Object.keys(typoStyle).length > 0 ? { ...style, ...typoStyle } : style;
  return (
    <h4 className={`text-xl md:text-2xl font-semibold ${textAlignMap[align]} ${className}`} style={mergedStyle} {...props}>{children}</h4>
  );
};

const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  children,
  href = "#",
  className = "",
  ...props
}) => {
  // 절대 경로 처리: http/https로 시작하지 않으면 그대로, 시작하면 외부 링크
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <a
      href={href}
      className={`text-primary hover:underline ${className}`}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
};

const Image: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = "", alt = "", ...props }) => (
  <img className={`max-w-full h-auto ${className}`} alt={alt} {...props} />
);

// SDUI용 Icon 래퍼 (name을 string으로 받음)
const SDUIIcon: React.FC<{ name?: string; size?: number; className?: string }> = ({
  name = "star",
  size = 24,
  className = "",
}) => <Icon name={name as IconName} size={size} className={className} />;

const Section: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <section className={`py-10 ${className}`} {...props}>
    {children}
  </section>
);

const Divider: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({ className = "", ...props }) => (
  <hr className={`border-border ${className}`} {...props} />
);

// Header - 네비게이션 헤더 (GNB)
const Header: React.FC<React.HTMLAttributes<HTMLElement> & {
  sticky?: boolean;
  transparent?: boolean;
  blur?: boolean;
  overlay?: boolean;
}> = ({
  children,
  sticky = true,
  transparent = false,
  blur = true,
  overlay = false,
  className = "",
  ...props
}) => (
  <header
    className={cn(
      "w-full px-4 py-3 z-50",
      overlay ? "absolute top-0 left-0 right-0" : sticky && "sticky top-0",
      transparent ? "bg-transparent" : "bg-background/80",
      blur && !transparent && "backdrop-blur-md",
      !transparent && "border-b border-border",
      className
    )}
    {...props}
  >
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </header>
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
 * items 배열로 아코디언 생성
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
  className?: string;
}> = ({
  items = [],
  type = "single",
  collapsible = true,
  defaultValue,
  className = "",
}) => {
  return (
    <Accordion
      type={type}
      collapsible={collapsible}
      defaultValue={defaultValue}
      className={className}
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
 * tabs 배열로 탭 생성
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
  className?: string;
}> = ({
  tabs = [],
  defaultValue,
  variant = "default",
  className = "",
}) => {
  const firstValue = tabs[0]?.value || "tab-0";

  return (
    <Tabs
      defaultValue={defaultValue || firstValue}
      variant={variant}
      className={className}
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
