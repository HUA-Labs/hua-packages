"use client";

import React from "react";
import { merge } from "../lib/utils";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";

/**
 * 타임라인 아이템 상태 타입 / Timeline item status type
 * @typedef {"pending" | "active" | "completed" | "error" | "warning" | "info"} TimelineStatus
 */
export type TimelineStatus = "pending" | "active" | "completed" | "error" | "warning" | "info";

/**
 * 타임라인 아이템 인터페이스 / TimelineItem interface
 * @typedef {Object} TimelineItem
 * @property {string} id - 아이템 고유 ID / Item unique ID
 * @property {string} title - 제목 / Title
 * @property {string} [description] - 설명 / Description
 * @property {TimelineStatus} [status="pending"] - 상태 / Status
 * @property {string | Date} [date] - 날짜 / Date
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {string} [meta] - 메타 정보 / Meta information
 * @property {React.ReactNode} [content] - 추가 컨텐츠 / Additional content
 */
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status?: TimelineStatus;
  date?: string | Date;
  icon?: IconName | React.ReactNode;
  meta?: string;
  content?: React.ReactNode;
}

/**
 * Timeline 컴포넌트의 props / Timeline component props
 * @typedef {Object} TimelineProps
 * @property {TimelineItem[]} items - 타임라인 아이템 배열 / Timeline items array
 * @property {"vertical" | "horizontal"} [orientation="vertical"] - 방향 / Orientation
 * @property {"left" | "right" | "alternate"} [align="left"] - 정렬 / Alignment
 * @property {string} [highlightedId] - 강조할 아이템 ID / Highlighted item ID
 * @property {string} [locale="ko-KR"] - 로케일 / Locale
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {boolean} [showConnector=true] - 연결선 표시 / Show connector
 * @property {"sm" | "md" | "lg"} [size="md"] - 크기 / Size
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
  orientation?: "vertical" | "horizontal";
  align?: "left" | "right" | "alternate";
  highlightedId?: string;
  locale?: string;
  emptyState?: React.ReactNode;
  showConnector?: boolean;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
  TimelineStatus,
  { dot: string; border: string; text: string; label: string; labelEn: string }
> = {
  completed: {
    dot: "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    border: "border-emerald-200 dark:border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10",
    label: "완료",
    labelEn: "Completed",
  },
  active: {
    dot: "bg-sky-500 border-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)] animate-pulse",
    border: "border-sky-200 dark:border-sky-500/40",
    text: "text-sky-700 dark:text-sky-200 bg-sky-50 dark:bg-sky-500/10",
    label: "진행 중",
    labelEn: "Active",
  },
  pending: {
    dot: "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50",
    label: "대기",
    labelEn: "Pending",
  },
  error: {
    dot: "bg-rose-500 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
    border: "border-rose-200 dark:border-rose-500/40",
    text: "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10",
    label: "오류",
    labelEn: "Error",
  },
  warning: {
    dot: "bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    border: "border-amber-200 dark:border-amber-500/40",
    text: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10",
    label: "경고",
    labelEn: "Warning",
  },
  info: {
    dot: "bg-violet-500 border-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]",
    border: "border-violet-200 dark:border-violet-500/40",
    text: "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10",
    label: "정보",
    labelEn: "Info",
  },
};

const SIZE_CONFIG = {
  sm: { dot: "h-2.5 w-2.5", gap: "gap-3", padding: "p-3", text: "text-xs" },
  md: { dot: "h-3.5 w-3.5", gap: "gap-4", padding: "p-4", text: "text-sm" },
  lg: { dot: "h-4 w-4", gap: "gap-5", padding: "p-5", text: "text-base" },
};

const formatDate = (value?: string | Date, locale = "ko-KR") => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
};

/**
 * Timeline 컴포넌트
 *
 * 이벤트나 단계를 시간순으로 표시하는 범용 타임라인 컴포넌트입니다.
 * 활동 로그, 진행 단계, 히스토리 등 다양한 용도로 사용할 수 있습니다.
 *
 * Generic timeline component that displays events or steps chronologically.
 * Can be used for activity logs, progress steps, history, and more.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Timeline
 *   items={[
 *     { id: "1", title: "작업 시작", status: "completed", date: new Date() },
 *     { id: "2", title: "검토 중", status: "active" },
 *     { id: "3", title: "완료 예정", status: "pending" }
 *   ]}
 * />
 *
 * @example
 * // 아이콘과 커스텀 컨텐츠 / With icons and custom content
 * <Timeline
 *   items={[
 *     {
 *       id: "1",
 *       title: "커밋 생성",
 *       description: "feature/timeline 브랜치에 커밋",
 *       icon: "git-commit",
 *       status: "completed",
 *       content: <CodeBlock code="git commit -m 'Add timeline'" />
 *     }
 *   ]}
 *   size="lg"
 * />
 *
 * @example
 * // 교차 정렬 / Alternate alignment
 * <Timeline items={items} align="alternate" />
 *
 * @param {TimelineProps} props - Timeline 컴포넌트의 props / Timeline component props
 * @returns {JSX.Element} Timeline 컴포넌트 / Timeline component
 */
