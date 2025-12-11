"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import { Popover } from "./Popover"
import { Button } from "./Button"

/**
 * DatePicker 컴포넌트의 props / DatePicker component props
 * @typedef {Object} DatePickerProps
 * @property {Date | null} [value] - 선택된 날짜 / Selected date
 * @property {(date: Date | null) => void} [onChange] - 날짜 변경 핸들러 / Date change handler
 * @property {Date} [minDate] - 최소 날짜 / Minimum date
 * @property {Date} [maxDate] - 최대 날짜 / Maximum date
 * @property {string} [placeholder="날짜를 선택하세요"] - 플레이스홀더 / Placeholder
 * @property {boolean} [disabled=false] - 비활성화 상태 / Disabled state
 * @property {boolean} [error=false] - 에러 상태 / Error state
 * @property {string} [dateFormat="YYYY-MM-DD"] - 날짜 포맷 / Date format
 * @property {string} [locale="ko-KR"] - 로케일 / Locale
 * @property {"sm" | "md" | "lg"} [size="md"] - 크기 / Size
 * @property {string} [className] - 추가 클래스명 / Additional class name
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>}
 */
export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date | null
  onChange?: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  disabled?: boolean
  error?: boolean
  dateFormat?: string
  locale?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-8 text-sm px-3",
  md: "h-10 text-sm px-4",
  lg: "h-12 text-base px-5",
}

const formatDate = (date: Date | null, format: string = "YYYY-MM-DD", locale: string = "ko-KR"): string => {
  if (!date) return ""
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  
  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
}

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay()
}

/**
 * DatePicker 컴포넌트 / DatePicker component
 * 
 * 날짜를 선택할 수 있는 컴포넌트입니다.
 * 캘린더 팝오버를 통해 직관적으로 날짜를 선택할 수 있습니다.
 * 
 * Component for selecting dates.
 * Allows intuitive date selection through a calendar popover.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 * />
 * 
 * @example
 * // 날짜 범위 제한 / Date range restriction
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   minDate={new Date("2024-01-01")}
 *   maxDate={new Date("2024-12-31")}
 *   placeholder="날짜 선택"
 * />
 * 
 * @param {DatePickerProps} props - DatePicker 컴포넌트의 props / DatePicker component props
 * @returns {JSX.Element} DatePicker 컴포넌트 / DatePicker component
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      minDate,
      maxDate,
      placeholder = "날짜를 선택하세요",
      disabled = false,
      error = false,
      dateFormat = "YYYY-MM-DD",
      locale = "ko-KR",
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value.getFullYear(), value.getMonth()) : new Date())
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

    const displayDate = value ? formatDate(value, dateFormat, locale) : ""

    const handleDateSelect = (date: Date) => {
      if (minDate && date < minDate) return
      if (maxDate && date > maxDate) return
      onChange?.(date)
      setIsOpen(false)
    }

    const handlePrevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const handleNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const handleToday = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      handleDateSelect(today)
    }

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const weekDays = locale === "ko-KR" 
      ? ["일", "월", "화", "수", "목", "금", "토"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      return false
    }

    const isDateSelected = (date: Date): boolean => {
      if (!value) return false
      return (
        date.getFullYear() === value.getFullYear() &&
        date.getMonth() === value.getMonth() &&
        date.getDate() === value.getDate()
      )
    }

    const isToday = (date: Date): boolean => {
      const today = new Date()
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      )
    }

    const calendarDays: (Date | null)[] = []
    
    // 이전 달의 마지막 날들
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      calendarDays.push(date)
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day))
    }
    
    // 다음 달의 첫 날들 (캘린더를 6주로 채우기)
    const remainingDays = 42 - calendarDays.length
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push(new Date(year, month + 1, day))
    }

    const triggerButton = (
      <button
        type="button"
        disabled={disabled}
        className={merge(
          "flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2 text-left text-sm transition-colors",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700",
          error && "border-red-500 focus:ring-red-500",
          disabled && "cursor-not-allowed opacity-50",
          sizeClasses[size]
        )}
        aria-label={displayDate || placeholder}
      >
        <span className={merge("flex-1", !displayDate && "text-gray-400 dark:text-gray-500")}>
          {displayDate || placeholder}
        </span>
        <Icon 
          name="calendar" 
          className={merge(
            "ml-2 h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} 
        />
      </button>
    )

    return (
      <div ref={ref} className={merge("relative", className)} {...props}>
        <Popover 
          open={isOpen} 
          onOpenChange={setIsOpen}
          trigger={triggerButton}
          position="bottom"
          align="start"
        >
          <div className="w-auto p-0">
            <div className="p-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="이전 달"
                >
                  <Icon name="chevronLeft" className="h-4 w-4" />
                </button>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {year}년 {month + 1}월
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="다음 달"
                >
                  <Icon name="chevronRight" className="h-4 w-4" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={merge(
                      "text-center text-xs font-medium py-2",
                      index === 0 && "text-red-500 dark:text-red-400",
                      index === 6 && "text-blue-500 dark:text-blue-400"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) return <div key={index} />
                  
                  const isCurrentMonth = date.getMonth() === month
                  const isDisabled = isDateDisabled(date)
                  const isSelected = isDateSelected(date)
                  const isTodayDate = isToday(date)
                  const isHovered = hoveredDate && 
                    date.getFullYear() === hoveredDate.getFullYear() &&
                    date.getMonth() === hoveredDate.getMonth() &&
                    date.getDate() === hoveredDate.getDate()

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDateSelect(date)}
                      onMouseEnter={() => setHoveredDate(date)}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={merge(
                        "relative h-9 w-9 rounded-lg text-sm font-medium transition-all",
                        "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                        !isCurrentMonth && "text-gray-400 dark:text-gray-500",
                        isDisabled && "cursor-not-allowed opacity-30",
                        isSelected && "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
                        isTodayDate && !isSelected && "ring-2 ring-blue-500",
                        isHovered && !isSelected && "bg-blue-100 dark:bg-blue-900/30"
                      )}
                      aria-label={`${year}년 ${month + 1}월 ${date.getDate()}일`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* 오늘 버튼 */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="w-full"
                >
                  오늘
                </Button>
              </div>
            </div>
          </div>
        </Popover>
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"


