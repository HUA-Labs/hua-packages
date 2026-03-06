"use client";

/**
 * ColorPicker 컴포넌트
 *
 * 탭 기반 컬러 피커 (의존성 없음)
 * - Tailwind 탭: Tailwind CSS 프리셋 팔레트
 * - Custom 탭: HSL 슬라이더 + HEX 입력
 *
 * @example
 * ```tsx
 * <ColorPicker value="#3b82f6" onChange={(color) => console.log(color)} />
 * ```
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

export interface ColorPickerProps {
  /** 현재 색상 값 (HEX 또는 'transparent') */
  value: string;
  /** 색상 변경 콜백 */
  onChange: (color: string) => void;
  /** dot 유틸리티 스타일 */
  dot?: string;
  /** 추가 인라인 스타일 */
  style?: React.CSSProperties;
  /** 비활성화 여부 */
  disabled?: boolean;
}

type TabType = "tailwind" | "custom";

// Tailwind 팔레트 프리셋
const TAILWIND_PALETTE = {
  gray: ["#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827"],
  red: ["#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"],
  orange: ["#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"],
  amber: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
  yellow: ["#fefce8", "#fef9c3", "#fef08a", "#fde047", "#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e", "#713f12"],
  lime: ["#f7fee7", "#ecfccb", "#d9f99d", "#bef264", "#a3e635", "#84cc16", "#65a30d", "#4d7c0f", "#3f6212", "#365314"],
  green: ["#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"],
  emerald: ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
  teal: ["#f0fdfa", "#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a"],
  cyan: ["#ecfeff", "#cffafe", "#a5f3fc", "#67e8f9", "#22d3ee", "#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63"],
  sky: ["#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"],
  blue: ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
  indigo: ["#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"],
  violet: ["#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
  purple: ["#faf5ff", "#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87"],
  fuchsia: ["#fdf4ff", "#fae8ff", "#f5d0fe", "#f0abfc", "#e879f9", "#d946ef", "#c026d3", "#a21caf", "#86198f", "#701a75"],
  pink: ["#fdf2f8", "#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
  rose: ["#fff1f2", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337"],
};

const SPECIAL_COLORS = ["#000000", "#ffffff", "transparent"];

// HEX to HSL
function hexToHsl(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 100, 50];

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// 유효한 색상인지 체크
function isValidColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color) || color === "transparent";
}

/**
 * Saturation-Lightness 2D 박스
 */
function SaturationLightnessPicker({
  hue,
  saturation,
  lightness,
  onChange,
  disabled,
}: {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (s: number, l: number) => void;
  disabled?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleChange = useCallback(
    (clientX: number, clientY: number) => {
      if (!boxRef.current || disabled) return;
      const rect = boxRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const newS = Math.round(x * 100);
      const newL = Math.round((1 - y) * 100);
      onChange(newS, newL);
    },
    [onChange, disabled]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    handleChange(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleChange(e.clientX, e.clientY);
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleChange]);

  const cursorX = saturation;
  const cursorY = 100 - lightness;

  return (
    <div
      ref={boxRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '7rem',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'crosshair',
        opacity: disabled ? 0.5 : 1,
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
        `,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          position: 'absolute',
          width: '1rem',
          height: '1rem',
          transform: 'translate(-50%, -50%)',
          borderRadius: '9999px',
          border: '2px solid white',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          left: `${cursorX}%`,
          top: `${cursorY}%`,
          background: hslToHex(hue, saturation, lightness),
        }}
      />
    </div>
  );
}

/**
 * Hue 슬라이더
 */
function HueSlider({
  hue,
  onChange,
  disabled,
}: {
  hue: number;
  onChange: (h: number) => void;
  disabled?: boolean;
}) {
  // Keep className for complex pseudo-element selectors that can't be done with inline styles
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={[
          "w-full h-3 rounded-md appearance-none cursor-pointer",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
          "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-current",
          "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5",
          "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white",
          "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-current",
          "[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].filter(Boolean).join(' ')}
        style={{
          background: `linear-gradient(to right,
            hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%),
            hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%)
          )`,
          color: `hsl(${hue}, 100%, 50%)`,
        }}
      />
    </div>
  );
}

/**
 * Tailwind 프리셋 탭
 */
function TailwindTab({
  currentColor,
  onColorSelect,
  disabled,
}: {
  currentColor: string;
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* 팔레트 그리드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {Object.entries(TAILWIND_PALETTE).map(([colorName, shades]) => (
          <div key={colorName} style={{ display: 'flex', gap: '0.125rem' }}>
            {shades.map((color, idx) => (
              <button
                key={`${colorName}-${idx}`}
                type="button"
                disabled={disabled}
                style={{
                  flex: 1,
                  aspectRatio: '1',
                  borderRadius: '2px',
                  border: currentColor.toLowerCase() === color.toLowerCase()
                    ? '1px solid hsl(var(--ring))'
                    : 'none',
                  background: color,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  outline: currentColor.toLowerCase() === color.toLowerCase()
                    ? '1px solid hsl(var(--ring))'
                    : 'none',
                  outlineOffset: currentColor.toLowerCase() === color.toLowerCase() ? '1px' : '0',
                  transition: 'transform 150ms',
                }}
                onClick={() => onColorSelect(color)}
                title={`${colorName}-${(idx + 1) * 100}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 특수 색상 */}
      <div style={{ display: 'flex', gap: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid hsl(var(--border))' }}>
        {SPECIAL_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '0.125rem',
              border: '1px solid hsl(var(--border) / 0.5)',
              outline: currentColor === color ? '1px solid hsl(var(--ring))' : 'none',
              outlineOffset: currentColor === color ? '1px' : '0',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'transform 150ms',
              background: color === "transparent"
                ? "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                : color,
            }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
        <span style={{ flex: 1, fontSize: '0.625rem', color: 'hsl(var(--muted-foreground))', alignSelf: 'center', textAlign: 'right' }}>
          Black / White / Transparent
        </span>
      </div>
    </div>
  );
}

/**
 * Custom 탭 (HSL + HEX)
 */
function CustomTab({
  h,
  s,
  l,
  hexInput,
  onHslChange,
  onHexInputChange,
  disabled,
}: {
  h: number;
  s: number;
  l: number;
  hexInput: string;
  onHslChange: (h: number, s: number, l: number) => void;
  onHexInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const currentColor = hslToHex(h, s, l);
  const isInvalid = !isValidColor(hexInput);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Saturation/Lightness 박스 */}
      <SaturationLightnessPicker
        hue={h}
        saturation={s}
        lightness={l}
        onChange={(newS, newL) => onHslChange(h, newS, newL)}
        disabled={disabled}
      />

      {/* Hue 슬라이더 */}
      <HueSlider hue={h} onChange={(newH) => onHslChange(newH, s, l)} disabled={disabled} />

      {/* 프리뷰 + HEX 입력 */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.375rem',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
            flexShrink: 0,
            background: currentColor,
          }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={onHexInputChange}
          disabled={disabled}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            borderRadius: '0.375rem',
            border: isInvalid ? '1px solid hsl(var(--destructive))' : '1px solid hsl(var(--border))',
            backgroundColor: 'hsl(var(--background))',
            fontFamily: 'monospace',
            outline: 'none',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* HSL 값 표시 */}
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.625rem', color: 'hsl(var(--muted-foreground))' }}>
        <span>H: {h}°</span>
        <span>S: {s}%</span>
        <span>L: {l}%</span>
      </div>
    </div>
  );
}

