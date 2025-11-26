"use client";

import * as React from "react";
import { merge } from "../../lib/utils";

export type TrendSeriesPalette = "approval" | "settlement" | "custom";

export interface TrendSeries {
  label: string;
  data: number[];
  color?: string;
  area?: boolean;
}

export interface TrendChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: TrendSeries[];
  categories: string[];
  palette?: TrendSeriesPalette;
  height?: number;
  showLegend?: boolean;
  showDots?: boolean;
  showTooltip?: boolean;
}

const PRESET_PALETTES: Record<TrendSeriesPalette, string[]> = {
  approval: ["#22c55e", "#f97316", "#ef4444"],
  settlement: ["#6366f1", "#0ea5e9", "#14b8a6"],
  custom: ["#0ea5e9"],
};

export const TrendChart: React.FC<TrendChartProps> = ({
  series,
  categories,
  palette = "approval",
  height = 200,
  showLegend = true,
  showDots = true,
  showTooltip = false,
  className,
  ...props
}) => {
  const paletteColors = PRESET_PALETTES[palette] || PRESET_PALETTES.approval;
  const safeCategories = categories.length > 0 ? categories : ["—"];
  const denominator = Math.max(safeCategories.length - 1, 1);

  const maxValue = Math.max(...series.flatMap((s) => s.data), 10);

  return (
    <div
      className={merge(
        "rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4",
        className
      )}
      {...props}
    >
      <div className="relative" style={{ height }}>
        {series.map((s, index) => {
          const color = s.color || paletteColors[index % paletteColors.length];
          const points = s.data.map((point, i) => ({
            x: (i / denominator) * 100,
            y: 100 - (point / maxValue) * 100,
            value: point,
            label: safeCategories[i] ?? safeCategories[safeCategories.length - 1] ?? "",
          }));

          if (points.length === 0) {
            return null;
          }

          const pathData = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
            .join(" ");

          const areaData = `${pathData} L 100,100 L 0,100 Z`;

          return (
            <svg
              key={s.label}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              {s.area && (
                <path
                  d={areaData}
                  fill={color}
                  opacity={0.08}
                  stroke="none"
                />
              )}
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {showDots &&
                points.map((p, i) => (
                  <circle
                    key={`${s.label}-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={1.2}
                    fill="#fff"
                    stroke={color}
                    strokeWidth={0.8}
                  >
                    {showTooltip && (
                      <title>
                        {s.label} · {p.label}: {p.value.toLocaleString()}
                      </title>
                    )}
                  </circle>
                ))}
            </svg>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 flex text-[10px] text-slate-400">
          {safeCategories.map((label, idx) => (
            <div key={label} className="flex-1 text-center">
              {label}
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
          {series.map((s, index) => {
            const color = s.color || paletteColors[index % paletteColors.length];
            return (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {s.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

TrendChart.displayName = "TrendChart";

