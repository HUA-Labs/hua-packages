"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";

/**
 * 타임라인 아이템 상태 타입 / Timeline item status type
 * @typedef {"pending" | "active" | "completed" | "error" | "warning" | "info"} TimelineStatus
 */
export type TimelineStatus =
  | "pending"
  | "active"
  | "completed"
  | "error"
  | "warning"
  | "info";

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
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface TimelineProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  items: TimelineItem[];
  orientation?: "vertical" | "horizontal";
  align?: "left" | "right" | "alternate";
  highlightedId?: string;
  locale?: string;
  emptyState?: React.ReactNode;
  showConnector?: boolean;
  size?: "sm" | "md" | "lg";
  dot?: string;
  style?: React.CSSProperties;
}

// ── Color tokens ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<
  TimelineStatus,
  {
    dotBg: string;
    dotBorder: string;
    dotShadow?: string;
    cardBorder: string;
    badgeBg: string;
    badgeText: string;
    label: string;
    labelEn: string;
    pulse?: boolean;
  }
> = {
  completed: {
    dotBg: "#10b981",
    dotBorder: "#10b981",
    dotShadow: "0 0 8px rgba(16,185,129,0.4)",
    cardBorder: "var(--color-emerald-200, #a7f3d0)",
    badgeBg: "var(--color-emerald-50, #ecfdf5)",
    badgeText: "var(--color-emerald-700, #047857)",
    label: "완료",
    labelEn: "Completed",
  },
  active: {
    dotBg: "#0ea5e9",
    dotBorder: "#0ea5e9",
    dotShadow: "0 0 8px rgba(14,165,233,0.4)",
    cardBorder: "var(--color-sky-200, #bae6fd)",
    badgeBg: "var(--color-sky-50, #f0f9ff)",
    badgeText: "var(--color-sky-700, #0369a1)",
    label: "진행 중",
    labelEn: "Active",
    pulse: true,
  },
  pending: {
    dotBg: "var(--color-muted-foreground, #94a3b8)",
    dotBorder: "var(--color-muted-foreground, #94a3b8)",
    cardBorder: "var(--color-border, #e2e8f0)",
    badgeBg: "var(--color-muted, #f1f5f9)",
    badgeText: "var(--color-muted-foreground, #64748b)",
    label: "대기",
    labelEn: "Pending",
  },
  error: {
    dotBg: "#f43f5e",
    dotBorder: "#f43f5e",
    dotShadow: "0 0 8px rgba(244,63,94,0.4)",
    cardBorder: "var(--color-rose-200, #fecdd3)",
    badgeBg: "var(--color-rose-50, #fff1f2)",
    badgeText: "var(--color-rose-700, #be123c)",
    label: "오류",
    labelEn: "Error",
  },
  warning: {
    dotBg: "#f59e0b",
    dotBorder: "#f59e0b",
    dotShadow: "0 0 8px rgba(245,158,11,0.4)",
    cardBorder: "var(--color-amber-200, #fde68a)",
    badgeBg: "var(--color-amber-50, #fffbeb)",
    badgeText: "var(--color-amber-700, #b45309)",
    label: "경고",
    labelEn: "Warning",
  },
  info: {
    dotBg: "#8b5cf6",
    dotBorder: "#8b5cf6",
    dotShadow: "0 0 8px rgba(139,92,246,0.4)",
    cardBorder: "var(--color-violet-200, #ddd6fe)",
    badgeBg: "var(--color-violet-50, #f5f3ff)",
    badgeText: "var(--color-violet-700, #6d28d9)",
    label: "정보",
    labelEn: "Info",
  },
};

// ── Size tokens ───────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { dotSize: 10, gap: 12, padding: 12, fontSize: "0.75rem" },
  md: { dotSize: 14, gap: 16, padding: 16, fontSize: "0.875rem" },
  lg: { dotSize: 16, gap: 20, padding: 20, fontSize: "1rem" },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (value?: string | Date, locale = "ko-KR") => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ── Static styles ─────────────────────────────────────────────────────────────

const WRAP_STYLE: React.CSSProperties = {
  overflowX: "auto",
};

const EMPTY_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  ...resolveDot("py-8"),
  textAlign: "center",
};

const EMPTY_TEXT_PRIMARY: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-muted-foreground, #64748b)",
};

const EMPTY_TEXT_SECONDARY: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-muted-foreground, #64748b)",
  ...resolveDot("mt-1"),
};