/**
 * ColorPicker 컴포넌트
 *
 * 탭 기반 컬러 피커로 Tailwind CSS 프리셋과 커스텀 HSL 피커를 제공합니다.
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, dot: dotProp, style, disabled = false }, ref) => {
    const dotStyle = dotProp ? resolveDot(dotProp) : undefined
    const [activeTab, setActiveTab] = useState<TabType>("tailwind");

    // HSL 상태
    const [hue, saturation, lightness] = hexToHsl(value || "#3b82f6");
    const [h, setH] = useState(hue);
    const [s, setS] = useState(saturation);
    const [l, setL] = useState(lightness);
    const [hexInput, setHexInput] = useState(value || "#3b82f6");

    // 외부 value 변경 시 동기화
    useEffect(() => {
      if (isValidColor(value)) {
        const [newH, newS, newL] = hexToHsl(value);
        setH(newH);
        setS(newS);
        setL(newL);
        setHexInput(value);
      }
    }, [value]);

    // HSL 변경 핸들러
    const handleHslChange = useCallback(
      (newH: number, newS: number, newL: number) => {
        setH(newH);
        setS(newS);
        setL(newL);
        const hex = hslToHex(newH, newS, newL);
        setHexInput(hex);
        onChange(hex);
      },
      [onChange]
    );

    // HEX 입력 핸들러
    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      let hex = e.target.value;
      if (!hex.startsWith("#")) hex = "#" + hex;
      setHexInput(hex);
      if (isValidColor(hex)) {
        const [newH, newS, newL] = hexToHsl(hex);
        setH(newH);
        setS(newS);
        setL(newL);
        onChange(hex);
      }
    };

    // 프리셋 색상 선택
    const handleColorSelect = (color: string) => {
      if (disabled) return;
      if (color === "transparent") {
        setHexInput("transparent");
        onChange("transparent");
        return;
      }
      const [newH, newS, newL] = hexToHsl(color);
      setH(newH);
      setS(newS);
      setL(newL);
      setHexInput(color);
      onChange(color);
    };

    const currentColor = hslToHex(h, s, l);

    return (
      <div ref={ref} style={mergeStyles({ display: 'flex', flexDirection: 'column', gap: '0.5rem' }, dotStyle, style)}>
        {/* 탭 헤더 */}
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.125rem', backgroundColor: 'hsl(var(--muted) / 0.5)', borderRadius: '0.375rem' }}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setActiveTab("tailwind")}
            style={{
              flex: 1,
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '0.25rem',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'colors 150ms',
              backgroundColor: activeTab === "tailwind" ? 'hsl(var(--background))' : 'transparent',
              color: activeTab === "tailwind" ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: activeTab === "tailwind" ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            Tailwind
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setActiveTab("custom")}
            style={{
              flex: 1,
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '0.25rem',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'colors 150ms',
              backgroundColor: activeTab === "custom" ? 'hsl(var(--background))' : 'transparent',
              color: activeTab === "custom" ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: activeTab === "custom" ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            Custom
          </button>
        </div>

        {/* 현재 색상 미리보기 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.25rem' }}>
          <div
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '0.25rem',
              border: '1px solid hsl(var(--border))',
              boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
              flexShrink: 0,
              background: hexInput === "transparent"
                ? "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                : currentColor,
            }}
          />
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hexInput === "transparent" ? "transparent" : currentColor}
          </span>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "tailwind" ? (
          <TailwindTab currentColor={hexInput} onColorSelect={handleColorSelect} disabled={disabled} />
        ) : (
          <CustomTab
            h={h}
            s={s}
            l={l}
            hexInput={hexInput}
            onHslChange={handleHslChange}
            onHexInputChange={handleHexInputChange}
            disabled={disabled}
          />
        )}
      </div>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;
