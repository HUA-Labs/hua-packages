"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: IconName | React.ReactNode;
  badge?: string | React.ReactNode;
  onClick?: () => void;
  metadata?: Record<string, any>;
}

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

    const formatTimestamp = (timestamp: Date | string): string => {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "방금 전";
      if (minutes < 60) return `${minutes}분 전`;
      if (hours < 24) return `${hours}시간 전`;
      if (days < 7) return `${days}일 전`;
      return date.toLocaleDateString("ko-KR");
    };

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
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
            ))}

            {/* 더 보기 */}
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onViewAll}
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

