"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { formatRelativeTime } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

/**
 * NotificationItem 인터페이스
 * @typedef {Object} NotificationItem
 * @property {string} id - 알림 고유 ID
 * @property {string} title - 알림 제목
 * @property {string} message - 알림 메시지
 * @property {Date | string} timestamp - 알림 타임스탬프
 * @property {"info" | "warning" | "error" | "success"} [type] - 알림 타입
 * @property {IconName | React.ReactNode} [icon] - 아이콘
 * @property {() => void} [onClick] - 클릭 핸들러
 * @property {string} [href] - 링크 URL
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date | string;
  type?: "info" | "warning" | "error" | "success";
  icon?: IconName | React.ReactNode;
  onClick?: () => void;
  href?: string;
}

/**
 * NotificationCard 컴포넌트의 props / NotificationCard component props
 * @typedef {Object} NotificationCardProps
 * @property {string} [title="알림 및 공지"] - 카드 제목 / Card title
 * @property {NotificationItem[]} items - 알림 항목 배열 / Notification items array
 * @property {string} [emptyMessage="알림이 없습니다."] - 빈 상태 메시지 / Empty state message
 * @property {number} [maxItems] - 최대 표시 항목 수 / Maximum items to display
 * @property {() => void} [onViewAll] - 전체 보기 핸들러 / View all handler
 * @property {string} [viewAllLabel="모든 알림 보기"] - 전체 보기 라벨 / View all label
 * @property {boolean} [showHeader=true] - 헤더 표시 여부 / Show header
 * @property {boolean} [showCount=true] - 개수 표시 여부 / Show count
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface NotificationCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  title?: string;
  items: NotificationItem[];
  emptyMessage?: string;
  maxItems?: number;
  onViewAll?: () => void;
  viewAllLabel?: string;
  showHeader?: boolean;
  showCount?: boolean;
  emptyState?: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Static CSSProperties style constants
// ---------------------------------------------------------------------------

/** Root card container */
const CARD_BASE: React.CSSProperties = {
  backgroundColor: "var(--color-card, #ffffff)",
  ...resolveDot("rounded-xl p-6"),
  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
};

/** Header row: flex, align-center, justify-between, mb-4 */
const HEADER_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  ...resolveDot("mb-4"),
};

const HEADER_LEFT: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

/** Bell icon wrapper */
const BELL_WRAP: React.CSSProperties = {
  ...resolveDot("p-2 rounded-lg mr-3"),
  backgroundColor: "rgba(249, 115, 22, 0.1)",
};

/** Card title */
const CARD_TITLE: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "var(--color-foreground, #111827)",
};

/** Count badge */
const COUNT_BADGE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.125rem 0.625rem",
  ...resolveDot("rounded-full"),
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: "rgba(254, 215, 170, 0.8)",
  color: "rgba(154, 52, 18, 1)",
};

/** Notification list container */
const LIST_CONTAINER: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  ...resolveDot("gap-3"),
};

/** Per-type item container background + border */
const TYPE_ITEM_STYLES: Record<
  NonNullable<NotificationItem["type"]> | "default",
  React.CSSProperties
> = {
  info: {
    background:
      "linear-gradient(to right, rgba(238, 242, 255, 1), rgba(238, 242, 255, 1))",
    borderColor: "rgba(199, 210, 254, 0.5)",
  },
  warning: {
    background:
      "linear-gradient(to right, rgba(255, 247, 237, 1), rgba(254, 242, 242, 1))",
    borderColor: "rgba(253, 186, 116, 0.5)",
  },
  error: {
    background:
      "linear-gradient(to right, rgba(254, 242, 242, 1), rgba(255, 241, 242, 1))",
    borderColor: "rgba(252, 165, 165, 0.5)",
  },
  success: {
    background:
      "linear-gradient(to right, rgba(240, 253, 244, 1), rgba(236, 253, 245, 1))",
    borderColor: "rgba(134, 239, 172, 0.5)",
  },
  default: {
    background:
      "linear-gradient(to right, rgba(249, 250, 251, 1), rgba(243, 244, 246, 1))",
    borderColor: "rgba(209, 213, 219, 0.5)",
  },
};

