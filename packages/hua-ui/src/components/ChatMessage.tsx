"use client";

import React, { useMemo } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import { Badge } from "./Badge";
import { Card, CardContent } from "./Card";

const s = (input: string) => dotFn(input) as React.CSSProperties;

/**
 * ChatMessage 컴포넌트의 props / ChatMessage component props
 * @typedef {Object} ChatMessageProps
 * @property {Object} message - 메시지 데이터 / Message data
 * @property {string} message.id - 메시지 ID / Message ID
 * @property {string} message.content - 메시지 내용 / Message content
 * @property {"user" | "assistant" | "system"} message.role - 메시지 역할 / Message role
 * @property {Date} message.timestamp - 메시지 타임스탬프 / Message timestamp
 * @property {string} [message.emotion] - 감정 정보 / Emotion information
 * @property {number} [message.intensity] - 감정 강도 / Emotion intensity
 * @property {boolean} [message.isTyping] - 타이핑 중 여부 / Typing state
 * @property {Object} [user] - 사용자 정보 / User information
 * @property {string} [user.name="사용자"] - 사용자 이름 / User name
 * @property {string} [user.avatar] - 사용자 아바타 URL / User avatar URL
 * @property {string} [user.color="#3b82f6"] - 사용자 색상 / User color
 * @property {Object} [assistant] - AI 어시스턴트 정보 / AI assistant information
 * @property {string} [assistant.name="AI"] - AI 이름 / AI name
 * @property {string} [assistant.avatar] - AI 아바타 URL / AI avatar URL
 * @property {string} [assistant.color="#10b981"] - AI 색상 / AI color
 * @property {boolean} [showAvatar=true] - 아바타 표시 여부 / Show avatar
 * @property {boolean} [showTimestamp=true] - 타임스탬프 표시 여부 / Show timestamp
 * @property {boolean} [showEmotion=true] - 감정 표시 여부 / Show emotion
 * @property {"default" | "compact" | "bubble"} [variant="default"] - ChatMessage 스타일 변형 / ChatMessage style variant
 * @property {Object} [theme] - 커스텀 테마 / Custom theme
 * @property {string} [theme.userBubbleBg] - 사용자 버블 배경색 / User bubble background color
 * @property {string} [theme.userBubbleText] - 사용자 버블 텍스트 색상 / User bubble text color
 * @property {string} [theme.aiBubbleBg] - AI 버블 배경색 / AI bubble background color
 * @property {string} [theme.aiBubbleText] - AI 버블 텍스트 색상 / AI bubble text color
 */
export interface ChatMessageProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    timestamp: Date;
    emotion?: string;
    intensity?: number;
    isTyping?: boolean;
  };
  user?: {
    name?: string;
    avatar?: string;
    color?: string;
  };
  assistant?: {
    name?: string;
    avatar?: string;
    color?: string;
  };
  showAvatar?: boolean;
  showTimestamp?: boolean;
  showEmotion?: boolean;
  variant?: "default" | "compact" | "bubble";
  theme?: {
    userBubbleBg?: string;
    userBubbleText?: string;
    aiBubbleBg?: string;
    aiBubbleText?: string;
  };
  dot?: string;
  style?: React.CSSProperties;
}

/** Emotion color map — CSSProperties per emotion key */
type EmotionStyle = { backgroundColor: string; color: string };

const EMOTION_STYLES: Record<string, EmotionStyle> = {
  joy: { backgroundColor: "#fef9c3", color: "#854d0e" },
  sadness: { backgroundColor: "#e0e7ff", color: "#0e7490" },
  anger: { backgroundColor: "#fee2e2", color: "#991b1b" },
  calm: { backgroundColor: "#dcfce7", color: "#166534" },
  excitement: { backgroundColor: "#fce7f3", color: "#9d174d" },
  worry: { backgroundColor: "#f3f4f6", color: "#1f2937" },
  gratitude: { backgroundColor: "#f3e8ff", color: "#6b21a8" },
  loneliness: { backgroundColor: "#e0e7ff", color: "#3730a3" },
};

const DEFAULT_EMOTION_STYLE: EmotionStyle = {
  backgroundColor: "#f3f4f6",
  color: "#1f2937",
};

