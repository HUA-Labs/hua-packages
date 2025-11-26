"use client";

import * as React from "react";
import { merge } from "../../lib/utils";
import { Button } from "../Button";
import { Dropdown, DropdownItem, DropdownMenu } from "../Dropdown";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

type ToolbarVariant = "plain" | "cards";

export interface ToolbarAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: IconName | React.ReactNode;
  appearance?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export interface DatePreset {
  label: string;
  value: string;
}

export interface DateRangeConfig {
  value: { from: Date; to: Date } | null;
  presets?: DatePreset[];
  onSelectPreset?: (preset: DatePreset) => void;
  onCustomRange?: () => void;
  display?: string;
}

export interface DashboardToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  variant?: ToolbarVariant;
  dateRange?: DateRangeConfig;
  filters?: React.ReactNode;
  actions?: ToolbarAction[];
  onRefresh?: () => void;
  lastUpdated?: string;
}

const actionAppearance = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary:
    "border border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800",
  ghost: "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
};

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
          <Icon name={icon as IconName} className="h-4 w-4" />
        ) : (
          icon
        ))}
      <span>{label}</span>
    </>
  );

  const className = merge(
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    actionAppearance[appearance]
  );

  if (href) {
    return (
      <a className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={loading}>
      {content}
    </button>
  );
};

export const DashboardToolbar = React.forwardRef<HTMLDivElement, DashboardToolbarProps>(
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
      className,
      ...props
    },
    ref
  ) => {
    const containerClasses = merge(
      "w-full",
      variant === "cards"
        ? "rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
        : ""
    );

    return (
      <div ref={ref} className={merge(containerClasses, className)} {...props}>
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && (
                <div className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </div>
              )}
              {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {dateRange && (
                <Dropdown
                  trigger={
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="calendar" className="h-4 w-4" />
                      {dateRange.display || "날짜 범위"}
                    </Button>
                  }
                >
                  <DropdownMenu className="max-h-64 overflow-auto">
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
                  className="gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  onClick={onRefresh}
                >
                  <Icon name="refresh" className="h-4 w-4" />
                  새로고침
                </Button>
              )}
            </div>
          </div>

          {(filters || meta || lastUpdated) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                {filters}
                {meta}
              </div>
              {lastUpdated && (
                <span className="text-xs text-slate-400">업데이트: {lastUpdated}</span>
              )}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              {actions.map((action) => (
                <ToolbarButton key={action.label} {...action} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

DashboardToolbar.displayName = "DashboardToolbar";

