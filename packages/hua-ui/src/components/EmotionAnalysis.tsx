'use client'

import React from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card"
import { Badge } from "./Badge"
import { EmotionMeter } from "./EmotionMeter"

/**
 * EmotionAnalysis 컴포넌트의 props / EmotionAnalysis component props
 * @typedef {Object} EmotionAnalysisProps
 * @property {Object} [primaryEmotion] - 주요 감정 정보 / Primary emotion information
 * @property {string} primaryEmotion.name - 감정 이름 / Emotion name
 * @property {number} primaryEmotion.intensity - 감정 강도 (0-100) / Emotion intensity (0-100)
 * @property {string} [primaryEmotion.color] - 감정 색상 / Emotion color
 * @property {Array<Object>} [emotionDistribution] - 감정 분포 배열 / Emotion distribution array
 * @property {string} emotionDistribution[].emotion - 감정 이름 / Emotion name
 * @property {number} emotionDistribution[].percentage - 감정 비율 (0-100) / Emotion percentage (0-100)
 * @property {string} emotionDistribution[].color - 감정 색상 / Emotion color
 * @property {string[]} [keywords] - 키워드 배열 / Keywords array
 * @property {number} [intensity=50] - 전체 강도 (0-100) / Overall intensity (0-100)
 * @property {number} [positivity=70] - 긍정성 (0-100) / Positivity (0-100)
 * @property {number} [energy=60] - 에너지 (0-100) / Energy (0-100)
 * @property {boolean} [showMeter=true] - 강도 미터 표시 여부 / Show intensity meter
 * @property {boolean} [showDistribution=true] - 분포 표시 여부 / Show distribution
 * @property {boolean} [showKeywords=true] - 키워드 표시 여부 / Show keywords
 * @property {boolean} [showMetrics=true] - 메트릭 표시 여부 / Show metrics
 * @property {"compact" | "detailed" | "card"} [layout="detailed"] - 레이아웃 타입 / Layout type
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
interface EmotionAnalysisProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
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
  dot?: string
  style?: React.CSSProperties
}

// Maps the color token from emotionDistribution to an inline background color
const colorTokenToStyle = (token: string): React.CSSProperties => {
  const map: Record<string, string> = {
    yellow: 'rgb(234 179 8)',
    green: 'rgb(34 197 94)',
    blue: 'rgb(59 130 246)',
    red: 'rgb(239 68 68)',
    purple: 'rgb(168 85 247)',
    orange: 'rgb(249 115 22)',
    indigo: 'rgb(99 102 241)',
    pink: 'rgb(236 72 153)',
    gray: 'rgb(107 114 128)',
  }
  return { backgroundColor: map[token] ?? map.gray }
}

/**
 * EmotionAnalysis 컴포넌트 / EmotionAnalysis component
 *
 * 감정 분석 결과를 표시하는 컴포넌트입니다.
 * 주요 감정, 감정 분포, 키워드, 메트릭(강도, 긍정성, 에너지)을 표시할 수 있습니다.
 *
 * Component that displays emotion analysis results.
 * Can display primary emotion, emotion distribution, keywords, and metrics (intensity, positivity, energy).
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <EmotionAnalysis
 *   primaryEmotion={{ name: "기쁨", intensity: 80 }}
 *   keywords={["행복", "만족"]}
 * />
 *
 * @example
 * // 상세 레이아웃 / Detailed layout
 * <EmotionAnalysis
 *   primaryEmotion={{ name: "평온", intensity: 65, color: "green" }}
 *   emotionDistribution={[
 *     { emotion: "기쁨", percentage: 40, color: "yellow" },
 *     { emotion: "평온", percentage: 60, color: "green" }
 *   ]}
 *   keywords={["안정", "편안"]}
 *   intensity={65}
 *   positivity={75}
 *   energy={50}
 *   layout="detailed"
 * />
 *
 * @param {EmotionAnalysisProps} props - EmotionAnalysis 컴포넌트의 props / EmotionAnalysis component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} EmotionAnalysis 컴포넌트 / EmotionAnalysis component
 */