const OL_HORIZONTAL: React.CSSProperties = {
  display: "flex",
  listStyle: "none",
  margin: 0,
  padding: 0,
  minWidth: "max-content",
};

const LI_HORIZONTAL: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
};

const CONNECTOR_HORIZONTAL: React.CSSProperties = {
  height: "2px",
  width: "64px",
  backgroundColor: "var(--color-border, #e2e8f0)",
  marginTop: "0.4375rem",
  marginLeft: "0.5rem",
  marginRight: "0.5rem",
  flexShrink: 0,
};

const OL_VERTICAL: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  ...resolveDot("gap-4"),
};

const DOT_COL: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const CONNECTOR_VERTICAL: React.CSSProperties = {
  ...resolveDot("mt-1"),
  flex: 1,
  width: "1px",
  backgroundColor: "var(--color-border, #e2e8f0)",
};

const TITLE_STYLE: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--color-foreground, #0f172a)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  marginTop: "0.25rem",
  color: "var(--color-muted-foreground, #64748b)",
};

const META_STYLE: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-muted-foreground, #64748b)",
};

const DATE_ROW_STYLE: React.CSSProperties = {
  ...resolveDot("mt-3"),
  display: "flex",
  alignItems: "center",
  ...resolveDot("gap-1"),
  fontSize: "0.75rem",
  color: "var(--color-muted-foreground, #64748b)",
};

const CUSTOM_CONTENT_STYLE: React.CSSProperties = {
  ...resolveDot("mt-3"),
};

const ICON_WRAP_STYLE: React.CSSProperties = {
  color: "var(--color-muted-foreground, #64748b)",
};

