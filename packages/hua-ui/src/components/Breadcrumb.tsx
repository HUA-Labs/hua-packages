"use client";

import React from "react";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

/**
 * Breadcrumb 항목 타입 / Breadcrumb item type
 */
export interface BreadcrumbItemData {
  label: string;
  href?: string;
  icon?: IconName;
}

/**
 * Breadcrumb 컴포넌트의 props / Breadcrumb component props
 * @typedef {Object} BreadcrumbProps
 * @property {React.ReactNode} [children] - BreadcrumbItem 컴포넌트들 / BreadcrumbItem components
 * @property {BreadcrumbItemData[]} [items] - Breadcrumb 항목 배열 (children 대신 사용 가능) / Breadcrumb items array (alternative to children)
 * @property {number} [maxItems] - 최대 표시할 항목 수 (긴 경로 처리) / Maximum number of items to display (for long paths)
 * @property {boolean} [showHomeIcon] - 홈 아이콘 표시 여부 / Show home icon
 * @property {string} [homeLabel] - 홈 라벨 (기본: "Home") / Home label (default: "Home")
 * @property {React.ReactNode} [separator] - 항목 사이 구분자 (기본: chevronRight 아이콘) / Separator between items (default: chevronRight icon)
 * @property {'default' | 'subtle' | 'transparent' | 'glass'} [variant='default'] - Breadcrumb 스타일 변형 / Breadcrumb style variant
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface BreadcrumbProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  children?: React.ReactNode;
  items?: BreadcrumbItemData[];
  maxItems?: number;
  showHomeIcon?: boolean;
  homeLabel?: string;
  separator?: React.ReactNode;
  variant?: "default" | "subtle" | "transparent" | "glass";
  /** dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style) */
  dot?: string;
  /** 추가 인라인 스타일 / Additional inline style */
  style?: React.CSSProperties;
}

/**
 * BreadcrumbItem 컴포넌트의 props / BreadcrumbItem component props
 * @typedef {Object} BreadcrumbItemProps
 * @property {string} [href] - 링크 URL (없으면 일반 텍스트) / Link URL (plain text if not provided)
 * @property {boolean} [isCurrent=false] - 현재 페이지 여부 / Current page indicator
 * @property {React.ReactNode} children - 항목 텍스트 / Item text
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
export interface BreadcrumbItemProps {
  href?: string;
  isCurrent?: boolean;
  children: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * Breadcrumb 컴포넌트 / Breadcrumb component
 *
 * 네비게이션 경로를 표시하는 breadcrumb 컴포넌트입니다.
 * 현재 위치와 경로를 시각적으로 표현합니다.
 *
 * Breadcrumb component for displaying navigation paths.
 * Visually represents current location and path.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Breadcrumb>
 *   <BreadcrumbItem href="/">홈</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">상품</BreadcrumbItem>
 *   <BreadcrumbItem isCurrent>상세</BreadcrumbItem>
 * </Breadcrumb>
 *
 * @example
 * // 커스텀 구분자 / Custom separator
 * <Breadcrumb separator={<span>/</span>}>
 *   <BreadcrumbItem href="/">홈</BreadcrumbItem>
 *   <BreadcrumbItem isCurrent>현재</BreadcrumbItem>
 * </Breadcrumb>
 *
 * @param {BreadcrumbProps} props - Breadcrumb 컴포넌트의 props / Breadcrumb component props
 * @param {React.Ref<HTMLDivElement>} ref - nav 요소 ref / nav element ref
 * @returns {JSX.Element} Breadcrumb 컴포넌트 / Breadcrumb component
 */
