"use client"

import React from "react"
import { Skeleton, ComponentLayout } from '@hua-labs/hua-ux'

export default function SkeletonPage() {
  return (
    <ComponentLayout
      title="Skeleton"
      description="콘텐츠가 로딩 중일 때 표시하는 스켈레톤 컴포넌트입니다."
      prevPage={{ title: "Popover", href: "/components/popover" }}
      nextPage={{ title: "EmotionSelector", href: "/components/emotion-selector" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Skeleton" }
      ]}
    >
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Skeleton</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            콘텐츠가 로딩 중일 때 표시하는 스켈레톤 컴포넌트입니다.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">기본 Skeleton</h2>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">크기별 Skeleton</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Small</h3>
              <Skeleton className="h-3 w-[200px]" />
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Medium (기본)</h3>
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Large</h3>
              <Skeleton className="h-6 w-[200px]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">실제 사용 예시</h2>
          <div className="space-y-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">카드 스켈레톤</h3>
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">사용자 프로필 스켈레톤</h3>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">테이블 스켈레톤</h3>
              <div className="space-y-3">
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">이미지 갤러리 스켈레톤</h3>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Props</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Skeleton</h3>
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
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">children</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">ReactNode</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">스켈레톤 내용</td>
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
{`import { Skeleton } from '@hua-labs/hua-ux'

// 기본 스켈레톤
<Skeleton className="h-4 w-[250px]" />

// 여러 줄 스켈레톤
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[300px]" />
</div>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">크기 설정</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 크기별 스켈레톤
<Skeleton className="h-3 w-[200px]" /> // Small
<Skeleton className="h-4 w-[200px]" /> // Medium (기본)
<Skeleton className="h-6 w-[200px]" /> // Large`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 카드 스켈레톤
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-4 w-2/3" />
</div>

// 사용자 프로필 스켈레톤
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[150px]" />
    <Skeleton className="h-4 w-[100px]" />
  </div>
</div>

// 이미지 갤러리 스켈레톤
<div className="grid grid-cols-3 gap-4">
  <Skeleton className="h-24 w-full rounded-lg" />
  <Skeleton className="h-24 w-full rounded-lg" />
  <Skeleton className="h-24 w-full rounded-lg" />
</div>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 