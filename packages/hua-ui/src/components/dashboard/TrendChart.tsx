"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";

export type TrendSeriesPalette = "approval" | "settlement" | "custom";

/**
 * 트렌드 시리즈 인터페이스
 * @typedef {Object} TrendSeries
 * @property {string} label - 시리즈 라벨
 * @property {number[]} data - 데이터 배열
 * @property {string} [color] - 커스텀 색상
 * @property {boolean} [area] - 영역 채우기 여부
 */
export interface TrendSeries {
  label: string;
  data: number[];
  color?: string;
  area?: boolean;
}

/**
 * TrendChart 컴포넌트의 props / TrendChart component props
 * @typedef {Object} TrendChartProps
 * @property {TrendSeries[]} series - 시리즈 배열 / Series array
 * @property {string[]} categories - 카테고리 배열 / Categories array
 * @property {TrendSeriesPalette} [palette="approval"] - 색상 팔레트 / Color palette
 * @property {number} [height=200] - 차트 높이 (px) / Chart height (px)
 * @property {boolean} [showLegend=true] - 범례 표시 여부 / Show legend
 * @property {boolean} [showDots=true] - 점 표시 여부 / Show dots
 * @property {boolean} [showTooltip=false] - 툴팁 표시 여부 / Show tooltip
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface TrendChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  series: TrendSeries[];
  categories: string[];
  palette?: TrendSeriesPalette;
  height?: number;
  showLegend?: boolean;
  showDots?: boolean;
  showTooltip?: boolean;
  dot?: string;
}

const PRESET_PALETTES: Record<TrendSeriesPalette, string[]> = {
  approval: ["#22c55e", "#f97316", "#ef4444"],
  settlement: ["#6366f1", "#0ea5e9", "#14b8a6"],
  custom: ["#0ea5e9"],
};

/**
 * TrendChart 컴포넌트
 *
 * 트렌드 데이터를 선 그래프로 표시하는 컴포넌트입니다.
 * 여러 시리즈를 동시에 표시할 수 있으며, 영역 채우기 옵션을 제공합니다.
 *
 * Line chart component that displays trend data.
 * Can display multiple series simultaneously with area fill option.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <TrendChart
 *   series={[
 *     { label: "승인", data: [10, 20, 15, 30, 25] },
 *     { label: "거부", data: [5, 10, 8, 15, 12] }
 *   ]}
 *   categories={["월", "화", "수", "목", "금"]}
 *   palette="approval"
 * />
 *
 * @example
 * // 영역 채우기와 커스텀 색상 / Area fill and custom color
 * <TrendChart
 *   series={[
 *     { label: "정산", data: [100, 200, 150], area: true, color: "#6366f1" }
 *   ]}
 *   categories={["1월", "2월", "3월"]}
 *   palette="settlement"
 *   showDots={true}
 *   showTooltip={true}
 * />
 *
 * @param {TrendChartProps} props - TrendChart 컴포넌트의 props / TrendChart component props
 * @returns {JSX.Element} TrendChart 컴포넌트 / TrendChart component
 */
export const TrendChart: React.FC<TrendChartProps> = ({
  series,
  categories,
  palette = "approval",
  height = 200,
  showLegend = true,
  showDots = true,
  showTooltip = false,
  dot,
  style,
  ...props
}) => {
  const paletteColors = PRESET_PALETTES[palette] || PRESET_PALETTES.approval;
  const safeCategories = categories.length > 0 ? categories : ["—"];
  const denominator = Math.max(safeCategories.length - 1, 1);

  const maxValue = Math.max(...series.flatMap((s) => s.data), 10);

  const _chartId = React.useId();
  const chartLabel = series.length > 0
    ? `트렌드 차트 - ${series.length}개 시리즈, ${safeCategories.length}개 카테고리, 최대값 ${maxValue.toLocaleString()}`
    : `트렌드 차트 - ${safeCategories.length}개 카테고리`;

  return (
    <div
      role="img"
      aria-label={chartLabel}
      style={mergeStyles(
        {
          borderRadius: "1rem",
          border: "1px solid var(--color-border, #f1f5f9)",
          backgroundColor: "var(--color-card, #ffffff)",
          padding: "1rem",
        },
        resolveDot(dot),
        style
      )}
      {...props}
    >
      <div style={{ position: "relative", height }}>
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
              style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}
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
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", fontSize: "0.625rem", color: "#94a3b8" }}>
          {safeCategories.map((label, _idx) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div
          style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.875rem", color: "var(--color-muted-foreground, #475569)" }}
          role="list"
          aria-label="차트 범례"
        >
          {series.map((s, index) => {
            const color = s.color || paletteColors[index % paletteColors.length];
            return (
              <div
                key={s.label}
                role="listitem"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                tabIndex={0}
                aria-label={`${s.label} 시리즈`}
                onKeyDown={(e) => {
                  // 키보드 네비게이션 지원
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                  }
                }}
              >
                <span
                  style={{ display: "inline-block", height: "0.5rem", width: "0.5rem", borderRadius: "9999px", backgroundColor: color }}
                  aria-hidden="true"
                />
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

TrendChart.displayName = "TrendChart";