export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = "vertical",
  align = "left",
  highlightedId,
  locale = "ko-KR",
  emptyState,
  showConnector = true,
  size = "md",
  className,
  ...props
}) => {
  const hasItems = items.length > 0;
  const sizeConfig = SIZE_CONFIG[size];

  if (!hasItems) {
    return (
      <div className={merge("", className)} {...props}>
        {emptyState ?? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="clock" className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">타임라인이 비어 있습니다</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">이벤트가 추가되면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    );
  }

  // Horizontal layout
  if (orientation === "horizontal") {
    return (
      <div className={merge("overflow-x-auto", className)} {...props}>
        <ol className="flex min-w-max" role="list" aria-label="타임라인">
          {items.map((item, index) => {
            const status = item.status ?? "pending";
            const statusConfig = STATUS_CONFIG[status];
            const date = formatDate(item.date, locale);
            const isHighlighted = highlightedId === item.id;
            const showLine = showConnector && index !== items.length - 1;

            return (
              <li key={item.id} className="flex items-start" role="listitem">
                <div className="flex flex-col items-center">
                  {/* Dot */}
                  <span
                    className={merge(
                      "rounded-full border-2 shrink-0",
                      sizeConfig.dot,
                      statusConfig.dot,
                      isHighlighted && "scale-125 ring-1 ring-offset-2 ring-slate-200 dark:ring-slate-700"
                    )}
                    aria-label={statusConfig.label}
                  />
                  {/* Content below dot */}
                  <div className={merge("mt-3 text-center max-w-[160px]", sizeConfig.text)}>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    {date && (
                      <time className="text-xs text-slate-400 dark:text-slate-500 mt-1 block" dateTime={item.date instanceof Date ? item.date.toISOString() : item.date}>
                        {date}
                      </time>
                    )}
                  </div>
                </div>
                {/* Connector */}
                {showLine && (
                  <span className="h-0.5 w-16 bg-slate-200 dark:bg-slate-700 mt-[0.4375rem] mx-2" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className={merge("", className)} {...props}>
      <ol className="space-y-4" role="list" aria-label="타임라인">
        {items.map((item, index) => {
          const status = item.status ?? "pending";
          const statusConfig = STATUS_CONFIG[status];
          const date = formatDate(item.date, locale);
          const isHighlighted = highlightedId === item.id;
          const showLine = showConnector && index !== items.length - 1;
          const isAlternateRight = align === "alternate" && index % 2 === 1;
          const isRight = align === "right" || isAlternateRight;

          const renderIcon = () => {
            if (!item.icon) return null;
            if (typeof item.icon === "string") {
              return <Icon name={item.icon as IconName} className="h-4 w-4" />;
            }
            return item.icon;
          };

          const itemContent = (
            <div
              className={merge(
                "flex-1 rounded-xl border transition-all",
                sizeConfig.padding,
                statusConfig.border,
                isHighlighted && "border-2 shadow-md ring-1 ring-slate-100 dark:ring-slate-800"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                {renderIcon() && (
                  <span className="text-slate-500 dark:text-slate-400">{renderIcon()}</span>
                )}
                <span className={merge("font-semibold text-slate-900 dark:text-white", sizeConfig.text)}>
                  {item.title}
                </span>
                <span className={merge("text-xs font-medium rounded-full px-2 py-0.5", statusConfig.text)}>
                  {statusConfig.label}
                </span>
                {item.meta && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.meta}</span>
                )}
              </div>

              {item.description && (
                <p className={merge("mt-1 text-slate-600 dark:text-slate-300", sizeConfig.text)}>
                  {item.description}
                </p>
              )}

              {item.content && <div className="mt-3">{item.content}</div>}

              {date && (
                <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Icon name="clock" className="h-3 w-3" aria-hidden={true} />
                  <time dateTime={item.date instanceof Date ? item.date.toISOString() : item.date}>
                    {date}
                  </time>
                </div>
              )}
            </div>
          );

          return (
            <li
              key={item.id}
              role="listitem"
              className={merge(
                "relative flex",
                sizeConfig.gap,
                isRight && "flex-row-reverse"
              )}
            >
              {/* Dot and Connector */}
              <div className="flex flex-col items-center">
                <span
                  className={merge(
                    "z-10 rounded-full border-2 shrink-0",
                    sizeConfig.dot,
                    statusConfig.dot,
                    isHighlighted && "scale-110"
                  )}
                  aria-label={statusConfig.label}
                />
                {showLine && (
                  <span className="mt-1 flex-1 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                )}
              </div>

              {/* Content */}
              {itemContent}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

Timeline.displayName = "Timeline";
