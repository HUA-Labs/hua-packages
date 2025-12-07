"use client"

import React from "react"
import { LanguageToggle } from "@hua-labs/ui/advanced"
import { Card, CardContent, ComponentLayout } from "@hua-labs/ui"

export default function LanguageTogglePage() {
  return (
    <ComponentLayout
      title="LanguageToggle"
      description="언어를 전환하는 언어 토글 컴포넌트입니다."
      prevPage={{ title: "ThemeToggle", href: "/components/theme-toggle" }}
      nextPage={{ title: "ScrollToTop", href: "/components/scroll-to-top" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "LanguageToggle" }
      ]}
    >
      <div className="space-y-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 LanguageToggle</h2>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <span className="text-sm text-gray-600 dark:text-gray-400">클릭하여 언어를 전환하세요</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">헤더에 배치</h3>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <h4 className="font-medium text-slate-900 dark:text-white">웹사이트 제목</h4>
                    <nav className="flex gap-4 text-sm">
                      <a href="#" className="hover:text-blue-600 text-slate-600 dark:text-slate-400">홈</a>
                      <a href="#" className="hover:text-blue-600 text-slate-600 dark:text-slate-400">소개</a>
                      <a href="#" className="hover:text-blue-600 text-slate-600 dark:text-slate-400">연락처</a>
                    </nav>
                  </div>
                  <div className="flex items-center gap-2">
                    <LanguageToggle />
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">설정 패널</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">언어</span>
                    <LanguageToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">테마</span>
                    <select className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                      <option>라이트</option>
                      <option>다크</option>
                    </select>
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
{`import { LanguageToggle } from "@hua-labs/ui/advanced"

// 기본 언어 토글
<LanguageToggle />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">헤더에 배치</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 헤더 컴포넌트
<header className="flex items-center justify-between p-4">
  <div className="flex items-center gap-4">
    <h1 className="text-xl font-bold">웹사이트 제목</h1>
    <nav className="flex gap-4">
      <a href="/">홈</a>
      <a href="/about">소개</a>
    </nav>
  </div>
  <LanguageToggle />
</header>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">설정 패널</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 설정 패널
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <span>언어</span>
    <LanguageToggle />
  </div>
  <div className="flex items-center justify-between">
    <span>테마</span>
    <select>
      <option>라이트</option>
      <option>다크</option>
    </select>
  </div>
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