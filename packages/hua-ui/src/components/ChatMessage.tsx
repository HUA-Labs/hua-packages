'use client'

import * as React from "react"
import { cn } from "../lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar"
import { Badge } from "./Badge"
import { Card, CardContent } from "./Card"

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
    const isAssistant = message.role === "assistant"
    const isSystem = message.role === "system"

    const getEmotionColor = (emotion?: string) => {
      if (!emotion) return "bg-gray-100"
      
      const emotionColors = {
        joy: "bg-yellow-100 text-yellow-800",
        sadness: "bg-blue-100 text-blue-800",
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
          className={cn(
            "flex w-full",
            isUser ? "justify-end" : "justify-start",
            className
          )}
          {...props}
        >
          <div className={cn(
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
                className={cn(
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
              
              <div className={cn(
                "flex items-center space-x-2 text-xs text-muted-foreground",
                isUser ? "justify-end" : "justify-start"
              )}>
                {showTimestamp && (
                  <span>{formatTime(message.timestamp)}</span>
                )}
                {showEmotion && message.emotion && (
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getEmotionColor(message.emotion))}
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
          className={cn(
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
                  className={cn("text-xs", getEmotionColor(message.emotion))}
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
        className={cn(
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
                className={cn("text-xs", getEmotionColor(message.emotion))}
              >
                {message.emotion}
              </Badge>
            )}
          </div>
          
          <Card className={cn(
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