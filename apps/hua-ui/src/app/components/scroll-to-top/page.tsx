"use client"

import React from "react"
import { ScrollToTop, Card, CardContent } from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'

export default function ScrollToTopPage() {
  return (
    <ComponentLayout
      title="ScrollToTop"
      description="페이지 상단으로 스크롤할 수 있는 컴포넌트입니다."
      prevPage={{ title: "Scrollbar", href: "/components/scrollbar" }}
      nextPage={{ title: "PageTransition", href: "/components/page-transition" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "ScrollToTop" }
      ]}
    >
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 ScrollToTop</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            아래로 스크롤하면 우측 하단에 스크롤 버튼이 나타납니다.
          </p>
          <div className="h-96 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">스크롤 영역</p>
          </div>
          <ScrollToTop />
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
          <div className="space-y-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">긴 콘텐츠 페이지</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                긴 콘텐츠가 있는 페이지에서 사용자 경험을 향상시킵니다.
              </p>
              <div className="space-y-4">
                <div className="h-32 bg-blue-50 dark:bg-blue-900/20 rounded p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">섹션 1</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">긴 콘텐츠 내용...</p>
                </div>
                <div className="h-32 bg-green-50 dark:bg-green-900/20 rounded p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">섹션 2</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">더 많은 콘텐츠...</p>
                </div>
                <div className="h-32 bg-yellow-50 dark:bg-yellow-900/20 rounded p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">섹션 3</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">끝없는 콘텐츠...</p>
                </div>
              </div>
              <ScrollToTop />
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
{`import { ScrollToTop } from '@hua-labs/hua-ux'

// 기본 스크롤 버튼
<ScrollToTop />`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">긴 페이지에 배치</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// 긴 페이지에 배치
function LongPage() {
  return (
    <div>
      {/* 긴 콘텐츠 */}
      <div className="h-screen bg-gray-100">섹션 1</div>
      <div className="h-screen bg-gray-200">섹션 2</div>
      <div className="h-screen bg-gray-300">섹션 3</div>
      
      {/* 스크롤 버튼 */}
      <ScrollToTop />
    </div>
  )
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </ComponentLayout>
  )
} 