'use client'

import React from "react"
import { merge } from "../lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar"
import { Badge } from "./Badge"
import { Card, CardContent } from "./Card"

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
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: {
    id: string
    content: string
    role: "user" | "assistant" | "system"
    timestamp: Date
    emotion?: string
    intensity?: number
    isTyping?: boolean
  }
  user?: {
    name?: string
    avatar?: string
    color?: string
  }
  assistant?: {
    name?: string
    avatar?: string
    color?: string
  }
  showAvatar?: boolean
  showTimestamp?: boolean
  showEmotion?: boolean
  variant?: "default" | "compact" | "bubble"
  theme?: {
    userBubbleBg?: string
    userBubbleText?: string
    aiBubbleBg?: string
    aiBubbleText?: string
  }
}

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
  ({ 
    className, 
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
      aiBubbleText: "#1f2937"
    },
    ...props 
  }, ref) => {
    const isUser = message.role === "user"
    const _isAssistant = message.role === "assistant"
    const _isSystem = message.role === "system"

    const getEmotionColor = (emotion?: string) => {
      if (!emotion) return "bg-gray-100"
      
      const emotionColors = {
        joy: "bg-yellow-100 text-yellow-800",
        sadness: "bg-indigo-100 text-cyan-800",
        anger: "bg-red-100 text-red-800",
        calm: "bg-green-100 text-green-800",
        excitement: "bg-pink-100 text-pink-800",
        worry: "bg-gray-100 text-gray-800",
        gratitude: "bg-purple-100 text-purple-800",
        loneliness: "bg-indigo-100 text-indigo-800"
      }
      
      return emotionColors[emotion as keyof typeof emotionColors] || "bg-gray-100 text-gray-800"
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    if (variant === "bubble") {
      return (
        <div
          ref={ref}
          className={merge(
            "flex w-full",
            isUser ? "justify-end" : "justify-start",
            className
          )}
          {...props}
        >
          <div className={merge(
            "flex max-w-[80%] space-x-2",
            isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
          )}>
            {showAvatar && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage
                  src={isUser ? user.avatar : assistant.avatar}
                  alt={isUser ? user.name : assistant.name}
                />
                <AvatarFallback
                  style={{
                    backgroundColor: isUser ? user.color : assistant.color
                  }}
                >
                  {(isUser ? user.name : assistant.name)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="space-y-1">
              <div
                className={merge(
                  "px-4 py-2 rounded-2xl max-w-full break-words",
                  isUser 
                    ? "rounded-br-md" 
                    : "rounded-bl-md"
                )}
                style={{
                  backgroundColor: isUser ? theme.userBubbleBg : theme.aiBubbleBg,
                  color: isUser ? theme.userBubbleText : theme.aiBubbleText
                }}
              >
                {message.isTyping ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
              
              <div className={merge(
                "flex items-center space-x-2 text-xs text-muted-foreground",
                isUser ? "justify-end" : "justify-start"
              )}>
                {showTimestamp && (
                  <span>{formatTime(message.timestamp)}</span>
                )}
                {showEmotion && message.emotion && (
                  <Badge 
                    variant="secondary" 
                    className={merge("text-xs", getEmotionColor(message.emotion))}
                  >
                    {message.emotion}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className={merge(
            "flex items-start space-x-3 py-2",
            className
          )}
          {...props}
        >
          {showAvatar && (
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage
                src={isUser ? user.avatar : assistant.avatar}
                alt={isUser ? user.name : assistant.name}
              />
              <AvatarFallback
                style={{
                  backgroundColor: isUser ? user.color : assistant.color
                }}
              >
                {(isUser ? user.name : assistant.name)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium">
                {isUser ? user.name : assistant.name}
              </span>
              {showTimestamp && (
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
              )}
              {showEmotion && message.emotion && (
                <Badge 
                  variant="secondary" 
                  className={merge("text-xs", getEmotionColor(message.emotion))}
                >
                  {message.emotion}
                </Badge>
              )}
            </div>
            
            <div className="text-sm">
              {message.isTyping ? (
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // default variant
    return (
      <div
        ref={ref}
        className={merge(
          "flex items-start space-x-3 py-4",
          className
        )}
        {...props}
      >
        {showAvatar && (
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage
              src={isUser ? user.avatar : assistant.avatar}
              alt={isUser ? user.name : assistant.name}
            />
            <AvatarFallback
              style={{
                backgroundColor: isUser ? user.color : assistant.color
              }}
            >
              {(isUser ? user.name : assistant.name)?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium">
              {isUser ? user.name : assistant.name}
            </span>
            {showTimestamp && (
              <span className="text-sm text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            )}
            {showEmotion && message.emotion && (
              <Badge 
                variant="secondary" 
                className={merge("text-xs", getEmotionColor(message.emotion))}
              >
                {message.emotion}
              </Badge>
            )}
          </div>
          
          <Card className={merge(
            "inline-block",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <CardContent className="p-3">
              {message.isTyping ? (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
)

ChatMessage.displayName = "ChatMessage"

export { ChatMessage } 