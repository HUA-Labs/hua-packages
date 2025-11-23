"use client"

import React, { useState } from "react"
import { EmotionButton, Card, CardContent, ComponentLayout } from "@hua-labs/ui"

// API 문서용 타입 정의
const EMOTION_BUTTON_TYPES = {
  size: '"sm" | "md" | "lg"',
  sizeDefault: '"md"',
}

export default function EmotionButtonPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string>("😊")

  const emotions = ["😊", "😢", "😡", "😴", "🤔", "😍", "😱", "😎"]

  return (
    <ComponentLayout
      title="EmotionButton"
      description="감정을 표현하는 이모지 버튼 컴포넌트입니다."
      prevPage={{ title: "EmotionSelector", href: "/components/emotion-selector" }}
      nextPage={{ title: "EmotionMeter", href: "/components/emotion-meter" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "EmotionButton" }
      ]}
    >
      <div className="space-y-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 EmotionButton</h2>
            <div className="flex flex-wrap gap-4">
              {emotions.map((emotion) => (
                <EmotionButton
                  key={emotion}
                  emotion={emotion}
                  onClick={() => console.log(`선택된 감정: ${emotion}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">선택된 상태</h2>
            <div className="flex flex-wrap gap-4">
              {emotions.map((emotion) => (
                <EmotionButton
                  key={emotion}
                  emotion={emotion}
                  isSelected={selectedEmotion === emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              선택된 감정: {selectedEmotion}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">크기별 EmotionButton</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">작은 크기 (sm)</h3>
                <div className="flex flex-wrap gap-3">
                  {emotions.slice(0, 4).map((emotion) => (
                    <EmotionButton
                      key={emotion}
                      emotion={emotion}
                      size="sm"
                      onClick={() => console.log(`선택된 감정: ${emotion}`)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">중간 크기 (md) - 기본</h3>
                <div className="flex flex-wrap gap-4">
                  {emotions.slice(0, 4).map((emotion) => (
                    <EmotionButton
                      key={emotion}
                      emotion={emotion}
                      size="md"
                      onClick={() => console.log(`선택된 감정: ${emotion}`)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">큰 크기 (lg)</h3>
                <div className="flex flex-wrap gap-4">
                  {emotions.slice(0, 4).map((emotion) => (
                    <EmotionButton
                      key={emotion}
                      emotion={emotion}
                      size="lg"
                      onClick={() => console.log(`선택된 감정: ${emotion}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">감정 피드백</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  사용자가 콘텐츠에 대한 감정을 표현할 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  {emotions.slice(0, 6).map((emotion) => (
                    <EmotionButton
                      key={emotion}
                      emotion={emotion}
                      isSelected={selectedEmotion === emotion}
                      onClick={() => setSelectedEmotion(emotion)}
                    />
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">감정 상태 표시</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  현재 상태나 기분을 시각적으로 표현합니다.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">현재 기분:</span>
                  <EmotionButton
                    emotion="😊"
                    isSelected={true}
                    onClick={() => {}}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">행복함</span>
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
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">emotion</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">표시할 이모지</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">isSelected</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">boolean</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">false</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">선택된 상태 여부</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">size</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">{EMOTION_BUTTON_TYPES.size}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">{EMOTION_BUTTON_TYPES.sizeDefault}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">버튼 크기</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">onClick</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">(event) =&gt; void</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">클릭 이벤트 핸들러</td>
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
{`import { EmotionButton } from "@hua-labs/ui"

// 기본 감정 버튼
<EmotionButton 
  emotion="😊" 
  onClick={() => console.log("선택됨")} 
/>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">선택된 상태</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 선택된 상태
<EmotionButton 
  emotion="😊" 
  isSelected={true}
  onClick={() => setSelected("😊")} 
/>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">크기 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 크기별 사용
<EmotionButton emotion="😊" size="sm" />
<EmotionButton emotion="😊" size="md" />
<EmotionButton emotion="😊" size="lg" />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">감정 선택기</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 감정 선택기 예시
const [selectedEmotion, setSelectedEmotion] = useState("😊")
const emotions = ["😊", "😢", "😡", "😴"]

<div className="flex gap-2">
  {emotions.map((emotion) => (
    <EmotionButton
      key={emotion}
      emotion={emotion}
      isSelected={selectedEmotion === emotion}
      onClick={() => setSelectedEmotion(emotion)}
    />
  ))}
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