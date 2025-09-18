"use client"

import React from "react"
import { PageTransition, Card, CardContent } from "@hua-labs/ui"
import { ComponentLayout } from "@hua-labs/ui"

export default function PageTransitionPage() {
  return (
    <ComponentLayout
      title="PageTransition"
      description="페이지 전환 애니메이션을 제공하는 컴포넌트입니다."
      prevPage={{ title: "ScrollToTop", href: "/components/scroll-to-top" }}
      nextPage={{ title: "EmotionSelector", href: "/components/emotion-selector" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "PageTransition" }
      ]}
    >
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 PageTransition</h2>
          <PageTransition>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">전환된 콘텐츠</h3>
              <p className="text-gray-600 dark:text-gray-400">
                이 콘텐츠는 페이지 전환 애니메이션과 함께 표시됩니다.
              </p>
            </div>
          </PageTransition>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
          <div className="space-y-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">페이지 콘텐츠</h3>
              <PageTransition>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                    <h4 className="font-medium text-slate-900 dark:text-white">환영합니다</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">페이지 전환 애니메이션이 적용된 콘텐츠입니다.</p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <h4 className="font-medium text-slate-900 dark:text-white">주요 기능</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">부드러운 전환 효과로 사용자 경험을 향상시킵니다.</p>
                  </div>
                </div>
              </PageTransition>
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
                  <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">children</td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">ReactNode</td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">전환할 콘텐츠</td>
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
{`import { PageTransition } from "@hua-labs/ui"

// 기본 페이지 전환
<PageTransition>
  <div>페이지 콘텐츠</div>
</PageTransition>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">페이지 컴포넌트에서 사용</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// 페이지 컴포넌트에서 사용
function MyPage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6">
        <h1>페이지 제목</h1>
        <p>페이지 내용...</p>
      </div>
    </PageTransition>
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