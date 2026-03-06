"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import type { Color } from "../../lib/types/common";

/**
 * 색상 단계 매핑 — CSS 값 기반
 */
const colorSteps: Record<Color, {
  empty: string;
  s1: string;
  s2: string;
  s3: string;
  todayBorder: string;
}> = {
  cyan: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#a5f3fc",
    s2: "#22d3ee",
    s3: "#0891b2",
    todayBorder: "#22d3ee",
  },
  blue: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#bfdbfe",
    s2: "#60a5fa",
    s3: "#2563eb",
    todayBorder: "#60a5fa",
  },
  green: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#bbf7d0",
    s2: "#4ade80",
    s3: "#16a34a",
    todayBorder: "#4ade80",
  },
  purple: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#e9d5ff",
    s2: "#c084fc",
    s3: "#9333ea",
    todayBorder: "#c084fc",
  },
  orange: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#fed7aa",
    s2: "#fb923c",
    s3: "#ea580c",
    todayBorder: "#fb923c",
  },
  red: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#fecaca",
    s2: "#f87171",
    s3: "#dc2626",
    todayBorder: "#f87171",
  },
  indigo: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#c7d2fe",
    s2: "#818cf8",
    s3: "#4f46e5",
    todayBorder: "#818cf8",
  },
  pink: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#fbcfe8",
    s2: "#f472b6",
    s3: "#db2777",
    todayBorder: "#f472b6",
  },
  gray: {
    empty: "rgba(0,0,0,0.1)",
    s1: "#e5e7eb",
    s2: "#9ca3af",
    s3: "#4b5563",
    todayBorder: "#9ca3af",
  },
};

export interface YearlyHeatmapLabels {
  /** 제목 */
  title?: string;
  /** 총 일수 텍스트 (예: "9일 작성") */
  totalDays?: string;
  /** 범례 왼쪽 (예: "적음") */
  less?: string;
  /** 범례 오른쪽 (예: "많음") */
  more?: string;
  /** 툴팁 포맷 함수 (날짜, 카운트) => string */
  tooltip?: (dateStr: string, count: number) => string;
}

export interface YearlyHeatmapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** 날짜별 데이터 (키: "YYYY-MM-DD", 값: count) */
  data: Record<string, number>;
  /** 색상 테마 */
  color?: Color;
  /** locale (요일/월 표시용, 예: "ko-KR") */
  locale?: string;
  /** 텍스트 라벨 */
  labels?: YearlyHeatmapLabels;
  /** dot 유틸리티 스트링 */
  dot?: string;
}

/**
 * GitHub 잔디 스타일 1년 히트맵
 * 가로: 주(52~53주), 세로: 요일(일~토)
 */
export function YearlyHeatmap({
  data,
  color = "cyan",
  locale = "en-US",
  labels = {},
  dot,
  style,
  ...props
}: YearlyHeatmapProps) {
  const steps = colorSteps[color] || colorSteps.cyan;

  // 주 단위 데이터
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: (Date | null)[][] = [];
    const monthLabels: { label: string; colIndex: number }[] = [];
    const currentDate = new Date(startDate);
    let lastMonth = -1;

    while (currentDate <= today || weeks.length < 53) {
      const week: (Date | null)[] = [];
      let weekHasFirstOfMonth = false;
      let firstOfMonthDate: Date | null = null;

      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(currentDate);
        cellDate.setDate(cellDate.getDate() + d);

        if (cellDate > today) {
          week.push(null);
        } else {
          week.push(cellDate);
          // 이 주에 1일이 포함되어 있으면 월 라벨 표시
          if (cellDate.getDate() === 1 && cellDate.getMonth() !== lastMonth) {
            weekHasFirstOfMonth = true;
            firstOfMonthDate = cellDate;
          }
        }
      }

      if (weekHasFirstOfMonth && firstOfMonthDate) {
        lastMonth = firstOfMonthDate.getMonth();
        monthLabels.push({
          label: firstOfMonthDate.toLocaleDateString(locale, { month: "short" }),
          colIndex: weeks.length,
        });
      }

      weeks.push(week);
      currentDate.setDate(currentDate.getDate() + 7);
      if (weeks.length >= 53) break;
    }

    return { weeks, monthLabels };
  }, [locale]);

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const getCellStyle = (date: Date | null): React.CSSProperties => {
    if (!date) return { backgroundColor: "transparent" };
    const count = data[getDateKey(date)] || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();

    let bg = steps.empty;
    if (count === 1) bg = steps.s1;
    else if (count === 2) bg = steps.s2;
    else if (count >= 3) bg = steps.s3;

    return {
      backgroundColor: bg,
      ...(isToday && {
        border: `2px solid ${steps.todayBorder}`,
      }),
    };
  };

  const getTooltip = (date: Date | null): string => {
    if (!date) return "";
    const count = data[getDateKey(date)] || 0;
    const dateStr = date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    return labels.tooltip ? labels.tooltip(dateStr, count) : `${dateStr}: ${count}`;
  };

  const totalDays = useMemo(() => Object.values(data).filter((v) => v > 0).length, [data]);

  return (
    <div
      style={mergeStyles(
        {
          backgroundColor: "var(--color-card, #ffffff)",
          borderRadius: "0.75rem",
          padding: "1rem",
        },
        resolveDot(dot),
        style
      )}
      {...props}
    >
      {/* 헤더 */}
      {(labels.title || labels.totalDays) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          {labels.title && (
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-foreground, #111827)" }}>{labels.title}</h3>
          )}
          {labels.totalDays && (
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground, #6b7280)" }}>{labels.totalDays}</span>
          )}
        </div>
      )}

      {/* 히트맵 */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        {/* 월 라벨 */}
        <div style={{ display: "flex", marginBottom: "0.25rem", gap: "2px" }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.colIndex === wi);
            return (
              <div key={wi} style={{ flex: 1, minWidth: "10px" }}>
                {ml && (
                  <span style={{ fontSize: "9px", color: "var(--color-muted-foreground, #6b7280)", whiteSpace: "nowrap" }}>
                    {ml.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 셀 그리드 */}
        <div style={{ display: "flex", gap: "2px" }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ flex: 1, minWidth: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {week.map((date, di) => (
                <div
                  key={di}
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: "2px",
                    ...getCellStyle(date),
                  }}
                  title={getTooltip(date)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", marginTop: "0.75rem", fontSize: "10px", color: "var(--color-muted-foreground, #6b7280)" }}>
        <span>{labels.less || "Less"}</span>
        <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "2px", backgroundColor: steps.empty }} />
        <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "2px", backgroundColor: steps.s1 }} />
        <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "2px", backgroundColor: steps.s2 }} />
        <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "2px", backgroundColor: steps.s3 }} />
        <span>{labels.more || "More"}</span>
      </div>
    </div>
  );
}
