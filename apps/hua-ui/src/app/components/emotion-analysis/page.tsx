"use client"

import React, { useState } from "react"
import { EmotionAnalysis, Card, CardContent, ComponentLayout } from "@hua-labs/ui"

export default function EmotionAnalysisPage() {
  const [text, setText] = useState<string>("오늘은 정말 기분이 좋아요! 새로운 프로젝트를 시작하게 되어서 설렙니다.")

  // 샘플 감정 분석 데이터
  const sampleAnalysis = {
    primaryEmotion: {
      name: "기쁨",
      intensity: 85,
      color: "yellow"
    },
    emotionDistribution: [
      { emotion: "기쁨", percentage: 60, color: "yellow" },
      { emotion: "설렘", percentage: 25, color: "pink" },
      { emotion: "희망", percentage: 15, color: "green" }
    ],
    keywords: ["기쁨", "새로운", "프로젝트", "설렘"],
    intensity: 85,
    positivity: 90,
    energy: 80
  }

  const negativeAnalysis = {
    primaryEmotion: {
      name: "슬픔",
      intensity: 70,
      color: "blue"
    },
    emotionDistribution: [
      { emotion: "슬픔", percentage: 50, color: "blue" },
      { emotion: "실망", percentage: 30, color: "gray" },
      { emotion: "희망", percentage: 20, color: "green" }
    ],
    keywords: ["힘든", "속상", "다퉈서", "희망"],
    intensity: 70,
    positivity: 30,
    energy: 40
  }

  const positiveAnalysis = {
    primaryEmotion: {
      name: "행복",
      intensity: 95,
      color: "yellow"
    },
    emotionDistribution: [
      { emotion: "행복", percentage: 70, color: "yellow" },
      { emotion: "성취감", percentage: 20, color: "green" },
      { emotion: "감사", percentage: 10, color: "purple" }
    ],
    keywords: ["대박", "성공", "축하", "행복"],
    intensity: 95,
    positivity: 95,
    energy: 90
  }

  const angryAnalysis = {
    primaryEmotion: {
      name: "실망",
      intensity: 80,
      color: "red"
    },
    emotionDistribution: [
      { emotion: "실망", percentage: 60, color: "red" },
      { emotion: "분노", percentage: 30, color: "orange" },
      { emotion: "불만", percentage: 10, color: "gray" }
    ],
    keywords: ["느리고", "불편", "실망", "개선"],
    intensity: 80,
    positivity: 20,
    energy: 60
  }

  return (
    <ComponentLayout
      title="EmotionAnalysis"
      description="텍스트의 감정을 분석하고 시각적으로 표시하는 컴포넌트입니다."
      prevPage={{ title: "EmotionMeter", href: "/components/emotion-meter" }}
      nextPage={{ title: "ThemeToggle", href: "/components/theme-toggle" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "EmotionAnalysis" }
      ]}
    >
      <div className="space-y-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 EmotionAnalysis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">분석할 텍스트</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="감정을 분석할 텍스트를 입력하세요..."
                />
              </div>
              <EmotionAnalysis {...sampleAnalysis} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">감정별 분석 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">긍정적인 감정</h3>
                                 <EmotionAnalysis {...positiveAnalysis} />
               </div>

               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                 <h3 className="font-medium mb-3 text-slate-900 dark:text-white">부정적인 감정</h3>
                 <EmotionAnalysis {...negativeAnalysis} />
               </div>

               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                 <h3 className="font-medium mb-3 text-slate-900 dark:text-white">분노/실망 감정</h3>
                 <EmotionAnalysis {...angryAnalysis} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">소셜 미디어 감정 분석</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  사용자들의 게시물을 분석하여 전반적인 감정 분위기를 파악합니다.
                </p>
                                 <EmotionAnalysis {...positiveAnalysis} />
               </div>

               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                 <h3 className="font-medium mb-3 text-slate-900 dark:text-white">고객 피드백 분석</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                   고객 리뷰의 감정을 분석하여 서비스 개선점을 파악합니다.
                 </p>
                 <EmotionAnalysis {...negativeAnalysis} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Props</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900">
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Prop</th>
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Type</th>
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Default</th>
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Description</th>
                  </tr>
                </thead>
                                  <tbody>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">primaryEmotion</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">Emotion</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">주요 감정 정보</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">emotionDistribution</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">Emotion[]</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">[]</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">감정 분포</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">keywords</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string[]</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">[]</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">감정 키워드</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">intensity</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">number</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">50</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">감정 강도</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">positivity</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">number</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">70</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">긍정성</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">energy</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">number</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">60</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">에너지</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">className</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">추가 CSS 클래스</td>
                    </tr>
                  </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">사용 가이드</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">기본 사용법</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`import { EmotionAnalysis } from "@hua-labs/ui"

// 기본 감정 분석
const analysis = {
  primaryEmotion: {
    name: "기쁨",
    intensity: 85,
    color: "yellow"
  },
  emotionDistribution: [
    { emotion: "기쁨", percentage: 60, color: "yellow" },
    { emotion: "설렘", percentage: 25, color: "pink" },
    { emotion: "희망", percentage: 15, color: "green" }
  ],
  keywords: ["기쁨", "새로운", "프로젝트", "설렘"],
  intensity: 85,
  positivity: 90,
  energy: 80
}

<EmotionAnalysis {...analysis} />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">데이터 구조</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`interface EmotionAnalysisData {
  primaryEmotion: {
    name: string
    intensity: number
    color: string
  }
  emotionDistribution: Array<{
    emotion: string
    percentage: number
    color: string
  }>
  keywords: string[]
  intensity: number
  positivity: number
  energy: number
}`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 텍스트 분석 후 결과 표시
const [analysisResult, setAnalysisResult] = useState(null)

const analyzeText = async (text) => {
  // API 호출하여 감정 분석 수행
  const result = await emotionAnalysisAPI.analyze(text)
  setAnalysisResult(result)
}

return (
  <div>
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="분석할 텍스트를 입력하세요"
    />
    {analysisResult && (
      <EmotionAnalysis data={analysisResult} />
    )}
  </div>
)`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ComponentLayout>
  )
} 