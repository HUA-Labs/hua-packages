"use client"

import React, { useMemo } from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

/**
 * Slider 컴포넌트의 props
 * @typedef {Object} SliderProps
 * @property {"default" | "primary" | "success" | "warning" | "danger"} [variant="default"] - Slider 스타일 변형
 * @property {"sm" | "md" | "lg"} [size="md"] - Slider 크기
 * @property {boolean} [showValue=false] - 현재 값 표시 여부
 * @property {boolean} [showLabel=false] - 라벨 표시 여부
 * @property {string} [label] - 라벨 텍스트
 * @property {number} [min=0] - 최소값
 * @property {number} [max=100] - 최대값
 * @property {number} [step=1] - 단계값
 * @property {number | number[]} [value=0] - 현재 값 (배열이면 범위 슬라이더)
 * @property {(value: number | number[]) => void} [onValueChange] - 값 변경 콜백
 * @property {"horizontal" | "vertical"} [orientation="horizontal"] - Slider 방향
 * @property {boolean} [disabled=false] - 비활성화 여부
 * @property {string} [dot] - dot 유틸리티 스타일
 * @property {React.CSSProperties} [style] - 인라인 스타일
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size' | 'className'>}
 */
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size' | 'className'> {
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  showLabel?: boolean
  label?: string
  min?: number
  max?: number
  step?: number
  value?: number | number[]
  onValueChange?: (value: number | number[]) => void
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  dot?: string
  style?: React.CSSProperties
}

// ─── Track thickness per size ───────────────────────────────────────────────

const TRACK_THICKNESS: Record<string, number> = {
  sm: 4,
  md: 8,
  lg: 12,
}

// ─── Thumb size per size ─────────────────────────────────────────────────────

const THUMB_SIZE: Record<string, number> = {
  sm: 12,
  md: 16,
  lg: 24,
}

// ─── Track background colors (CSS vars) ─────────────────────────────────────

const TRACK_BG: Record<string, string> = {
  default: 'var(--color-muted, hsl(210 15% 94%))',
  primary: 'color-mix(in sRGB, var(--color-primary, hsl(166 78% 30%)) 20%, transparent)',
  success: 'color-mix(in sRGB, var(--progress-success, rgb(34,197,94)) 20%, transparent)',
  warning: 'color-mix(in sRGB, var(--progress-warning, rgb(234,179,8)) 20%, transparent)',
  danger: 'color-mix(in sRGB, var(--color-destructive, hsl(0 84% 60%)) 20%, transparent)',
}

// ─── Thumb / fill colors (CSS vars) ─────────────────────────────────────────

const THUMB_BG: Record<string, string> = {
  default: 'var(--color-muted-foreground, hsl(210 10% 40%))',
  primary: 'var(--color-primary, hsl(166 78% 30%))',
  success: 'var(--progress-success, rgb(34,197,94))',
  warning: 'var(--progress-warning, rgb(234,179,8))',
  danger: 'var(--color-destructive, hsl(0 84% 60%))',
}

const FILL_BG: Record<string, string> = {
  default: 'var(--color-muted-foreground, hsl(210 10% 40%))',
  primary: 'var(--color-primary, hsl(166 78% 30%))',
  success: 'var(--progress-success, rgb(34,197,94))',
  warning: 'var(--progress-warning, rgb(234,179,8))',
  danger: 'var(--color-destructive, hsl(0 84% 60%))',
}

