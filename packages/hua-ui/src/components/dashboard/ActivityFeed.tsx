"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { formatRelativeTime } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

/**
 * ActivityItem 인터페이스 / ActivityItem interface
 * @typedef {Object} ActivityItem
 * @property {string} id - 활동 항목 고유 ID / Activity item unique ID
 * @property {string} title - 활동 제목 / Activity title
 * @property {string} [description] - 활동 설명 / Activity description
 * @property {Date | string} timestamp - 활동 타임스탬프 / Activity timestamp
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {string | React.ReactNode} [badge] - 배지 / Badge
 * @property {() => void} [onClick] - 클릭 핸들러 / Click handler
 * @property {Record<string, unknown>} [metadata] - 추가 메타데이터 / Additional metadata
 */
export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: IconName | React.ReactNode;
  badge?: string | React.ReactNode;
  onClick?: () => void;
  metadata?: Record<string, unknown>;
}

/**
 * ActivityFeed 컴포넌트의 props / ActivityFeed component props
 * @typedef {Object} ActivityFeedProps
 * @property {string} [title] - 피드 제목 / Feed title
 * @property {ActivityItem[]} items - 활동 항목 배열 / Activity items array
 * @property {string} [emptyMessage="활동 내역이 없습니다."] - 빈 상태 메시지 / Empty state message
 * @property {boolean} [showHeader=true] - 헤더 표시 여부 / Show header
 * @property {number} [maxItems] - 최대 표시 항목 수 / Maximum items to display
 * @property {() => void} [onViewAll] - 전체 보기 핸들러 / View all handler
 * @property {string} [viewAllLabel="전체 보기"] - 전체 보기 라벨 / View all label
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface ActivityFeedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  title?: string;
  items: ActivityItem[];
  emptyMessage?: string;
  showHeader?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  viewAllLabel?: string;
  emptyState?: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

// ── Static style constants ────────────────────────────────────────────────────

const CONTAINER_BASE: React.CSSProperties = {
  backgroundColor: 'var(--activity-feed-bg)',
  borderRadius: '1rem',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  border: '1px solid var(--activity-feed-border)',
  overflow: 'hidden',
};

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.5rem',
  borderBottom: '1px solid var(--activity-feed-divider)',
};

const HEADER_TITLE_STYLE: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--activity-feed-title)',
  display: 'flex',
  alignItems: 'center',
};

const LINK_BASE: React.CSSProperties = {
  color: 'var(--activity-feed-link)',
  fontWeight: 500,
  fontSize: '0.875rem',
  transition: 'color 150ms ease',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const LINK_HOVER: React.CSSProperties = {
  color: 'var(--activity-feed-link-hover)',
};

const LIST_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const ITEM_BASE: React.CSSProperties = {
  padding: '1rem',
  transition: 'background-color 150ms ease',
  borderBottom: '1px solid var(--activity-feed-divider)',
};

const ITEM_HOVER: React.CSSProperties = {
  backgroundColor: 'var(--activity-feed-item-hover-bg)',
  cursor: 'pointer',
};

const ITEM_LAST_BORDER: React.CSSProperties = {
  borderBottom: 'none',
};

const ITEM_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '0.5rem',
};

const FLEX_1_MIN0: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const ICON_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
};

const ICON_WRAP_STYLE: React.CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--activity-feed-icon-bg)',
  color: 'var(--activity-feed-icon-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: '0.125rem',
};

const ITEM_TITLE_STYLE: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--activity-feed-title-text)',
  marginBottom: '0.25rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const ITEM_DESC_STYLE: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--activity-feed-desc-text)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const BADGE_SHRINK: React.CSSProperties = {
  marginLeft: '0.5rem',
  flexShrink: 0,
};

const BADGE_STRING_STYLE: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: 'var(--activity-feed-badge-bg)',
  color: 'var(--activity-feed-badge-text)',
};

const META_WRAP_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  flexWrap: 'wrap',
  marginTop: '0.5rem',
};

const META_CHIP_STYLE: React.CSSProperties = {
  fontSize: '0.75rem',
  backgroundColor: 'var(--activity-feed-meta-bg)',
  color: 'var(--activity-feed-meta-text)',
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
};

const TIMESTAMP_STYLE: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--activity-feed-timestamp)',
  marginTop: '0.5rem',
};

const MORE_WRAP_STYLE: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'center',
  borderTop: '1px solid var(--activity-feed-divider)',
};

const MORE_BTN_BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.875rem',
  color: 'var(--activity-feed-link)',
  fontWeight: 500,
  transition: 'color 150ms ease',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const MORE_BTN_HOVER: React.CSSProperties = {
  color: 'var(--activity-feed-link-hover)',
};

const EMPTY_WRAP_STYLE: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem 0',
};

const EMPTY_ICON_STYLE: React.CSSProperties = {
  fontSize: '2.25rem',
  marginBottom: '0.75rem',
  display: 'block',
};

const EMPTY_TEXT_STYLE: React.CSSProperties = {
  color: 'var(--activity-feed-empty-text)',
  fontSize: '0.875rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface ActivityItemRowProps {
  item: ActivityItem;
  isLast: boolean;
}

const ActivityItemRow: React.FC<ActivityItemRowProps> = ({ item, isLast }) => {
  const [isHovered, setIsHovered] = useState(false);
  const clickable = Boolean(item.onClick);

  const rowStyle = useMemo<React.CSSProperties>(() => mergeStyles(
    ITEM_BASE,
    isLast ? ITEM_LAST_BORDER : undefined,
    clickable && isHovered ? ITEM_HOVER : undefined,
  ), [isLast, clickable, isHovered]);

  return (
    <div
      style={rowStyle}
      onClick={item.onClick}
      onMouseEnter={clickable ? () => setIsHovered(true) : undefined}
      onMouseLeave={clickable ? () => setIsHovered(false) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable && item.onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') item.onClick!(); } : undefined}
    >
      <div style={ITEM_ROW_STYLE}>
        <div style={FLEX_1_MIN0}>
          {/* 아이콘과 제목 */}
          <div style={ICON_ROW_STYLE}>
            {item.icon && (
              <div style={ICON_WRAP_STYLE}>
                {typeof item.icon === "string" ? (
                  <Icon
                    name={item.icon as IconName}
                    size={16}
                    variant="inherit"
                  />
                ) : (
                  item.icon
                )}
              </div>
            )}
            <div style={FLEX_1_MIN0}>
              <h3 style={ITEM_TITLE_STYLE}>{item.title}</h3>
              {item.description && (
                <p style={ITEM_DESC_STYLE}>{item.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* 배지 */}
        {item.badge && (
          <div style={BADGE_SHRINK}>
            {typeof item.badge === "string" ? (
              <span style={BADGE_STRING_STYLE}>{item.badge}</span>
            ) : (
              item.badge
            )}
          </div>
        )}
      </div>

      {/* 메타데이터 */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <div style={META_WRAP_STYLE}>
          {Object.entries(item.metadata).map(([key, value]) => (
            <span key={key} style={META_CHIP_STYLE}>
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}

      {/* 타임스탬프 */}
      <p style={TIMESTAMP_STYLE}>
        <time
          dateTime={
            item.timestamp instanceof Date
              ? item.timestamp.toISOString()
              : typeof item.timestamp === 'string'
              ? item.timestamp
              : undefined
          }
        >
          {formatRelativeTime(item.timestamp)}
        </time>
      </p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * ActivityFeed 컴포넌트 / ActivityFeed component
 *
 * 활동 내역을 표시하는 피드 컴포넌트입니다.
 * 타임스탬프를 상대 시간으로 표시하며, 최대 항목 수 제한을 지원합니다.
 *
 * Feed component that displays activity history.
 * Shows timestamps as relative time and supports maximum items limit.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ActivityFeed
 *   title="최근 활동"
 *   items={[
 *     {
 *       id: "1",
 *       title: "새 주문 생성",
 *       description: "주문 #1234",
 *       timestamp: new Date(),
 *       icon: "shoppingCart"
 *     }
 *   ]}
 * />
 *
 * @example
 * // 최대 항목 수 제한 / Maximum items limit
 * <ActivityFeed
 *   title="활동 내역"
 *   items={activities}
 *   maxItems={10}
 *   onViewAll={() => navigate("/activities")}
 * />
 *
 * @param {ActivityFeedProps} props - ActivityFeed 컴포넌트의 props / ActivityFeed component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ActivityFeed 컴포넌트 / ActivityFeed component
 */
export const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  (
    {
      title,
      items,
      emptyMessage = "활동 내역이 없습니다.",
      showHeader = true,
      maxItems,
      onViewAll,
      viewAllLabel = "전체 보기",
      emptyState,
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const [viewAllHovered, setViewAllHovered] = useState(false);
    const [moreHovered, setMoreHovered] = useState(false);

    const displayItems = maxItems ? items.slice(0, maxItems) : items;
    const hasMore = maxItems && items.length > maxItems;

    const containerStyle = useMemo(
      () => mergeStyles(CONTAINER_BASE, resolveDot(dotProp), style),
      [dotProp, style]
    );

    const viewAllStyle = useMemo<React.CSSProperties>(
      () => mergeStyles(LINK_BASE, viewAllHovered ? LINK_HOVER : undefined),
      [viewAllHovered]
    );

    const moreBtnStyle = useMemo<React.CSSProperties>(
      () => mergeStyles(MORE_BTN_BASE, moreHovered ? MORE_BTN_HOVER : undefined),
      [moreHovered]
    );

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {/* 헤더 */}
        {showHeader && title && (
          <div style={HEADER_STYLE}>
            <h2 style={HEADER_TITLE_STYLE}>{title}</h2>
            {onViewAll && (
              <button
                onClick={onViewAll}
                aria-label={`${viewAllLabel} - ${title || "활동 내역"}`}
                style={viewAllStyle}
                onMouseEnter={() => setViewAllHovered(true)}
                onMouseLeave={() => setViewAllHovered(false)}
              >
                {viewAllLabel} →
              </button>
            )}
          </div>
        )}

        {/* 활동 목록 */}
        {displayItems.length > 0 ? (
          <div style={LIST_STYLE}>
            {displayItems.map((item, index) => (
              <ActivityItemRow
                key={item.id}
                item={item}
                isLast={index === displayItems.length - 1 && !hasMore}
              />
            ))}

            {/* 더 보기 */}
            {hasMore && (
              <div style={MORE_WRAP_STYLE}>
                <button
                  onClick={onViewAll}
                  aria-label={`더 많은 활동 보기 - ${items.length - (maxItems || 0)}개 더`}
                  style={moreBtnStyle}
                  onMouseEnter={() => setMoreHovered(true)}
                  onMouseLeave={() => setMoreHovered(false)}
                >
                  <span>더 많은 활동 보기</span>
                  <span style={{ marginLeft: '0.25rem' }}>({items.length - (maxItems || 0)}개 더)</span>
                  <span style={{ marginLeft: '0.25rem' }}>→</span>
                </button>
              </div>
            )}
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          <div style={EMPTY_WRAP_STYLE}>
            <span style={EMPTY_ICON_STYLE}>📭</span>
            <p style={EMPTY_TEXT_STYLE}>{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  }
);

ActivityFeed.displayName = "ActivityFeed";
