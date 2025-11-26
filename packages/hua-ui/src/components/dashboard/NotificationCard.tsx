"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

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

export interface NotificationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: NotificationItem[];
  emptyMessage?: string;
  maxItems?: number;
  onViewAll?: () => void;
  viewAllLabel?: string;
  showHeader?: boolean;
  showCount?: boolean;
  emptyState?: React.ReactNode;
}

const typeStyles = {
  info: {
    container: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    border: "border-blue-200/50 dark:border-blue-700/30",
    dot: "bg-blue-500",
  },
  warning: {
    container: "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    border: "border-orange-200/50 dark:border-orange-700/30",
    dot: "bg-red-500",
  },
  error: {
    container: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    border: "border-red-200/50 dark:border-red-700/30",
    dot: "bg-red-600",
  },
  success: {
    container: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    border: "border-green-200/50 dark:border-green-700/30",
    dot: "bg-green-500",
  },
};

const defaultTypeStyles = {
  container: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
  border: "border-gray-200/50 dark:border-gray-700/30",
  dot: "bg-gray-500",
};

export const NotificationCard = React.forwardRef<HTMLDivElement, NotificationCardProps>(
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

    const getTypeStyles = (type?: NotificationItem["type"]) => {
      if (!type) return defaultTypeStyles;
      return typeStyles[type];
    };

    return (
      <div
        ref={ref}
        className={merge(
          "bg-white dark:bg-gray-800 rounded-xl shadow p-6",
          className
        )}
        {...props}
      >
        {/* 헤더 */}
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg mr-3">
                <Icon name="bell" className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            {showCount && items.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                {items.length}개
              </span>
            )}
          </div>
        )}

        {/* 알림 목록 */}
        {displayItems.length > 0 ? (
          <div className="space-y-3">
            {displayItems.map((item) => {
              const typeStyle = getTypeStyles(item.type);
              const content = (
                <div
                  className={merge(
                    "p-3 rounded-lg border",
                    typeStyle.container,
                    typeStyle.border,
                    (item.onClick || item.href) && "cursor-pointer hover:shadow-md transition-all duration-200"
                  )}
                >
                  <div className="flex items-start">
                    <div className={merge(
                      "w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0",
                      typeStyle.dot
                    )}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <a key={item.id} href={item.href}>
                    {content}
                  </a>
                );
              }

              if (item.onClick) {
                return (
                  <div key={item.id} onClick={item.onClick}>
                    {content}
                  </div>
                );
              }

              return <div key={item.id}>{content}</div>;
            })}
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          <div className="text-center py-8">
            <Icon name="bell" className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyMessage}</p>
          </div>
        )}

        {/* 더 보기 */}
        {hasMore && onViewAll && (
          <div className="mt-4 text-center">
            <button
              onClick={onViewAll}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
            >
              {viewAllLabel} ({items.length - (maxItems || 0)}개 더)
            </button>
          </div>
        )}
      </div>
    );
  }
);

NotificationCard.displayName = "NotificationCard";

