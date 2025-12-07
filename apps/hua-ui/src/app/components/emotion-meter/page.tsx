"use client"

import React, { useState } from "react"
import { EmotionMeter } from "@hua-labs/ui/advanced"
import { Card, CardContent, ComponentLayout } from "@hua-labs/ui"

// API 문서용 타입 정의
const EMOTION_METER_TYPES = {
  size: '"sm" | "md" | "lg"',
  sizeDefault: '"md"',
  color: '"blue" | "green" | "yellow" | "red"',
  colorDefault: '"blue"',
}

export default function EmotionMeterPage() {
  const [value, setValue] = useState<number>(50)

  return (
    <ComponentLayout
      title="EmotionMeter"
      description="감정의 강도를 시각적으로 표시하는 미터 컴포넌트입니다."
      prevPage={{ title: "EmotionButton", href: "/components/emotion-button" }}
      nextPage={{ title: "EmotionAnalysis", href: "/components/emotion-analysis" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "EmotionMeter" }
      ]}
    >
      <div className="space-y-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 EmotionMeter</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">감정 강도: {value}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <EmotionMeter value={value} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">크기별 EmotionMeter</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">작은 크기 (sm)</h3>
                <EmotionMeter value={75} size="sm" />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">중간 크기 (md) - 기본</h3>
                <EmotionMeter value={75} size="md" />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">큰 크기 (lg)</h3>
                <EmotionMeter value={75} size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">색상별 EmotionMeter</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">파란색 (blue)</h3>
                <EmotionMeter value={60} color="blue" />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">초록색 (green)</h3>
                <EmotionMeter value={60} color="green" />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">노란색 (yellow)</h3>
                <EmotionMeter value={60} color="yellow" />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">빨간색 (red)</h3>
                <EmotionMeter value={60} color="red" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">감정 강도 측정</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">기쁨</label>
                    <EmotionMeter value={85} color="yellow" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">스트레스</label>
                    <EmotionMeter value={30} color="red" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">에너지</label>
                    <EmotionMeter value={70} color="green" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">집중력</label>
                    <EmotionMeter value={45} color="blue" />
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">일일 감정 체크</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  오늘 하루의 감정 상태를 체크해보세요.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">전반적인 기분</label>
                    <EmotionMeter value={65} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">생산성</label>
                    <EmotionMeter value={80} color="green" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">스트레스 수준</label>
                    <EmotionMeter value={25} color="red" />
                  </div>
                </div>
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
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">value</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">number</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">0</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">미터 값 (0-100)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">size</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">{EMOTION_METER_TYPES.size}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">{EMOTION_METER_TYPES.sizeDefault}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">미터 크기</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">color</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">{EMOTION_METER_TYPES.color}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">{EMOTION_METER_TYPES.colorDefault}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">미터 색상</td>
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
{`import { EmotionMeter } from "@hua-labs/ui/advanced"

// 기본 미터
<EmotionMeter value={50} />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">크기 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 크기별 사용
<EmotionMeter value={75} size="sm" />
<EmotionMeter value={75} size="md" />
<EmotionMeter value={75} size="lg" />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">색상 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 색상별 사용
<EmotionMeter value={60} color="blue" />
<EmotionMeter value={60} color="green" />
<EmotionMeter value={60} color="yellow" />
<EmotionMeter value={60} color="red" />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 감정 강도 측정
const [stressLevel, setStressLevel] = useState(30)

<div>
  <label className="block text-sm font-medium mb-1">스트레스 수준</label>
  <EmotionMeter value={stressLevel} color="red" />
  <input
    type="range"
    min="0"
    max="100"
    value={stressLevel}
    onChange={(e) => setStressLevel(Number(e.target.value))}
    className="w-full mt-2"
  />
</div>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ComponentLayout>
  )
} 