const EmotionAnalysis = React.forwardRef<HTMLDivElement, EmotionAnalysisProps>(
  ({
    dot: dotProp,
    style,
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

    const mutedFg: React.CSSProperties = { color: 'var(--color-muted-foreground, rgb(107 114 128))' }
    const spaceY3: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
    const spaceY4: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
    const spaceY2: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
    const flexBetween: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
    const textSm: React.CSSProperties = { fontSize: '0.875rem' }
    const textSmMedium: React.CSSProperties = { fontSize: '0.875rem', fontWeight: 500 }
    const textSmMuted: React.CSSProperties = { ...textSm, ...mutedFg }
    const progressTrack: React.CSSProperties = {
      width: '100%',
      backgroundColor: 'var(--color-muted, rgb(229 231 235))',
      borderRadius: '9999px',
      height: '0.5rem',
    }
    const progressBar: React.CSSProperties = {
      height: '0.5rem',
      borderRadius: '9999px',
      transition: 'all 300ms ease',
    }

    if (layout === "compact") {
      return (
        <div
          ref={ref}
          style={mergeStyles(spaceY3, resolveDot(dotProp), style)}
          {...props}
        >
          {primaryEmotion && (
            <div style={flexBetween}>
              <span style={textSmMedium}>주요 감정:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={textSmMuted}>
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
              <div style={flexBetween}>
                <span style={textSmMedium}>감정 강도:</span>
                <span style={textSmMuted}>
                  {getIntensityLabel(intensity)}
                </span>
              </div>
              <div style={flexBetween}>
                <span style={textSmMedium}>긍정성:</span>
                <span style={textSmMuted}>
                  {getPositivityLabel(positivity)}
                </span>
              </div>
              <div style={flexBetween}>
                <span style={textSmMedium}>에너지:</span>
                <span style={textSmMuted}>
                  {getEnergyLabel(energy)}
                </span>
              </div>
            </>
          )}

          {showKeywords && keywords.length > 0 && (
            <div>
              <span style={textSmMedium}>키워드:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" dot="text-xs">
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
          dot={dotProp}
          style={style}
          {...props}
        >
          <CardHeader>
            <CardTitle dot="flex items-center">
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>✨</span>
              AI 분석
            </CardTitle>
            <CardDescription>
              감정 분석 결과
            </CardDescription>
          </CardHeader>
          <CardContent dot="space-y-4">
            {primaryEmotion && (
              <div style={spaceY3}>
                <div style={textSm}>
                  <span style={{ fontWeight: 500 }}>주요 감정:</span>
                  <span style={{ marginLeft: '0.5rem', ...mutedFg }}>
                    {primaryEmotion.name} ({primaryEmotion.intensity}%)
                  </span>
                </div>
                {showMeter && (
                  <div style={resolveDot('flex justify-center')}>
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
                <div style={textSm}>
                  <span style={{ fontWeight: 500 }}>감정 강도:</span>
                  <span style={{ marginLeft: '0.5rem', ...mutedFg }}>
                    {getIntensityLabel(intensity)}
                  </span>
                </div>
                <div style={textSm}>
                  <span style={{ fontWeight: 500 }}>긍정성:</span>
                  <span style={{ marginLeft: '0.5rem', ...mutedFg }}>
                    {getPositivityLabel(positivity)}
                  </span>
                </div>
                <div style={textSm}>
                  <span style={{ fontWeight: 500 }}>에너지:</span>
                  <span style={{ marginLeft: '0.5rem', ...mutedFg }}>
                    {getEnergyLabel(energy)}
                  </span>
                </div>
              </>
            )}

            {showKeywords && keywords.length > 0 && (
              <div style={textSm}>
                <span style={{ fontWeight: 500 }}>키워드:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" dot="text-xs">
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
        style={mergeStyles({ display: 'flex', flexDirection: 'column', gap: '1.5rem' }, resolveDot(dotProp), style)}
        {...props}
      >
        {primaryEmotion && (
          <div style={spaceY4}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>주요 감정</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary, rgb(99 102 241))' }}>
                  {primaryEmotion.name}
                </div>
                <div style={textSmMuted}>
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
          <div style={spaceY4}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>감정 분포</h3>
            <div style={spaceY3}>
              {emotionDistribution.map((item, index) => (
                <div key={index} style={spaceY2}>
                  <div style={flexBetween}>
                    <span style={textSmMedium}>{item.emotion}</span>
                    <span style={textSmMuted}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div style={progressTrack}>
                    <div
                      style={mergeStyles(progressBar, colorTokenToStyle(item.color), { width: `${item.percentage}%` })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showMetrics && (
          <div style={spaceY4}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>분석 지표</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1rem' }}>
              <div style={spaceY2}>
                <div style={textSmMedium}>감정 강도</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary, rgb(99 102 241))' }}>
                  {getIntensityLabel(intensity)}
                </div>
                <div style={progressTrack}>
                  <div
                    style={mergeStyles(progressBar, { backgroundColor: 'var(--color-primary, rgb(99 102 241))' }, { width: `${intensity}%` })}
                  />
                </div>
              </div>
              <div style={spaceY2}>
                <div style={textSmMedium}>긍정성</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgb(22 163 74)' }}>
                  {getPositivityLabel(positivity)}
                </div>
                <div style={progressTrack}>
                  <div
                    style={mergeStyles(progressBar, { backgroundColor: 'rgb(34 197 94)' }, { width: `${positivity}%` })}
                  />
                </div>
              </div>
              <div style={spaceY2}>
                <div style={textSmMedium}>에너지</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgb(234 88 12)' }}>
                  {getEnergyLabel(energy)}
                </div>
                <div style={progressTrack}>
                  <div
                    style={mergeStyles(progressBar, { backgroundColor: 'rgb(249 115 22)' }, { width: `${energy}%` })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showKeywords && keywords.length > 0 && (
          <div style={spaceY4}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>감정 키워드</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" dot="text-sm">
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