// ── Component ─────────────────────────────────────────────────────────────────

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
  dot: dotProp,
  style,
  ...props
}) => {
  const hasItems = items.length > 0;
  const sizeConfig = SIZE_CONFIG[size];

  const rootStyle = useMemo(
    () => mergeStyles(resolveDot(dotProp), style),
    [dotProp, style],
  );

  if (!hasItems) {
    return (
      <div style={rootStyle} data-timeline-root {...props}>
        {emptyState ?? (
          <div style={EMPTY_STYLE}>
            <span style={{ opacity: 0.5, marginBottom: "0.75rem" }}>
              <Icon name="clock" size={40} />
            </span>
            <p style={EMPTY_TEXT_PRIMARY}>타임라인이 비어 있습니다</p>
            <p style={EMPTY_TEXT_SECONDARY}>
              이벤트가 추가되면 여기에 표시됩니다.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Horizontal ──────────────────────────────────────────────────────────────
  if (orientation === "horizontal") {
    return (
      <div
        style={mergeStyles(WRAP_STYLE, rootStyle)}
        data-timeline-root
        data-orientation="horizontal"
        {...props}
      >
        <ol style={OL_HORIZONTAL} role="list" aria-label="타임라인">
          {items.map((item, index) => {
            const status = item.status ?? "pending";
            const sc = STATUS_COLORS[status];
            const date = formatDate(item.date, locale);
            const isHighlighted = highlightedId === item.id;
            const showLine = showConnector && index !== items.length - 1;

            const dotStyle: React.CSSProperties = {
              display: "inline-block",
              borderRadius: "9999px",
              border: "2px solid",
              flexShrink: 0,
              height: sizeConfig.dotSize,
              width: sizeConfig.dotSize,
              backgroundColor: sc.dotBg,
              borderColor: sc.dotBorder,
              boxShadow: sc.dotShadow,
              ...(isHighlighted && {
                transform: "scale(1.25)",
                outline: "1px solid var(--color-border, #e2e8f0)",
                outlineOffset: "2px",
              }),
              ...(sc.pulse && {
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }),
            };

            const contentStyle: React.CSSProperties = {
              ...resolveDot("mt-3"),
              textAlign: "center",
              maxWidth: "160px",
              fontSize: sizeConfig.fontSize,
            };

            return (
              <li key={item.id} style={LI_HORIZONTAL} role="listitem">
                <div style={DOT_COL}>
                  <span
                    style={dotStyle}
                    aria-label={sc.label}
                    data-status={status}
                  />
                  <div style={contentStyle}>
                    <p style={TITLE_STYLE}>{item.title}</p>
                    {item.description && (
                      <p
                        style={{
                          ...DESCRIPTION_STYLE,
                          fontSize: sizeConfig.fontSize,
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                    {date && (
                      <time
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-muted-foreground, #64748b)",
                          ...resolveDot("mt-1"),
                          display: "block",
                        }}
                        dateTime={
                          item.date instanceof Date
                            ? item.date.toISOString()
                            : item.date
                        }
                      >
                        {date}
                      </time>
                    )}
                  </div>
                </div>
                {showLine && (
                  <span
                    style={CONNECTOR_HORIZONTAL}
                    aria-hidden="true"
                    data-connector="horizontal"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // ── Vertical ────────────────────────────────────────────────────────────────
  return (
    <div
      style={rootStyle}
      data-timeline-root
      data-orientation="vertical"
      {...props}
    >
      <ol style={OL_VERTICAL} role="list" aria-label="타임라인">
        {items.map((item, index) => {
          const status = item.status ?? "pending";
          const sc = STATUS_COLORS[status];
          const date = formatDate(item.date, locale);
          const isHighlighted = highlightedId === item.id;
          const showLine = showConnector && index !== items.length - 1;
          const isAlternateRight = align === "alternate" && index % 2 === 1;
          const isRight = align === "right" || isAlternateRight;

          const renderIcon = () => {
            if (!item.icon) return null;
            if (typeof item.icon === "string") {
              return <Icon name={item.icon as IconName} size={16} />;
            }
            return item.icon;
          };

          const dotStyle: React.CSSProperties = {
            display: "inline-block",
            zIndex: 10,
            borderRadius: "9999px",
            border: "2px solid",
            flexShrink: 0,
            height: sizeConfig.dotSize,
            width: sizeConfig.dotSize,
            backgroundColor: sc.dotBg,
            borderColor: sc.dotBorder,
            boxShadow: sc.dotShadow,
            ...(isHighlighted && {
              transform: "scale(1.1)",
            }),
            ...(sc.pulse && {
              animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }),
          };

          const cardStyle: React.CSSProperties = {
            flex: 1,
            borderRadius: "0.75rem",
            border: `${isHighlighted ? "2px" : "1px"} solid ${sc.cardBorder}`,
            padding: sizeConfig.padding,
            transition: "all 200ms",
            ...(isHighlighted && {
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
              outline: "1px solid var(--color-border, #e2e8f0)",
            }),
          };

          const badgeStyle: React.CSSProperties = {
            fontSize: "0.75rem",
            fontWeight: 500,
            borderRadius: "9999px",
            ...resolveDot("px-2 py-0.5"),
            backgroundColor: sc.badgeBg,
            color: sc.badgeText,
          };

          const titleRowStyle: React.CSSProperties = {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            ...resolveDot("gap-2"),
          };

          const liStyle: React.CSSProperties = {
            position: "relative",
            display: "flex",
            gap: sizeConfig.gap,
            ...(isRight && { flexDirection: "row-reverse" }),
          };

          const iconNode = renderIcon();

          return (
            <li key={item.id} role="listitem" style={liStyle} data-size={size}>
              {/* Dot and Connector */}
              <div style={DOT_COL}>
                <span
                  style={dotStyle}
                  aria-label={sc.label}
                  data-status={status}
                />
                {showLine && (
                  <span
                    style={CONNECTOR_VERTICAL}
                    aria-hidden="true"
                    data-connector="vertical"
                  />
                )}
              </div>

              {/* Card */}
              <div
                style={cardStyle}
                data-highlighted={isHighlighted ? "true" : undefined}
              >
                <div style={titleRowStyle}>
                  {iconNode && <span style={ICON_WRAP_STYLE}>{iconNode}</span>}
                  <span
                    style={{ ...TITLE_STYLE, fontSize: sizeConfig.fontSize }}
                  >
                    {item.title}
                  </span>
                  <span style={badgeStyle}>{sc.label}</span>
                  {item.meta && <span style={META_STYLE}>{item.meta}</span>}
                </div>

                {item.description && (
                  <p
                    style={{
                      ...DESCRIPTION_STYLE,
                      fontSize: sizeConfig.fontSize,
                    }}
                  >
                    {item.description}
                  </p>
                )}

                {item.content && (
                  <div style={CUSTOM_CONTENT_STYLE}>{item.content}</div>
                )}

                {date && (
                  <div style={DATE_ROW_STYLE}>
                    <Icon name="clock" size={12} aria-hidden />
                    <time
                      dateTime={
                        item.date instanceof Date
                          ? item.date.toISOString()
                          : item.date
                      }
                    >
                      {date}
                    </time>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

Timeline.displayName = "Timeline";
