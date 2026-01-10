"use client";

/**
 * SDUI Component Registry
 *
 * 컴포넌트 타입 문자열 → 실제 React 컴포넌트 매핑
 */

import React from "react";
import type { SDUIComponentRegistry } from "./types";

// 기본 컴포넌트들
import { Button } from "../components/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/Card";
import { Badge } from "../components/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/Avatar";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Label } from "../components/Label";
import { Checkbox } from "../components/Checkbox";
import { Switch } from "../components/Switch";
import { Skeleton } from "../components/Skeleton";
import { Progress } from "../components/Progress";
import { Alert } from "../components/Alert";

// Advanced 컴포넌트들
import { HeroSection } from "../components/HeroSection";
import { ScrollProgress } from "../components/ScrollProgress";

// 레이아웃 프리미티브
const Box: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const Flex: React.FC<React.HTMLAttributes<HTMLDivElement> & { direction?: "row" | "column"; gap?: number }> = ({
  children,
  direction = "row",
  gap = 0,
  className = "",
  style,
  ...props
}) => (
  <div
    className={`flex ${direction === "column" ? "flex-col" : "flex-row"} ${className}`}
    style={{ gap: `${gap * 4}px`, ...style }}
    {...props}
  >
    {children}
  </div>
);

const Grid: React.FC<React.HTMLAttributes<HTMLDivElement> & { cols?: number; gap?: number }> = ({
  children,
  cols = 1,
  gap = 4,
  className = "",
  style,
  ...props
}) => (
  <div
    className={`grid ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap * 4}px`, ...style }}
    {...props}
  >
    {children}
  </div>
);

const Text: React.FC<React.HTMLAttributes<HTMLParagraphElement> & { variant?: "body" | "muted" | "lead" }> = ({
  children,
  variant = "body",
  className = "",
  ...props
}) => {
  const variantClasses = {
    body: "text-foreground",
    muted: "text-muted-foreground text-sm",
    lead: "text-xl text-muted-foreground",
  };
  return (
    <p className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

// Heading 컴포넌트들 (level별로 분리)
const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h1 className={`text-4xl md:text-5xl font-bold ${className}`} {...props}>{children}</h1>
);
const H2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h2 className={`text-3xl md:text-4xl font-bold ${className}`} {...props}>{children}</h2>
);
const H3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h3 className={`text-2xl md:text-3xl font-semibold ${className}`} {...props}>{children}</h3>
);
const H4: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h4 className={`text-xl md:text-2xl font-semibold ${className}`} {...props}>{children}</h4>
);

const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, className = "", ...props }) => (
  <a className={`text-primary hover:underline ${className}`} {...props}>
    {children}
  </a>
);

const Image: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = "", alt = "", ...props }) => (
  <img className={`max-w-full h-auto ${className}`} alt={alt} {...props} />
);

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

/**
 * 기본 컴포넌트 레지스트리
 */
export const defaultRegistry: SDUIComponentRegistry = {
  // 레이아웃
  Box,
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

  // 기본 UI
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Input,
  Textarea,
  Label,
  Checkbox,
  Switch,
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
  HeroSection,
  ScrollProgress,
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
