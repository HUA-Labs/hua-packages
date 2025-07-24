'use client'

import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card"
import { Badge } from "./Badge"
import { EmotionMeter } from "./EmotionMeter"

interface EmotionAnalysisProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryEmotion?: {
    name: string
    intensity: number
    color?: string
  }
  emotionDistribution?: Array<{
    emotion: string
    percentage: number
    color: string
  }>
  keywords?: string[]
  intensity?: number
  positivity?: number
  energy?: number
  showMeter?: boolean
  showDistribution?: boolean
  showKeywords?: boolean
  showMetrics?: boolean
  layout?: "compact" | "detailed" | "card"
}

const EmotionAnalysis = React.forwardRef<HTMLDivElement, EmotionAnalysisProps>(
  ({ 
    className, 
    primaryEmotion,
    emotionDistribution = [],
    keywords = [],
    intensity = 50,
    positivity = 70,
    energy = 60,
    showMeter = true,
    showDistribution = true,
    showKeywords = true,
    showMetrics = true,
    layout = "detailed",
    ...props 
  }, ref) => {
    const getIntensityLabel = (value: number) => {
      if (value < 30) return "약함"
      if (value < 70) return "보통"
      return "강함"
    }

    const getPositivityLabel = (value: number) => {
      if (value < 30) return "부정적"
      if (value < 70) return "중립적"
      return "긍정적"
    }

    const getEnergyLabel = (value: number) => {
      if (value < 30) return "낮음"
      if (value < 70) return "보통"
      return "높음"
    }

    if (layout === "compact") {
      return (
        <div
          ref={ref}
          className={cn("space-y-3", className)}
          {...props}
        >
          {primaryEmotion && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">주요 감정:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {primaryEmotion.name} ({primaryEmotion.intensity}%)
                </span>
                {showMeter && (
                  <EmotionMeter
                    value={primaryEmotion.intensity}
                    size="sm"
                    color="blue"
                  />
                )}
              </div>
            </div>
          )}

          {showMetrics && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">감정 강도:</span>
                <span className="text-sm text-muted-foreground">
                  {getIntensityLabel(intensity)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">긍정성:</span>
                <span className="text-sm text-muted-foreground">
                  {getPositivityLabel(positivity)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">에너지:</span>
                <span className="text-sm text-muted-foreground">
                  {getEnergyLabel(energy)}
                </span>
              </div>
            </>
          )}

          {showKeywords && keywords.length > 0 && (
            <div>
              <span className="text-sm font-medium">키워드:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (layout === "card") {
      return (
        <Card
          ref={ref}
          className={cn("", className)}
          {...props}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">✨</span>
              AI 분석
            </CardTitle>
            <CardDescription>
              감정 분석 결과
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {primaryEmotion && (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">주요 감정:</span>
                  <span className="ml-2 text-muted-foreground">
                    {primaryEmotion.name} ({primaryEmotion.intensity}%)
                  </span>
                </div>
                {showMeter && (
                  <div className="flex justify-center">
                    <EmotionMeter
                      value={primaryEmotion.intensity}
                      size="md"
                      color="blue"
                    />
                  </div>
                )}
              </div>
            )}

            {showMetrics && (
              <>
                <div className="text-sm">
                  <span className="font-medium">감정 강도:</span>
                  <span className="ml-2 text-muted-foreground">
                    {getIntensityLabel(intensity)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">긍정성:</span>
                  <span className="ml-2 text-muted-foreground">
                    {getPositivityLabel(positivity)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">에너지:</span>
                  <span className="ml-2 text-muted-foreground">
                    {getEnergyLabel(energy)}
                  </span>
                </div>
              </>
            )}

            {showKeywords && keywords.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">키워드:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    // detailed layout (default)
    return (
      <div
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      >
        {primaryEmotion && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">주요 감정</h3>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {primaryEmotion.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {primaryEmotion.intensity}% 강도
                </div>
              </div>
              {showMeter && (
                                  <EmotionMeter
                    value={primaryEmotion.intensity}
                    size="lg"
                    color="blue"
                  />
              )}
            </div>
          </div>
        )}

        {showDistribution && emotionDistribution.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">감정 분포</h3>
            <div className="space-y-3">
              {emotionDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.emotion}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full transition-all duration-300`} 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showMetrics && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">분석 지표</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">감정 강도</div>
                <div className="text-2xl font-bold text-primary">
                  {getIntensityLabel(intensity)}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${intensity}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">긍정성</div>
                <div className="text-2xl font-bold text-green-600">
                  {getPositivityLabel(positivity)}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${positivity}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">에너지</div>
                <div className="text-2xl font-bold text-orange-600">
                  {getEnergyLabel(energy)}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${energy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showKeywords && keywords.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">감정 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

EmotionAnalysis.displayName = "EmotionAnalysis"

export { EmotionAnalysis } 