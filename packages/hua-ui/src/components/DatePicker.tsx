"use client"

import React from "react"
import { Icon } from "./Icon"
import { Popover } from "./Popover"
import { Button } from "./Button"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

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
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'className'>}
 */
export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'className'> {
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
  /** 표시할 날짜 배열 (점으로 표시) / Dates to mark with a dot */
  markedDates?: Date[]
  /** dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style) */
  dot?: string
  /** 추가 인라인 스타일 / Additional inline style */
  style?: React.CSSProperties
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: '2rem', fontSize: '0.875rem', padding: '0 0.75rem' },
  md: { height: '2.5rem', fontSize: '0.875rem', padding: '0 1rem' },
  lg: { height: '3rem', fontSize: '1rem', padding: '0 1.25rem' },
}

const formatDate = (date: Date | null, format: string = "YYYY-MM-DD", _locale: string = "ko-KR"): string => {
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
      markedDates,
      dot: dotProp,
      style,
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

    // 로케일별 요일 텍스트
    const weekDaysMap: Record<string, string[]> = {
      "ko-KR": ["일", "월", "화", "수", "목", "금", "토"],
      "ko": ["일", "월", "화", "수", "목", "금", "토"],
      "ja-JP": ["日", "月", "火", "水", "木", "金", "土"],
      "ja": ["日", "月", "火", "水", "木", "金", "土"],
      "en-US": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "en": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    }
    const weekDays = weekDaysMap[locale] || weekDaysMap["en"]

    // 로케일별 월 포맷
    const formatMonth = (year: number, month: number, loc: string): string => {
      if (loc === "ko-KR" || loc === "ko") {
        return `${year}년 ${month + 1}월`
      } else if (loc === "ja-JP" || loc === "ja") {
        return `${year}年 ${month + 1}月`
      } else {
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]
        return `${monthNames[month]} ${year}`
      }
    }

    // 로케일별 "오늘" 텍스트
    const todayTextMap: Record<string, string> = {
      "ko-KR": "오늘",
      "ko": "오늘",
      "ja-JP": "今日",
      "ja": "今日",
      "en-US": "Today",
      "en": "Today",
    }
    const todayText = todayTextMap[locale] || "Today"

    // 로케일별 aria-label 텍스트
    const ariaLabels = {
      prevMonth: locale.startsWith("ko") ? "이전 달" : locale.startsWith("ja") ? "前月" : "Previous month",
      nextMonth: locale.startsWith("ko") ? "다음 달" : locale.startsWith("ja") ? "翌月" : "Next month",
    }

    // 날짜 aria-label 포맷
    const formatDateAriaLabel = (date: Date, loc: string): string => {
      if (loc.startsWith("ko")) {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
      } else if (loc.startsWith("ja")) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
      } else {
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      }
    }

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

    const isMarkedDate = (date: Date): boolean => {
      if (!markedDates) return false
      return markedDates.some(
        (marked) =>
          marked.getFullYear() === date.getFullYear() &&
          marked.getMonth() === date.getMonth() &&
          marked.getDate() === date.getDate()
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

    // 다음 달의 첫 날들 (현재 행만 채우기 - 불필요한 추가 행 방지)
    const totalRows = Math.ceil(calendarDays.length / 7)
    const totalSlots = totalRows * 7
    const remainingDays = totalSlots - calendarDays.length
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push(new Date(year, month + 1, day))
    }

    const triggerButtonStyle: React.CSSProperties = {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '0.5rem',
      border: error ? '1px solid hsl(var(--destructive))' : '1px solid hsl(var(--input))',
      backgroundColor: 'hsl(var(--background))',
      textAlign: 'left',
      fontSize: sizeStyles[size].fontSize,
      height: sizeStyles[size].height,
      padding: sizeStyles[size].padding,
      transition: 'colors 150ms',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }

    const triggerButton = (
      <button
        type="button"
        disabled={disabled}
        style={triggerButtonStyle}
        aria-label={displayDate || placeholder}
      >
        <span style={{ flex: 1, color: displayDate ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
          {displayDate || placeholder}
        </span>
        <Icon
          name="calendar"
          className="ml-2 h-4 w-4"
        />
      </button>
    )

    return (
      <div ref={ref} style={mergeStyles(resolveDot('relative'), resolveDot(dotProp), style)} {...props}>
        <Popover
          open={isOpen}
          onOpenChange={setIsOpen}
          trigger={triggerButton}
          position="bottom"
          align="start"
          fullWidth
          contentStyle={{ padding: 0 }}
        >
          <div
            style={{ borderRadius: '0.5rem', backgroundColor: 'hsl(var(--popover))' }}
          >
            <div style={{ padding: '1rem' }}>
              {/* 헤더 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  style={{ borderRadius: '0.5rem', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'background-color 150ms' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--muted))' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  aria-label={ariaLabels.prevMonth}
                >
                  <Icon name="chevronLeft" className="h-4 w-4" />
                </button>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                  {formatMonth(year, month, locale)}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{ borderRadius: '0.5rem', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'background-color 150ms' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--muted))' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  aria-label={ariaLabels.nextMonth}
                >
                  <Icon name="chevronRight" className="h-4 w-4" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      padding: '0.5rem 0',
                      color: index === 0
                        ? 'hsl(var(--destructive))'
                        : index === 6
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--foreground))',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 캘린더 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                {calendarDays.map((date, index) => {
                  if (!date) return <div key={index} />

                  const isCurrentMonth = date.getMonth() === month
                  const isDisabled = isDateDisabled(date)
                  const isSelected = isDateSelected(date)
                  const isTodayDate = isToday(date)
                  const isMarked = isMarkedDate(date)
                  const isHovered = hoveredDate &&
                    date.getFullYear() === hoveredDate.getFullYear() &&
                    date.getMonth() === hoveredDate.getMonth() &&
                    date.getDate() === hoveredDate.getDate()

                  const buttonStyle: React.CSSProperties = {
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '2.25rem',
                    width: '2.25rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 150ms',
                    border: 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    ...(!isCurrentMonth && !isSelected ? { opacity: 0.3 } : {}),
                    ...(isSelected ? { backgroundColor: 'hsl(var(--primary, 187 92% 50%))', color: '#fff' } : {}),
                    ...(isTodayDate && !isSelected ? {
                      boxShadow: 'inset 0 0 0 2px hsl(var(--primary, 187 92% 50%))',
                      fontWeight: 700,
                    } : {}),
                    ...(isHovered && !isSelected ? { backgroundColor: 'hsl(var(--primary, 187 92% 50%) / 0.15)' } : {}),
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDateSelect(date)}
                      onMouseEnter={() => setHoveredDate(date)}
                      onMouseLeave={() => setHoveredDate(null)}
                      style={buttonStyle}
                      aria-label={formatDateAriaLabel(date, locale)}
                    >
                      <span style={{ position: 'relative', zIndex: 10, lineHeight: 1 }}>
                        {date.getDate()}
                      </span>
                      {isMarked && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '1px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '9999px',
                            backgroundColor: isSelected ? '#fff' : 'hsl(var(--primary, 187 92% 50%))',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* 오늘 버튼 */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  dot="w-full"
                >
                  {todayText}
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


