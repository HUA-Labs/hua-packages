"use client"

import React, { useState } from "react"
import { EmotionSelector } from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'

export default function EmotionSelectorPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string>("")

  return (
    <ComponentLayout
      title="EmotionSelector"
      description="사용자의 감정 상태를 선택할 수 있는 이모션 셀렉터 컴포넌트입니다."
      prevPage={{ title: "Skeleton", href: "/components/skeleton" }}
      nextPage={{ title: "ScrollToTop", href: "/components/scroll-to-top" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "EmotionSelector" }
      ]}
    >
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">EmotionSelector</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            사용자의 감정 상태를 선택할 수 있는 이모션 셀렉터 컴포넌트입니다.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">기본 EmotionSelector</h2>
          <div className="space-y-4">
            <EmotionSelector
              selectedEmotion={selectedEmotion}
              onEmotionSelect={setSelectedEmotion}
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              선택된 감정: {selectedEmotion || "없음"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">변형별 EmotionSelector</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Card 변형</h3>
              <EmotionSelector
                variant="card"
                selectedEmotion={selectedEmotion}
                onEmotionSelect={setSelectedEmotion}
              />
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Chip 변형</h3>
              <EmotionSelector
                variant="chip"
                selectedEmotion={selectedEmotion}
                onEmotionSelect={setSelectedEmotion}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">실제 사용 예시</h2>
          <div className="space-y-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">피드백 폼</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    오늘의 기분은 어떠신가요?
                  </label>
                  <EmotionSelector
                    variant="card"
                    selectedEmotion={selectedEmotion}
                    onEmotionSelect={setSelectedEmotion}
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  선택된 감정: {selectedEmotion || "선택해주세요"}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">감정 태그</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    이 게시물의 감정을 선택하세요
                  </label>
                  <EmotionSelector
                    variant="chip"
                    selectedEmotion={selectedEmotion}
                    onEmotionSelect={setSelectedEmotion}
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  태그된 감정: {selectedEmotion || "태그 없음"}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">일기 작성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    오늘 하루의 감정
                  </label>
                  <EmotionSelector
                    variant="card"
                    selectedEmotion={selectedEmotion}
                    onEmotionSelect={setSelectedEmotion}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">
                    일기 내용
                  </label>
                  <textarea
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    rows={4}
                    placeholder="오늘 하루를 기록해보세요..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Props</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">EmotionSelector</h3>
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
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">selectedEmotion</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">선택된 감정 값</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">onEmotionSelect</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">(value: string) =&gt; void</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">감정 선택 변경 핸들러</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">variant</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;button&quot; | &quot;card&quot; | &quot;chip&quot;</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;button&quot;</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">이모션 셀렉터 스타일</td>
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
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">사용 가이드</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">기본 사용법</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`import { EmotionSelector } from '@hua-labs/hua-ux'
import { useState } from "react"

// 기본 이모션 셀렉터
const [selectedEmotion, setSelectedEmotion] = useState("")

<EmotionSelector
  selectedEmotion={selectedEmotion}
  onEmotionSelect={setSelectedEmotion}
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">변형 설정</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 카드 스타일
<EmotionSelector
  variant="card"
  selectedEmotion={selectedEmotion}
  onEmotionSelect={setSelectedEmotion}
/>

// 칩 스타일
<EmotionSelector
  variant="chip"
  selectedEmotion={selectedEmotion}
  onEmotionSelect={setSelectedEmotion}
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 피드백 폼
<div className="space-y-4">
  <label className="block text-sm font-medium">
    오늘의 기분은 어떠신가요?
  </label>
  <EmotionSelector
    variant="card"
    selectedEmotion={selectedEmotion}
    onEmotionSelect={setSelectedEmotion}
  />
  <p className="text-sm text-gray-600">
    선택된 감정: {selectedEmotion || "선택해주세요"}
  </p>
</div>

// 감정 태그
<div className="space-y-4">
  <label className="block text-sm font-medium">
    이 게시물의 감정을 선택하세요
  </label>
  <EmotionSelector
    variant="chip"
    selectedEmotion={selectedEmotion}
    onEmotionSelect={setSelectedEmotion}
  />
  <p className="text-sm text-gray-600">
    태그된 감정: {selectedEmotion || "태그 없음"}
  </p>
</div>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 