/** Per-type dot color */
const TYPE_DOT_COLORS: Record<
  NonNullable<NotificationItem["type"]> | "default",
  React.CSSProperties
> = {
  info: { backgroundColor: "var(--color-primary, #3b82f6)" },
  warning: { backgroundColor: "rgba(239, 68, 68, 1)" },
  error: { backgroundColor: "rgba(220, 38, 38, 1)" },
  success: { backgroundColor: "rgba(34, 197, 94, 1)" },
  default: { backgroundColor: "rgba(107, 114, 128, 1)" },
};

/** Item container base */
const ITEM_BASE: React.CSSProperties = {
  ...resolveDot("p-3 rounded-lg"),
  borderWidth: "1px",
  borderStyle: "solid",
};

const ITEM_INTERACTIVE_BASE: React.CSSProperties = {
  ...ITEM_BASE,
  cursor: "pointer",
  transition: "box-shadow 200ms ease-in-out",
};

const ITEM_HOVER: React.CSSProperties = {
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
};

const ITEM_INNER: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
};

const DOT_INDICATOR: React.CSSProperties = {
  ...resolveDot("w-2 h-2 rounded-full mt-2 mr-3"),
  flexShrink: 0,
};

const ITEM_CONTENT: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const ITEM_HEADER: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  ...resolveDot("mb-1"),
};

const ITEM_TITLE: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--color-foreground, #111827)",
};

const ITEM_TIME: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-muted-foreground, #6b7280)",
  ...resolveDot("ml-2"),
  flexShrink: 0,
};

const ITEM_MESSAGE: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-muted-foreground, #6b7280)",
};

/** Empty state */
const EMPTY_STATE: React.CSSProperties = {
  textAlign: "center",
  ...resolveDot("py-8"),
};

const EMPTY_MESSAGE: React.CSSProperties = {
  color: "var(--color-muted-foreground, #6b7280)",
  fontSize: "0.875rem",
};

/** View all button row */
const VIEW_ALL_ROW: React.CSSProperties = {
  ...resolveDot("mt-4"),
  textAlign: "center",
};

const VIEW_ALL_BUTTON_BASE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-muted-foreground, #9ca3af)",
  fontWeight: 500,
  background: "none",
  border: "none",
  cursor: "pointer",
  transition: "color 200ms ease-in-out",
};

const VIEW_ALL_BUTTON_HOVER: React.CSSProperties = {
  color: "var(--color-foreground, #4b5563)",
};

// ---------------------------------------------------------------------------
// NotificationItem row — isolated component for hover state
// ---------------------------------------------------------------------------

interface NotificationRowProps {
  item: NotificationItem;
}

const NotificationRow: React.FC<NotificationRowProps> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isInteractive = !!(item.onClick || item.href);

  const typeKey = (item.type ?? "default") as
    | NonNullable<NotificationItem["type"]>
    | "default";
  const typeStyle = TYPE_ITEM_STYLES[typeKey];
  const dotColor = TYPE_DOT_COLORS[typeKey];

  const containerStyle = useMemo((): React.CSSProperties => {
    const base = isInteractive ? ITEM_INTERACTIVE_BASE : ITEM_BASE;
    return mergeStyles(
      base,
      typeStyle,
      isInteractive && isHovered ? ITEM_HOVER : undefined,
    );
  }, [isInteractive, isHovered, typeStyle]);

  const content = (
    <div
      style={containerStyle}
      onMouseEnter={isInteractive ? () => setIsHovered(true) : undefined}
      onMouseLeave={isInteractive ? () => setIsHovered(false) : undefined}
    >
      <div style={ITEM_INNER}>
        <div style={{ ...DOT_INDICATOR, ...dotColor }} />
        <div style={ITEM_CONTENT}>
          <div style={ITEM_HEADER}>
            <span style={ITEM_TITLE}>{item.title}</span>
            <time
              dateTime={
                item.timestamp instanceof Date
                  ? item.timestamp.toISOString()
                  : typeof item.timestamp === "string"
                    ? item.timestamp
                    : undefined
              }
              style={ITEM_TIME}
            >
              {formatRelativeTime(item.timestamp)}
            </time>
          </div>
          <p style={ITEM_MESSAGE}>{item.message}</p>
        </div>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <a href={item.href} style={{ display: "block", textDecoration: "none" }}>
        {content}
      </a>
    );
  }

  if (item.onClick) {
    return (
      <div onClick={item.onClick} style={{ cursor: "pointer" }}>
        {content}
      </div>
    );
  }

  return <div>{content}</div>;
};