/**
 * Slider 컴포넌트 / Slider component
 *
 * 숫자 값을 선택하는 슬라이더 컴포넌트입니다.
 * 단일 값 또는 범위 값을 선택할 수 있습니다.
 *
 * Slider component for selecting numeric values.
 * Supports single value or range value selection.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [value, setValue] = useState(50)
 * <Slider value={value} onValueChange={setValue} />
 *
 * @example
 * // 범위 슬라이더 / Range slider
 * const [range, setRange] = useState([20, 80])
 * <Slider
 *   value={range}
 *   onValueChange={setRange}
 *   showValue
 *   label="가격 범위"
 * />
 *
 * @example
 * // 세로 슬라이더 / Vertical slider
 * <Slider
 *   orientation="vertical"
 *   variant="primary"
 *   size="lg"
 *   style={{ height: '16rem' }}
 * />
 *
 * @param {SliderProps} props - Slider 컴포넌트의 props / Slider component props
 * @param {React.Ref<HTMLInputElement>} ref - input 요소 ref / input element ref
 * @returns {JSX.Element} Slider 컴포넌트 / Slider component
 */
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({
    dot: dotProp,
    style,
    variant = "default",
    size = "md",
    showValue = false,
    showLabel = false,
    label,
    min = 0,
    max = 100,
    step = 1,
    value = 0,
    onValueChange,
    orientation = "horizontal",
    disabled = false,
    ...props
  }, ref) => {
    const isRange = Array.isArray(value)
    const currentValue = isRange ? value : [value]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      if (onValueChange) {
        if (isRange) {
          const index = parseInt(e.target.dataset.index || "0")
          const newRange = [...currentValue]
          newRange[index] = newValue
          onValueChange(newRange)
        } else {
          onValueChange(newValue)
        }
      }
    }

    const trackThickness = TRACK_THICKNESS[size]
    const thumbSize = THUMB_SIZE[size]
    const trackBg = TRACK_BG[variant]
    const thumbBg = THUMB_BG[variant]
    const fillBg = FILL_BG[variant]

    const isVertical = orientation === "vertical"

    // ── Outer wrapper style ─────────────────────────────────────────────────
    const wrapperStyle = useMemo((): React.CSSProperties => mergeStyles(
      {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexDirection: isVertical ? 'column' : 'row',
        width: isVertical ? undefined : '100%',
        height: isVertical ? '100%' : undefined,
      },
      resolveDot(dotProp),
      style,
    ), [isVertical, dotProp, style])

    // ── Track background style ──────────────────────────────────────────────
    const trackStyle = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        borderRadius: '9999px',
        backgroundColor: trackBg,
      }
      if (isVertical) {
        return {
          ...base,
          width: trackThickness,
          height: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
        }
      }
      return {
        ...base,
        height: trackThickness,
        width: '100%',
      }
    }, [isVertical, trackThickness, trackBg])

    // ── Fill style factory ──────────────────────────────────────────────────
    const buildFillStyle = (startPct: number, sizePct: number): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        borderRadius: '9999px',
        backgroundColor: fillBg,
      }
      if (isVertical) {
        return {
          ...base,
          width: trackThickness,
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `${startPct}%`,
          height: `${sizePct}%`,
        }
      }
      return {
        ...base,
        height: trackThickness,
        left: `${startPct}%`,
        width: `${sizePct}%`,
      }
    }

    // ── Thumb style factory ─────────────────────────────────────────────────
    const buildThumbStyle = (positionPct: number): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        width: thumbSize,
        height: thumbSize,
        borderRadius: '9999px',
        border: '2px solid white',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        transition: 'transform 200ms ease-in-out',
        backgroundColor: thumbBg,
      }
      if (disabled) {
        base.cursor = 'not-allowed'
        base.opacity = 0.5
      }
      if (isVertical) {
        return {
          ...base,
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `${positionPct}%`,
        }
      }
      return {
        ...base,
        top: '50%',
        transform: 'translateY(-50%)',
        left: `${positionPct}%`,
      }
    }

    // ── Hidden input style ──────────────────────────────────────────────────
    const hiddenInputStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%',
      height: '100%',
      margin: 0,
    }

    const renderInput = (index: number = 0) => (
      <input
        key={index}
        ref={index === 0 ? ref : undefined}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[index]}
        onChange={handleChange}
        data-index={index}
        disabled={disabled}
        style={{
          ...hiddenInputStyle,
          ...(isVertical && {
            writingMode: 'vertical-rl' as const,
            WebkitAppearance: 'slider-vertical',
          }),
        }}
        {...props}
      />
    )

    const renderValue = () => {
      if (!showValue) return null

      const valueTextStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        fontFamily: 'monospace',
        color: 'var(--color-muted-foreground, hsl(210 10% 40%))',
      }

      if (isRange) {
        return (
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground, hsl(210 10% 40%))' }}>
            {currentValue.map((val, index) => (
              <span key={index} style={valueTextStyle}>{val}</span>
            ))}
          </div>
        )
      }

      return (
        <span style={valueTextStyle}>{currentValue[0]}</span>
      )
    }

    const labelStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'var(--color-foreground, hsl(210 10% 10%))',
      minWidth: 0,
    }

    // Outer track container — holds track bg, fill, thumb, hidden inputs
    const trackContainerStyle: React.CSSProperties = isVertical
      ? { position: 'relative', height: '100%' }
      : { position: 'relative', width: '100%', height: '1rem', display: 'flex', alignItems: 'center' }

    const fillStartPct = isRange
      ? (currentValue[0] - min) / (max - min) * 100
      : 0
    const fillSizePct = isRange
      ? (currentValue[1] - currentValue[0]) / (max - min) * 100
      : (currentValue[0] - min) / (max - min) * 100

    return (
      <div style={wrapperStyle}>
        {showLabel && label && (
          <label style={labelStyle}>{label}</label>
        )}

        <div style={{ flex: 1, position: 'relative', ...(isVertical ? { height: '100%' } : { width: '100%' }) }}>
          <div style={trackContainerStyle}>
            {/* Background track */}
            <div style={trackStyle} />

            {/* Fill track */}
            <div style={buildFillStyle(fillStartPct, fillSizePct)} />

            {/* Thumb(s) */}
            {isRange ? (
              currentValue.map((_, index) => (
                <div
                  key={index}
                  style={buildThumbStyle((currentValue[index] - min) / (max - min) * 100)}
                />
              ))
            ) : (
              <div style={buildThumbStyle((currentValue[0] - min) / (max - min) * 100)} />
            )}
          </div>

          {/* Hidden native inputs */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0 }}>
            {isRange
              ? currentValue.map((_, index) => renderInput(index))
              : renderInput()
            }
          </div>
        </div>

        {renderValue()}
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
