"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Button } from "../Button";
import { Dropdown, DropdownItem, DropdownMenu } from "../Dropdown";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

type ToolbarVariant = "plain" | "cards";

/**
 * 툴바 액션 인터페이스 / ToolbarAction interface
 * @typedef {Object} ToolbarAction
 * @property {string} label - 액션 라벨 / Action label
 * @property {() => void} [onClick] - 클릭 핸들러 / Click handler
 * @property {string} [href] - 링크 URL / Link URL
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {"primary" | "secondary" | "ghost"} [appearance="secondary"] - 액션 스타일 / Action style
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 */
export interface ToolbarAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: IconName | React.ReactNode;
  appearance?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

/**
 * 날짜 프리셋 인터페이스 / DatePreset interface
 * @typedef {Object} DatePreset
 * @property {string} label - 프리셋 라벨 / Preset label
 * @property {string} value - 프리셋 값 / Preset value
 */
export interface DatePreset {
  label: string;
  value: string;
}

/**
 * 날짜 범위 설정 인터페이스 / DateRangeConfig interface
 * @typedef {Object} DateRangeConfig
 * @property {{ from: Date; to: Date } | null} value - 날짜 범위 값 / Date range value
 * @property {DatePreset[]} [presets] - 날짜 프리셋 배열 / Date preset array
 * @property {(preset: DatePreset) => void} [onSelectPreset] - 프리셋 선택 핸들러 / Preset selection handler
 * @property {() => void} [onCustomRange] - 커스텀 범위 선택 핸들러 / Custom range selection handler
 * @property {string} [display] - 표시 텍스트 / Display text
 */
export interface DateRangeConfig {
  value: { from: Date; to: Date } | null;
  presets?: DatePreset[];
  onSelectPreset?: (preset: DatePreset) => void;
  onCustomRange?: () => void;
  display?: string;
}

/**
 * DashboardToolbar 컴포넌트의 props / DashboardToolbar component props
 * @typedef {Object} DashboardToolbarProps
 * @property {React.ReactNode} [title] - 툴바 제목 / Toolbar title
 * @property {React.ReactNode} [description] - 툴바 설명 / Toolbar description
 * @property {React.ReactNode} [meta] - 메타 정보 / Meta information
 * @property {"plain" | "cards"} [variant="cards"] - 툴바 스타일 변형 / Toolbar style variant
 * @property {DateRangeConfig} [dateRange] - 날짜 범위 설정 / Date range configuration
 * @property {React.ReactNode} [filters] - 필터 컴포넌트 / Filter component
 * @property {ToolbarAction[]} [actions] - 액션 버튼 배열 / Action buttons array
 * @property {() => void} [onRefresh] - 새로고침 핸들러 / Refresh handler
 * @property {string} [lastUpdated] - 마지막 업데이트 시간 / Last updated time
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface DashboardToolbarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "className"
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  variant?: ToolbarVariant;
  dateRange?: DateRangeConfig;
  filters?: React.ReactNode;
  actions?: ToolbarAction[];
  onRefresh?: () => void;
  lastUpdated?: string;
  dot?: string;
}

const ToolbarButton: React.FC<ToolbarAction> = ({
  label,
  onClick,
  href,
  icon,
  appearance = "secondary",
  loading,
}) => {
  const content = (
    <>
      {icon &&
        (typeof icon === "string" ? (
          <Icon name={icon as IconName} dot="w-4 h-4" />
        ) : (
          icon
        ))}
      <span>{label}</span>
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    ...resolveDot("gap-2"),
    ...resolveDot("rounded-lg"),
    ...resolveDot("px-3 py-2"),
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "colors 150ms",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    ...(appearance === "primary" && {
      backgroundColor: "var(--color-primary, #6366f1)",
      color: "#ffffff",
    }),
    ...(appearance === "secondary" && {
      border: "1px solid #e2e8f0",
      color: "#1e293b",
      backgroundColor: "#ffffff",
    }),
    ...(appearance === "ghost" && {
      color: "#475569",
    }),
  };

  if (href) {
    return (
      <a style={baseStyle} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button style={baseStyle} onClick={onClick} disabled={loading}>
      {content}
    </button>
  );
};

/**
 * DashboardToolbar 컴포넌트
 *
 * 대시보드 상단 툴바 컴포넌트입니다.
 * 제목, 설명, 필터, 날짜 범위 선택, 액션 버튼 등을 포함할 수 있습니다.
 *
 * Top toolbar component for dashboards.
 * Can include title, description, filters, date range selection, and action buttons.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <DashboardToolbar
 *   title="거래 대시보드"
 *   description="전체 거래 현황을 확인하세요"
 *   actions={[
 *     { label: "내보내기", icon: "download", onClick: handleExport },
 *     { label: "필터", icon: "funnel", onClick: handleFilter }
 *   ]}
 *   onRefresh={handleRefresh}
 * />
 *
 * @example
 * // 날짜 범위 포함 / With date range
 * <DashboardToolbar
 *   title="매출 분석"
 *   dateRange={{
 *     value: { from: new Date("2024-01-01"), to: new Date("2024-12-31") },
 *     presets: [
 *       { label: "오늘", value: "today" },
 *       { label: "이번 주", value: "thisWeek" },
 *       { label: "이번 달", value: "thisMonth" }
 *     ],
 *     onSelectPreset: handlePresetSelect,
 *     onCustomRange: handleCustomRange
 *   }}
 * />
 *
 * @param {DashboardToolbarProps} props - DashboardToolbar 컴포넌트의 props / DashboardToolbar component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} DashboardToolbar 컴포넌트 / DashboardToolbar component
 */