// ---------------------------------------------------------------------------
// NotificationCard
// ---------------------------------------------------------------------------

/**
 * NotificationCard 컴포넌트 / NotificationCard component
 *
 * 알림 목록을 표시하는 카드 컴포넌트입니다.
 * 여러 알림 항목을 표시하며, 타입별로 다른 스타일을 적용할 수 있습니다.
 *
 * Card component that displays a list of notifications.
 * Shows multiple notification items and can apply different styles by type.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <NotificationCard
 *   items={[
 *     {
 *       id: "1",
 *       title: "새 주문",
 *       message: "주문 #1234가 생성되었습니다",
 *       timestamp: new Date(),
 *       type: "success"
 *     }
 *   ]}
 * />
 *
 * @example
 * // 최대 항목 수 제한 / Maximum items limit
 * <NotificationCard
 *   title="최근 알림"
 *   items={notifications}
 *   maxItems={5}
 *   onViewAll={() => navigate("/notifications")}
 *   showCount
 * />
 *
 * @param {NotificationCardProps} props - NotificationCard 컴포넌트의 props / NotificationCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} NotificationCard 컴포넌트 / NotificationCard component
 */
export const NotificationCard = React.forwardRef<
  HTMLDivElement,
  NotificationCardProps
>(
  (
    {
      title = "알림 및 공지",
      items,
      emptyMessage = "알림이 없습니다.",
      maxItems,
      onViewAll,
      viewAllLabel = "모든 알림 보기",
      showHeader = true,
      showCount = true,
      emptyState,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const [viewAllHovered, setViewAllHovered] = useState(false);

    const displayItems = maxItems ? items.slice(0, maxItems) : items;
    const hasMore = maxItems && items.length > maxItems;

    const rootStyle = useMemo(
      () => mergeStyles(CARD_BASE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    const viewAllButtonStyle = useMemo(
      () =>
        mergeStyles(
          VIEW_ALL_BUTTON_BASE,
          viewAllHovered ? VIEW_ALL_BUTTON_HOVER : undefined,
        ),
      [viewAllHovered],
    );

    return (
      <div ref={ref} style={rootStyle} {...props}>
        {/* 헤더 */}
        {showHeader && (
          <div style={HEADER_ROW}>
            <div style={HEADER_LEFT}>
              <div style={BELL_WRAP}>
                <Icon name="bell" size={24} dot="text-orange-600" />
              </div>
              <h3 style={CARD_TITLE}>{title}</h3>
            </div>
            {showCount && items.length > 0 && (
              <span style={COUNT_BADGE}>{items.length}개</span>
            )}
          </div>
        )}

        {/* 알림 목록 */}
        {displayItems.length > 0 ? (
          <div style={LIST_CONTAINER}>
            {displayItems.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          <div style={EMPTY_STATE}>
            <span
              style={{
                display: "block",
                width: "3rem",
                height: "3rem",
                margin: "0 auto 0.75rem",
                color: "var(--color-muted-foreground, #9ca3af)",
              }}
            >
              <Icon name="bell" size={48} />
            </span>
            <p style={EMPTY_MESSAGE}>{emptyMessage}</p>
          </div>
        )}

        {/* 더 보기 */}
        {hasMore && onViewAll && (
          <div style={VIEW_ALL_ROW}>
            <button
              onClick={onViewAll}
              style={viewAllButtonStyle}
              onMouseEnter={() => setViewAllHovered(true)}
              onMouseLeave={() => setViewAllHovered(false)}
            >
              {viewAllLabel} ({items.length - (maxItems || 0)}개 더)
            </button>
          </div>
        )}
      </div>
    );
  },
);

NotificationCard.displayName = "NotificationCard";
