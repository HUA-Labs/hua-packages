"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { EmotionButton } from "./EmotionButton";
import { EmotionMeter } from "./EmotionMeter";

/**
 * EmotionSelector 컴포넌트의 props / EmotionSelector component props
 * @typedef {Object} EmotionSelectorProps
 * @property {string} [selectedEmotion] - 선택된 감정 키 / Selected emotion key
 * @property {(emotion: string) => void} [onEmotionSelect] - 감정 선택 콜백 / Emotion selection callback
 * @property {"grid" | "list" | "compact"} [layout="grid"] - 레이아웃 타입 / Layout type
 * @property {boolean} [showIntensity=false] - 강도 조절 표시 여부 / Show intensity control
 * @property {number} [intensity=50] - 감정 강도 (0-100) / Emotion intensity (0-100)
 * @property {(intensity: number) => void} [onIntensityChange] - 강도 변경 콜백 / Intensity change callback
 * @property {Array<Object>} [emotions] - 감정 목록 / Emotions list
 * @property {string} emotions[].key - 감정 키 / Emotion key
 * @property {string} emotions[].label - 감정 라벨 / Emotion label
 * @property {string} [emotions[].icon] - 감정 아이콘 / Emotion icon
 * @property {string} [emotions[].color] - 감정 색상 / Emotion color
 * @property {"sm" | "md" | "lg"} [size="md"] - 감정 버튼 크기 / Emotion button size
 * @property {"button" | "card" | "chip"} [variant="button"] - 감정 표시 스타일 / Emotion display style
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
interface EmotionSelectorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  selectedEmotion?: string;
  onEmotionSelect?: (emotion: string) => void;
  layout?: "grid" | "list" | "compact";
  showIntensity?: boolean;
  intensity?: number;
  onIntensityChange?: (intensity: number) => void;
  emotions?: Array<{
    key: string;
    label: string;
    icon?: string;
    color?: string;
  }>;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "card" | "chip";
  dot?: string;
  style?: React.CSSProperties;
}

const defaultEmotions = [
  { key: "joy", label: "기쁨", icon: "smile", color: "yellow" },
  { key: "sadness", label: "슬픔", icon: "frown", color: "blue" },
  { key: "anger", label: "화남", icon: "angry", color: "red" },
  { key: "calm", label: "평온", icon: "heart", color: "green" },
  { key: "excitement", label: "설렘", icon: "star", color: "pink" },
  { key: "worry", label: "걱정", icon: "meh", color: "gray" },
  { key: "gratitude", label: "감사", icon: "heart", color: "purple" },
  { key: "loneliness", label: "외로움", icon: "user", color: "indigo" },
];

/**
 * EmotionSelector 컴포넌트 / EmotionSelector component
 *
 * 감정을 선택하는 컴포넌트입니다.
 * 여러 감정 옵션을 제공하며, 강도 조절 기능을 포함할 수 있습니다.
 *
 * Component for selecting emotions.
 * Provides multiple emotion options and can include intensity control.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <EmotionSelector
 *   selectedEmotion="joy"
 *   onEmotionSelect={(emotion) => console.log(emotion)}
 * />
 *
 * @example
 * // 강도 조절 포함 / With intensity control
 * <EmotionSelector
 *   selectedEmotion="calm"
 *   onEmotionSelect={handleEmotionSelect}
 *   showIntensity
 *   intensity={intensity}
 *   onIntensityChange={setIntensity}
 *   variant="card"
 * />
 *
 * @param {EmotionSelectorProps} props - EmotionSelector 컴포넌트의 props / EmotionSelector component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} EmotionSelector 컴포넌트 / EmotionSelector component
 */