function getEmotionStyle(emotion?: string): EmotionStyle {
  if (!emotion) return DEFAULT_EMOTION_STYLE;
  return EMOTION_STYLES[emotion] ?? DEFAULT_EMOTION_STYLE;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Animated bounce dots for typing indicator */
const TypingDots = ({ size = 8 }: { size?: number }) => {
  const dotStyle: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: "currentColor",
    borderRadius: "50%",
    animation: "bounce 1s infinite",
  };
  return (
    <div style={s("flex gap-1")}>
      <div style={dotStyle} />
      <div style={{ ...dotStyle, animationDelay: "100ms" }} />
      <div style={{ ...dotStyle, animationDelay: "200ms" }} />
    </div>
  );
};

/**
 * ChatMessage 컴포넌트
 *
 * 채팅 메시지를 표시하는 컴포넌트입니다.
 * 사용자, AI 어시스턴트, 시스템 메시지를 지원하며, 감정 정보를 표시할 수 있습니다.
 *
 * @component
 * @example
 * // 기본 사용
 * <ChatMessage
 *   message={{
 *     id: "1",
 *     content: "안녕하세요!",
 *     role: "user",
 *     timestamp: new Date()
 *   }}
 * />
 *
 * @example
 * // AI 메시지, 감정 정보 포함
 * <ChatMessage
 *   message={{
 *     id: "2",
 *     content: "안녕하세요! 도와드릴까요?",
 *     role: "assistant",
 *     timestamp: new Date(),
 *     emotion: "joy",
 *     intensity: 0.8
 *   }}
 *   variant="bubble"
 * />
 *
 * @param {ChatMessageProps} props - ChatMessage 컴포넌트의 props / ChatMessage component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ChatMessage 컴포넌트 / ChatMessage component
 */