const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  (
    {
      children,
      items,
      maxItems,
      showHomeIcon,
      homeLabel = "Home",
      separator = (
        <Icon
          name="chevronRight"
          dot="w-3 h-3 text-muted-foreground flex-shrink-0"
        />
      ),
      variant = "default",
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.875rem",
        width: "fit-content",
      },
      subtle: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.75rem",
        backgroundColor:
          "color-mix(in srgb, var(--color-background) 40%, transparent)",
        backdropFilter: "blur(12px)",
        ...resolveDot("rounded-md py-2 px-3"),
        border:
          "1px solid color-mix(in srgb, var(--color-border) 30%, transparent)",
        width: "fit-content",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      },
      transparent: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.75rem",
        width: "fit-content",
      },
      glass: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.75rem",
        backgroundColor:
          "color-mix(in srgb, var(--color-background) 30%, transparent)",
        backdropFilter: "blur(16px)",
        ...resolveDot("rounded-lg py-2 px-4"),
        border:
          "1px solid color-mix(in srgb, var(--color-border) 25%, transparent)",
        width: "fit-content",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      },
    };

    // items prop이 있으면 BreadcrumbItem으로 변환
    const renderItems = () => {
      if (items) {
        let displayItems = [...items];

        // maxItems 처리
        if (maxItems && displayItems.length > maxItems) {
          const firstItem = displayItems[0];
          const lastItems = displayItems.slice(-(maxItems - 1));
          displayItems = [
            firstItem,
            { label: "...", href: undefined },
            ...lastItems,
          ];
        }

        // 마지막 항목은 isCurrent로 표시
        return displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCurrent = isLast && !item.href;

          return (
            <BreadcrumbItem key={index} href={item.href} isCurrent={isCurrent}>
              {item.icon && <Icon name={item.icon} dot="w-4 h-4 mr-1" />}
              {item.label}
            </BreadcrumbItem>
          );
        });
      }

      // children이 있으면 그대로 사용
      if (children) {
        return React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return (
              <li key={index} style={{ display: "flex", alignItems: "center" }}>
                {child}
                {index < React.Children.count(children) - 1 && (
                  <span
                    style={{
                      ...resolveDot("mx-3"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-muted-foreground)",
                    }}
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          }
          return child;
        });
      }

      return null;
    };

    const renderedItems = renderItems();
    const itemsCount = items
      ? items.length
      : children
        ? React.Children.count(children)
        : 0;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        style={mergeStyles(variantStyles[variant], resolveDot(dotProp), style)}
        {...props}
      >
        <ol style={{ display: "inline-flex", alignItems: "center" }}>
          {showHomeIcon && (
            <li style={{ display: "flex", alignItems: "center" }}>
              <BreadcrumbItem href="/">
                <Icon name="home" dot="w-4 h-4 mr-1" />
                {homeLabel}
              </BreadcrumbItem>
              {itemsCount > 0 && (
                <span
                  style={{
                    ...resolveDot("mx-3"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-muted-foreground)",
                  }}
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
            </li>
          )}
          {items
            ? renderedItems?.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {item}
                  {index < (renderedItems?.length || 0) - 1 && (
                    <span
                      style={{
                        ...resolveDot("mx-3"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-muted-foreground)",
                      }}
                      aria-hidden="true"
                    >
                      {separator}
                    </span>
                  )}
                </li>
              ))
            : renderedItems}
        </ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

/**
 * BreadcrumbItem 컴포넌트
 * Breadcrumb의 개별 항목을 표시합니다.
 *
 * @component
 * @param {BreadcrumbItemProps} props - BreadcrumbItem 컴포넌트의 props
 * @param {React.Ref<HTMLLIElement>} ref - li 요소 ref
 * @returns {JSX.Element} BreadcrumbItem 컴포넌트
 */
const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (
    { dot: dotProp, style, href, isCurrent = false, children, ...props },
    ref,
  ) => {
    const baseStyle: React.CSSProperties = {
      color: "var(--color-muted-foreground)",
    };

    if (isCurrent) {
      return (
        <span
          ref={ref}
          aria-current="page"
          style={mergeStyles(
            baseStyle,
            { fontWeight: 500 },
            resolveDot(dotProp),
            style,
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    if (href) {
      return (
        <a
          href={href}
          style={mergeStyles(baseStyle, resolveDot(dotProp), style)}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <span
        ref={ref}
        style={mergeStyles(baseStyle, resolveDot(dotProp), style)}
        {...props}
      >
        {children}
      </span>
    );
  },
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export { Breadcrumb, BreadcrumbItem };