const EmotionSelector = React.forwardRef<HTMLDivElement, EmotionSelectorProps>(
  (
    {
      dot: dotProp,
      style,
      selectedEmotion,
      onEmotionSelect,
      layout = "grid",
      showIntensity = false,
      intensity = 50,
      onIntensityChange,
      emotions = defaultEmotions,
      size = "md",
      variant = "button",
      ...props
    },
    ref,
  ) => {
    const handleEmotionClick = (emotionKey: string) => {
      onEmotionSelect?.(emotionKey);
    };

    const renderEmotionItem = (emotion: (typeof emotions)[0]) => {
      const isSelected = selectedEmotion === emotion.key;

      if (variant === "button") {
        return (
          <EmotionButton
            key={emotion.key}
            emotion={emotion.key}
            isSelected={isSelected}
            size={size}
            onClick={() => handleEmotionClick(emotion.key)}
            style={
              isSelected
                ? {
                    boxShadow:
                      "0 0 0 1px var(--color-primary, rgb(99 102 241))",
                    outlineOffset: "2px",
                  }
                : undefined
            }
          >
            {emotion.label}
          </EmotionButton>
        );
      }

      if (variant === "card") {
        const cardStyle: React.CSSProperties = mergeStyles(
          resolveDot("p-4 rounded-lg cursor-pointer"),
          {
            borderWidth: "2px",
            borderStyle: "solid",
            transition: "all 200ms ease",
            borderColor: isSelected
              ? "var(--color-primary, rgb(99 102 241))"
              : "var(--color-border, rgb(229 231 235))",
            backgroundColor: isSelected
              ? "color-mix(in srgb, var(--color-primary, rgb(99 102 241)) 5%, transparent)"
              : "transparent",
          },
        );

        const iconWrapStyle: React.CSSProperties = mergeStyles(
          resolveDot("w-8 h-8 rounded-full"),
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected
              ? "var(--color-primary, rgb(99 102 241))"
              : "var(--color-muted, rgb(243 244 246))",
            color: isSelected
              ? "var(--color-primary-foreground, rgb(255 255 255))"
              : undefined,
          },
        );

        return (
          <div
            key={emotion.key}
            style={cardStyle}
            onClick={() => handleEmotionClick(emotion.key)}
          >
            <div style={mergeStyles(resolveDot("flex items-center gap-3"))}>
              <div style={iconWrapStyle}>
                {emotion.icon && (
                  <span style={{ fontSize: "1.125rem" }}>
                    {emotion.icon === "smile" && "😊"}
                    {emotion.icon === "frown" && "😢"}
                    {emotion.icon === "angry" && "😠"}
                    {emotion.icon === "heart" && "❤️"}
                    {emotion.icon === "star" && "⭐"}
                    {emotion.icon === "meh" && "😐"}
                    {emotion.icon === "user" && "👤"}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "120px",
                }}
              >
                {emotion.label}
              </span>
            </div>
          </div>
        );
      }

      if (variant === "chip") {
        const chipStyle: React.CSSProperties = mergeStyles(
          resolveDot("rounded-full cursor-pointer text-sm font-medium"),
          {
            ...resolveDot("py-1 px-3"),
            transition: "all 200ms ease",
            backgroundColor: isSelected
              ? "var(--color-primary, rgb(99 102 241))"
              : "var(--color-muted, rgb(243 244 246))",
            color: isSelected
              ? "var(--color-primary-foreground, rgb(255 255 255))"
              : undefined,
          },
        );

        return (
          <div
            key={emotion.key}
            style={chipStyle}
            onClick={() => handleEmotionClick(emotion.key)}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100px",
                display: "block",
              }}
            >
              {emotion.label}
            </span>
          </div>
        );
      }

      return null;
    };

    const layoutStyles: Record<string, React.CSSProperties> = {
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        ...resolveDot("gap-2"),
      },
      list: {
        display: "flex",
        flexDirection: "column",
        ...resolveDot("gap-2"),
      },
      compact: { display: "flex", flexWrap: "wrap", ...resolveDot("gap-1") },
    };

    const containerStyle = mergeStyles(
      { display: "flex", flexDirection: "column", ...resolveDot("gap-4") },
      resolveDot(dotProp),
      style,
    );

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <div style={layoutStyles[layout]}>
          {emotions.map(renderEmotionItem)}
        </div>

        {showIntensity && selectedEmotion && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              ...resolveDot("gap-3"),
            }}
          >
            <div
              style={mergeStyles(resolveDot("flex items-center"), {
                justifyContent: "space-between",
              })}
            >
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                감정 강도
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-muted-foreground, rgb(107 114 128))",
                }}
              >
                {intensity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange?.(Number(e.target.value))}
              style={{
                width: "100%",
                height: "0.5rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                appearance: "none",
                backgroundColor: "var(--color-muted, rgb(229 231 235))",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--color-muted-foreground, rgb(107 114 128))",
              }}
            >
              <span>약함</span>
              <span>보통</span>
              <span>강함</span>
            </div>
          </div>
        )}

        {selectedEmotion && showIntensity && (
          <div style={resolveDot("flex justify-center")}>
            <EmotionMeter value={intensity} size="md" color="blue" />
          </div>
        )}
      </div>
    );
  },
);

EmotionSelector.displayName = "EmotionSelector";

export { EmotionSelector };
