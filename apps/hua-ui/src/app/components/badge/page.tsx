"use client"

import React from "react"
import { Badge } from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'

export default function BadgePage() {
  return (
    <ComponentLayout
      title="Badge"
      description="상태, 카테고리, 알림 등을 표시하는 뱃지 컴포넌트입니다."
      prevPage={{ title: "Alert", href: "/components/alert" }}
      nextPage={{ title: "Card", href: "/components/card" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Badge" }
      ]}
    >
      <div className="space-y-8">
        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <Badge>기본</Badge>
              <Badge variant="secondary">보조</Badge>
              <Badge variant="destructive">삭제</Badge>
              <Badge variant="outline">아웃라인</Badge>
              <Badge variant="glass">글래스</Badge>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { Badge } from '@hua-labs/hua-ux'

<Badge>기본</Badge>
<Badge variant="secondary">보조</Badge>
<Badge variant="destructive">삭제</Badge>
<Badge variant="outline">아웃라인</Badge>
<Badge variant="glass">글래스</Badge>`}</code>
            </pre>
          </div>
        </section>

        {/* Variants */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">변형</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">기본</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>New</Badge>
                  <Badge>Featured</Badge>
                  <Badge>Popular</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">보조</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Draft</Badge>
                  <Badge variant="secondary">Archived</Badge>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">위험</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="destructive">Failed</Badge>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">아웃라인</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Beta</Badge>
                  <Badge variant="outline">Experimental</Badge>
                  <Badge variant="outline">Limited</Badge>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-white">글래스</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="glass">Premium</Badge>
                  <Badge variant="glass">Exclusive</Badge>
                  <Badge variant="glass">VIP</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Beta</Badge>
<Badge variant="glass">Premium</Badge>`}</code>
            </pre>
          </div>
        </section>

        {/* Status Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">상태 표시</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">작업 상태</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>완료</Badge>
                  <Badge variant="secondary">진행 중</Badge>
                  <Badge variant="destructive">실패</Badge>
                  <Badge variant="outline">대기</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">알림 상태</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>읽음</Badge>
                  <Badge variant="destructive">읽지 않음</Badge>
                  <Badge variant="secondary">보관됨</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">사용자 상태</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>온라인</Badge>
                  <Badge variant="secondary">오프라인</Badge>
                  <Badge variant="outline">자리비움</Badge>
                  <Badge variant="destructive">차단됨</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`// 작업 상태
<Badge>완료</Badge>
<Badge variant="secondary">진행 중</Badge>
<Badge variant="destructive">실패</Badge>
<Badge variant="outline">대기</Badge>

// 알림 상태
<Badge>읽음</Badge>
<Badge variant="destructive">읽지 않음</Badge>
<Badge variant="secondary">보관됨</Badge>

// 사용자 상태
<Badge>온라인</Badge>
<Badge variant="secondary">오프라인</Badge>
<Badge variant="outline">자리비움</Badge>
<Badge variant="destructive">차단됨</Badge>`}</code>
            </pre>
          </div>
        </section>

        {/* With Icons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">아이콘과 함께</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <Badge>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                성공
              </Badge>
              <Badge variant="destructive">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                오류
              </Badge>
              <Badge variant="outline">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                정보
              </Badge>
              <Badge variant="glass">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                프리미엄
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Badge>
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
  성공
</Badge>

<Badge variant="destructive">
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
  오류
</Badge>`}</code>
            </pre>
          </div>
        </section>

        {/* Interactive Badges */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">인터랙티브 배지</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <Badge className="cursor-pointer hover:bg-blue-600 transition-colors">
                클릭 가능
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                호버 효과
              </Badge>
              <Badge variant="glass" className="cursor-pointer hover:bg-white/20 transition-colors">
                글래스 호버
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Badge className="cursor-pointer hover:bg-blue-600 transition-colors">
  클릭 가능
</Badge>

<Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
  호버 효과
</Badge>

<Badge variant="glass" className="cursor-pointer hover:bg-white/20 transition-colors">
  글래스 호버
</Badge>`}</code>
            </pre>
          </div>
        </section>

        {/* Props Table */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Props</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Prop</th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Type</th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Default</th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">variant</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;secondary&apos; | &apos;destructive&apos; | &apos;outline&apos; | &apos;glass&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">배지의 스타일 변형</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">배지의 크기</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">className</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">추가 CSS 클래스</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">children</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">ReactNode</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">배지 내용</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ComponentLayout>
  )
} 