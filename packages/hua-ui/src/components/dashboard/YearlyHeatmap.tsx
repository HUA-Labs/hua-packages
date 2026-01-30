"use client";

import React, { useMemo } from "react";
import { merge } from "../../lib/utils";
import type { Color } from "../../lib/types/common";

/**
 * 색상 단계 매핑 (빈/1/2/3+)
 */
const colorSteps: Record<Color, { empty: string; s1: string; s2: string; s3: string; today: string }> = {
  cyan: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-cyan-200 dark:bg-cyan-800",
    s2: "bg-cyan-400 dark:bg-cyan-600",
    s3: "bg-cyan-600 dark:bg-cyan-400",
    today: "border-2 border-cyan-400 dark:border-cyan-300",
  },
  blue: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-blue-200 dark:bg-blue-800",
    s2: "bg-blue-400 dark:bg-blue-600",
    s3: "bg-blue-600 dark:bg-blue-400",
    today: "border-2 border-blue-400 dark:border-blue-300",
  },
  green: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-green-200 dark:bg-green-800",
    s2: "bg-green-400 dark:bg-green-600",
    s3: "bg-green-600 dark:bg-green-400",
    today: "border-2 border-green-400 dark:border-green-300",
  },
  purple: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-purple-200 dark:bg-purple-800",
    s2: "bg-purple-400 dark:bg-purple-600",
    s3: "bg-purple-600 dark:bg-purple-400",
    today: "border-2 border-purple-400 dark:border-purple-300",
  },
  orange: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-orange-200 dark:bg-orange-800",
    s2: "bg-orange-400 dark:bg-orange-600",
    s3: "bg-orange-600 dark:bg-orange-400",
    today: "border-2 border-orange-400 dark:border-orange-300",
  },
  red: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-red-200 dark:bg-red-800",
    s2: "bg-red-400 dark:bg-red-600",
    s3: "bg-red-600 dark:bg-red-400",
    today: "border-2 border-red-400 dark:border-red-300",
  },
  indigo: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-indigo-200 dark:bg-indigo-800",
    s2: "bg-indigo-400 dark:bg-indigo-600",
    s3: "bg-indigo-600 dark:bg-indigo-400",
    today: "border-2 border-indigo-400 dark:border-indigo-300",
  },
  pink: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-pink-200 dark:bg-pink-800",
    s2: "bg-pink-400 dark:bg-pink-600",
    s3: "bg-pink-600 dark:bg-pink-400",
    today: "border-2 border-pink-400 dark:border-pink-300",
  },
  gray: {
    empty: "bg-gray-100 dark:bg-gray-700/40",
    s1: "bg-gray-200 dark:bg-gray-700",
    s2: "bg-gray-400 dark:bg-gray-500",
    s3: "bg-gray-600 dark:bg-gray-400",
    today: "border-2 border-gray-400 dark:border-gray-300",
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

export interface YearlyHeatmapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 날짜별 데이터 (키: "YYYY-MM-DD", 값: count) */
  data: Record<string, number>;
  /** 색상 테마 */
  color?: Color;
  /** locale (요일/월 표시용, 예: "ko-KR") */
  locale?: string;
  /** 텍스트 라벨 */
  labels?: YearlyHeatmapLabels;
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
  className,
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

  const getCellClass = (date: Date | null): string => {
    if (!date) return "bg-transparent";
    const count = data[getDateKey(date)] || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();

    let c = steps.empty;
    if (count === 1) c = steps.s1;
    else if (count === 2) c = steps.s2;
    else if (count >= 3) c = steps.s3;

    return isToday ? `${c} ${steps.today}` : c;
  };

  const getTooltip = (date: Date | null): string => {
    if (!date) return "";
    const count = data[getDateKey(date)] || 0;
    const dateStr = date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    return labels.tooltip ? labels.tooltip(dateStr, count) : `${dateStr}: ${count}`;
  };

  const totalDays = useMemo(() => Object.values(data).filter((v) => v > 0).length, [data]);

  return (
    <div className={merge("bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg", className)} {...props}>
      {/* 헤더 */}
      {(labels.title || labels.totalDays) && (
        <div className="flex items-center justify-between mb-3">
          {labels.title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{labels.title}</h3>
          )}
          {labels.totalDays && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{labels.totalDays}</span>
          )}
        </div>
      )}

      {/* 히트맵 */}
      <div className="w-full overflow-x-auto">
        {/* 월 라벨 */}
        <div className="flex mb-1 gap-[2px]">
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.colIndex === wi);
            return (
              <div key={wi} className="flex-1 min-w-[10px]">
                {ml && (
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {ml.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 셀 그리드 */}
        <div className="flex gap-[2px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex-1 min-w-[10px] flex flex-col gap-[2px]">
              {week.map((date, di) => (
                <div
                  key={di}
                  className={`aspect-square rounded-sm ${getCellClass(date)}`}
                  title={getTooltip(date)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
        <span>{labels.less || "Less"}</span>
        <div className={`w-3 h-3 rounded-sm ${steps.empty}`} />
        <div className={`w-3 h-3 rounded-sm ${steps.s1}`} />
        <div className={`w-3 h-3 rounded-sm ${steps.s2}`} />
        <div className={`w-3 h-3 rounded-sm ${steps.s3}`} />
        <span>{labels.more || "More"}</span>
      </div>
    </div>
  );
}