export const DashboardToolbar = React.forwardRef<
  HTMLDivElement,
  DashboardToolbarProps
>(
  (
    {
      title,
      description,
      meta,
      variant = "cards",
      dateRange,
      filters,
      actions,
      onRefresh,
      lastUpdated,
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    const containerStyle: React.CSSProperties = {
      width: "100%",
      ...(variant === "cards" && {
        ...resolveDot("rounded-xl"),
        border: "1px solid rgba(226,232,240,0.7)",
        backgroundColor: "var(--color-card, #ffffff)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }),
    };

    return (
      <div
        ref={ref}
        style={mergeStyles(containerStyle, resolveDot(dot), style)}
        {...props}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            ...resolveDot("gap-4"),
            ...resolveDot("px-6 py-5"),
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              ...resolveDot("gap-2"),
            }}
          >
            <div>
              {title && (
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "var(--color-foreground, #0f172a)",
                  }}
                >
                  {title}
                </div>
              )}
              {description && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-muted-foreground, #64748b)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                ...resolveDot("gap-2"),
              }}
            >
              {dateRange && (
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      dot="gap-2"
                      aria-label={`날짜 범위 선택: ${dateRange.display || "날짜 범위"}`}
                    >
                      <Icon name="calendar" dot="w-4 h-4" />
                      {dateRange.display || "날짜 범위"}
                    </Button>
                  }
                >
                  <DropdownMenu
                    style={{ maxHeight: "16rem", overflowY: "auto" }}
                  >
                    {dateRange.presets?.map((preset) => (
                      <DropdownItem
                        key={preset.value}
                        onClick={() => dateRange.onSelectPreset?.(preset)}
                      >
                        {preset.label}
                      </DropdownItem>
                    ))}
                    {dateRange.onCustomRange && (
                      <DropdownItem onClick={dateRange.onCustomRange}>
                        사용자 지정...
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              )}
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  dot="gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  onClick={onRefresh}
                  aria-label="데이터 새로고침"
                >
                  <Icon name="refresh" dot="w-4 h-4" />
                  새로고침
                </Button>
              )}
            </div>
          </div>

          {(filters || meta || lastUpdated) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                ...resolveDot("gap-3 pt-3"),
                borderTop: "1px solid var(--color-border, #f1f5f9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  ...resolveDot("gap-3"),
                  fontSize: "0.875rem",
                  color: "var(--color-foreground, #475569)",
                }}
              >
                {filters}
                {meta}
              </div>
              {lastUpdated && (
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  업데이트: {lastUpdated}
                </span>
              )}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                ...resolveDot("gap-2 pt-4"),
                borderTop: "1px solid var(--color-border, #f1f5f9)",
              }}
            >
              {actions.map((action) => (
                <ToolbarButton key={action.label} {...action} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

DashboardToolbar.displayName = "DashboardToolbar";