const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      dot: dotProp,
      style,
      message,
      user = { name: "사용자", color: "#3b82f6" },
      assistant = { name: "AI", color: "#10b981" },
      showAvatar = true,
      showTimestamp = true,
      showEmotion = true,
      variant = "default",
      theme = {
        userBubbleBg: "#3b82f6",
        userBubbleText: "#ffffff",
        aiBubbleBg: "#f3f4f6",
        aiBubbleText: "#1f2937",
      },
      ...props
    },
    ref,
  ) => {
    const isUser = message.role === "user";
    const emotionStyle = getEmotionStyle(message.emotion);

    // --- bubble variant styles ---
    const bubbleOuterStyle = useMemo(
      () =>
        mergeStyles(
          s("flex w-full"),
          isUser
            ? { justifyContent: "flex-end" }
            : { justifyContent: "flex-start" },
          variant === "bubble" ? resolveDot(dotProp) : undefined,
          variant === "bubble" ? style : undefined,
        ),
      [isUser, variant, dotProp, style],
    );

    const bubbleInnerStyle = useMemo(
      () =>
        mergeStyles(
          s("flex gap-2"),
          { maxWidth: "80%" },
          isUser ? { flexDirection: "row-reverse" } : { flexDirection: "row" },
        ),
      [isUser],
    );

    const bubbleMsgStyle = useMemo(
      () =>
        mergeStyles(
          {
            ...resolveDot("py-2 px-4"),
            borderRadius: 16,
            maxWidth: "100%",
            wordBreak: "break-word" as React.CSSProperties["wordBreak"],
            backgroundColor: isUser ? theme.userBubbleBg : theme.aiBubbleBg,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
          },
          isUser
            ? { borderBottomRightRadius: 4 }
            : { borderBottomLeftRadius: 4 },
        ),
      [isUser, theme],
    );

    const bubbleMetaStyle = useMemo(
      () =>
        mergeStyles(
          s("flex items-center gap-2"),
          { ...resolveDot("text-xs"), color: "var(--color-muted-foreground)" },
          isUser
            ? { justifyContent: "flex-end" }
            : { justifyContent: "flex-start" },
        ),
      [isUser],
    );

    // --- compact variant styles ---
    const compactOuterStyle = useMemo(
      () =>
        mergeStyles(
          s("flex items-start gap-3"),
          resolveDot("py-2"),
          variant === "compact" ? resolveDot(dotProp) : undefined,
          variant === "compact" ? style : undefined,
        ),
      [variant, dotProp, style],
    );

    // --- default variant styles ---
    const defaultOuterStyle = useMemo(
      () =>
        mergeStyles(
          s("flex items-start gap-3"),
          resolveDot("py-4"),
          variant === "default" ? resolveDot(dotProp) : undefined,
          variant === "default" ? style : undefined,
        ),
      [variant, dotProp, style],
    );

    const cardStyle = useMemo(
      () =>
        isUser
          ? {
              display: "inline-block" as const,
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }
          : {
              display: "inline-block" as const,
              backgroundColor: "var(--color-muted)",
            },
      [isUser],
    );

    if (variant === "bubble") {
      return (
        <div ref={ref} style={bubbleOuterStyle} {...props}>
          <div style={bubbleInnerStyle}>
            {showAvatar && (
              <Avatar dot="w-8 h-8 flex-shrink-0">
                <AvatarImage
                  src={isUser ? user.avatar : assistant.avatar}
                  alt={isUser ? user.name : assistant.name}
                />
                <AvatarFallback
                  style={{
                    backgroundColor: isUser ? user.color : assistant.color,
                  }}
                >
                  {(isUser ? user.name : assistant.name)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}

            <div style={s("flex flex-col gap-1")}>
              <div style={bubbleMsgStyle}>
                {message.isTyping ? (
                  <TypingDots size={8} />
                ) : (
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </div>
                )}
              </div>

              <div style={bubbleMetaStyle}>
                {showTimestamp && <span>{formatTime(message.timestamp)}</span>}
                {showEmotion && message.emotion && (
                  <Badge variant="secondary" style={emotionStyle}>
                    {message.emotion}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "compact") {
      return (
        <div ref={ref} style={compactOuterStyle} {...props}>
          {showAvatar && (
            <Avatar dot="w-6 h-6 flex-shrink-0">
              <AvatarImage
                src={isUser ? user.avatar : assistant.avatar}
                alt={isUser ? user.name : assistant.name}
              />
              <AvatarFallback
                style={{
                  backgroundColor: isUser ? user.color : assistant.color,
                }}
              >
                {(isUser ? user.name : assistant.name)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={mergeStyles(
                s("flex items-center gap-2"),
                resolveDot("mb-1"),
              )}
            >
              <span style={{ ...resolveDot("text-sm"), fontWeight: 500 }}>
                {isUser ? user.name : assistant.name}
              </span>
              {showTimestamp && (
                <span
                  style={{
                    ...resolveDot("text-xs"),
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {formatTime(message.timestamp)}
                </span>
              )}
              {showEmotion && message.emotion && (
                <Badge variant="secondary" style={emotionStyle}>
                  {message.emotion}
                </Badge>
              )}
            </div>

            <div style={resolveDot("text-sm")}>
              {message.isTyping ? (
                <TypingDots size={6} />
              ) : (
                <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // default variant
    return (
      <div ref={ref} style={defaultOuterStyle} {...props}>
        {showAvatar && (
          <Avatar dot="w-10 h-10 flex-shrink-0">
            <AvatarImage
              src={isUser ? user.avatar : assistant.avatar}
              alt={isUser ? user.name : assistant.name}
            />
            <AvatarFallback
              style={{ backgroundColor: isUser ? user.color : assistant.color }}
            >
              {(isUser ? user.name : assistant.name)?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={mergeStyles(
              s("flex items-center gap-2"),
              resolveDot("mb-2"),
            )}
          >
            <span style={{ fontWeight: 500 }}>
              {isUser ? user.name : assistant.name}
            </span>
            {showTimestamp && (
              <span
                style={{
                  ...resolveDot("text-sm"),
                  color: "var(--color-muted-foreground)",
                }}
              >
                {formatTime(message.timestamp)}
              </span>
            )}
            {showEmotion && message.emotion && (
              <Badge variant="secondary" style={emotionStyle}>
                {message.emotion}
              </Badge>
            )}
          </div>

          <Card style={cardStyle}>
            <CardContent dot="p-3">
              {message.isTyping ? (
                <TypingDots size={8} />
              ) : (
                <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = "ChatMessage";

export { ChatMessage };
