"use client";

import React from "react";
import { merge, formatRelativeTime, Icon, type IconName } from '@hua-labs/ui';

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
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: ActivityItem[];
  emptyMessage?: string;
  showHeader?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  viewAllLabel?: string;
  emptyState?: React.ReactNode;
}

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
      className,
      ...props
    },
    ref
  ) => {
    const displayItems = maxItems ? items.slice(0, maxItems) : items;
    const hasMore = maxItems && items.length > maxItems;

    return (
      <div
        ref={ref}
        className={merge(
          "bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700",
          className
        )}
        {...props}
      >
        {/* 헤더 */}
        {showHeader && title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              {title}
            </h2>
            {onViewAll && (
              <button
                onClick={onViewAll}
                aria-label={`${viewAllLabel} - ${title || "활동 내역"}`}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors"
              >
                {viewAllLabel} →
              </button>
            )}
          </div>
        )}

        {/* 활동 목록 */}
        {displayItems.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayItems.map((item) => (
              <div
                key={item.id}
                onClick={item.onClick}
                className={merge(
                  "p-4 transition-colors",
                  item.onClick && "hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    {/* 아이콘과 제목 */}
                    <div className="flex items-start gap-3">
                      {item.icon && (
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {typeof item.icon === "string" ? (
                            <Icon
                              name={item.icon as IconName}
                              className="w-4 h-4 text-purple-600 dark:text-purple-400"
                            />
                          ) : (
                            item.icon
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1 truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 배지 */}
                  {item.badge && (
                    <div className="ml-2 flex-shrink-0">
                      {typeof item.badge === "string" ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          {item.badge}
                        </span>
                      ) : (
                        item.badge
                      )}
                    </div>
                  )}
                </div>

                {/* 메타데이터 */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}

                {/* 타임스탬프 */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <time dateTime={item.timestamp instanceof Date ? item.timestamp.toISOString() : typeof item.timestamp === 'string' ? item.timestamp : undefined}>
                    {formatRelativeTime(item.timestamp)}
                  </time>
                </p>
              </div>
            ))}

            {/* 더 보기 */}
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onViewAll}
                  aria-label={`더 많은 활동 보기 - ${items.length - (maxItems || 0)}개 더`}
                  className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  <span>더 많은 활동 보기</span>
                  <span className="ml-1">({items.length - (maxItems || 0)}개 더)</span>
                  <span className="ml-1">→</span>
                </button>
              </div>
            )}
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  }
);

ActivityFeed.displayName = "ActivityFeed";

