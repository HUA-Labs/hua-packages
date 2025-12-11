"use client"

import React from "react"
import { Scrollbar } from "@hua-labs/ui/advanced"
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@hua-labs/ui"
import { ComponentLayout } from "@hua-labs/ui"

export default function ScrollbarPage() {
  const longContent = Array.from({ length: 50 }, (_, i) => (
    <div key={i} className="p-4 border-b border-slate-200 dark:border-slate-700">
      <h3 className="font-medium mb-2">아이템 {i + 1}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        이것은 스크롤바를 테스트하기 위한 긴 콘텐츠입니다. 각 아이템은 충분한 높이를 가지고 있어서 
        스크롤이 필요하게 됩니다. 다양한 스크롤바 스타일을 확인해보세요!
      </p>
    </div>
  ))

  const wideContent = Array.from({ length: 20 }, (_, i) => (
    <div key={i} className="inline-block w-64 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg m-2 flex items-center justify-center text-white font-medium">
      카드 {i + 1}
    </div>
  ))

  return (
    <ComponentLayout
      title="Scrollbar"
      description="커스텀 스크롤바 컴포넌트입니다."
      prevPage={{ title: "BottomSheet", href: "/components/bottom-sheet" }}
      nextPage={{ title: "ScrollToTop", href: "/components/scroll-to-top" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Scrollbar" }
      ]}
    >
      <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">세로 스크롤</h3>
                  <Scrollbar className="h-64 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">가로 스크롤</h3>
                  <Scrollbar orientation="horizontal" className="h-32 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex">
                      {wideContent}
                    </div>
                  </Scrollbar>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Scrollbar } from "@hua-labs/ui/advanced"

// 세로 스크롤
<Scrollbar className="h-64">
  {longContent}
</Scrollbar>

// 가로 스크롤
<Scrollbar orientation="horizontal" className="h-32">
  <div className="flex">
    {wideContent}
  </div>
</Scrollbar>`}</code>
              </pre>
            </div>
          </section>

          {/* Variants */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">변형</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">기본</h3>
                  <Scrollbar variant="default" className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 20)}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">글래스</h3>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                    <Scrollbar variant="glass" className="h-48">
                      {longContent.slice(0, 20)}
                    </Scrollbar>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">컬러풀</h3>
                  <Scrollbar variant="colorful" className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 20)}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">미니멀</h3>
                  <Scrollbar variant="minimal" className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 20)}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">네온</h3>
                  <Scrollbar variant="neon" className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-900">
                    {longContent.slice(0, 20)}
                  </Scrollbar>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Scrollbar variant="default">기본 스타일</Scrollbar>
<Scrollbar variant="glass">글래스 모피즘</Scrollbar>
<Scrollbar variant="colorful">컬러풀 그라데이션</Scrollbar>
<Scrollbar variant="minimal">미니멀 스타일</Scrollbar>
<Scrollbar variant="neon">네온 효과</Scrollbar>`}</code>
              </pre>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">크기</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="font-medium mb-2">작은 크기</h3>
                  <Scrollbar size="sm" className="h-32 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 10)}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">중간 크기</h3>
                  <Scrollbar size="md" className="h-32 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 10)}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">큰 크기</h3>
                  <Scrollbar size="lg" className="h-32 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 10)}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">매우 큰 크기</h3>
                  <Scrollbar size="xl" className="h-32 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 10)}
                  </Scrollbar>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Scrollbar size="sm">작은 크기</Scrollbar>
<Scrollbar size="md">중간 크기 (기본값)</Scrollbar>
<Scrollbar size="lg">큰 크기</Scrollbar>
<Scrollbar size="xl">매우 큰 크기</Scrollbar>`}</code>
              </pre>
            </div>
          </section>

          {/* Real World Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">실제 사용 예시</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">채팅 메시지</h3>
                  <Scrollbar variant="glass" className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div key={i} className={`mb-4 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-xs p-3 rounded-lg ${
                          i % 2 === 0 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                        }`}>
                          <p className="text-sm">메시지 {i + 1}</p>
                          <p className="text-xs opacity-70 mt-1">오후 2:30</p>
                        </div>
                      </div>
                    ))}
                  </Scrollbar>
                </div>
                <div>
                  <h3 className="font-medium mb-2">알림 목록</h3>
                  <Scrollbar variant="minimal" className="h-64 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {Array.from({ length: 25 }, (_, i) => (
                      <div key={i} className="p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            i % 3 === 0 ? 'bg-green-500' : i % 3 === 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">알림 제목 {i + 1}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">알림 내용이 여기에 표시됩니다.</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {i % 3 === 0 ? '정보' : i % 3 === 1 ? '경고' : '오류'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </Scrollbar>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`// 채팅 메시지
<Scrollbar variant="glass" className="h-64 bg-gradient-to-br from-blue-50 to-purple-50">
  {chatMessages}
</Scrollbar>

// 알림 목록
<Scrollbar variant="minimal" className="h-64 border border-slate-200">
  {notifications}
</Scrollbar>`}</code>
              </pre>
            </div>
          </section>

          {/* Interactive Features */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">인터랙티브 기능</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">자동 숨김 (기본)</h3>
                  <Scrollbar autoHide={true} className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 15)}
                  </Scrollbar>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    스크롤하지 않을 때는 스크롤바가 자동으로 숨겨집니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">항상 표시</h3>
                  <Scrollbar autoHide={false} className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 15)}
                  </Scrollbar>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    스크롤바가 항상 표시됩니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">부드러운 스크롤</h3>
                  <Scrollbar smooth={true} className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 15)}
                  </Scrollbar>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    부드러운 스크롤 애니메이션이 적용됩니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">즉시 스크롤</h3>
                  <Scrollbar smooth={false} className="h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {longContent.slice(0, 15)}
                  </Scrollbar>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    즉시 스크롤됩니다 (애니메이션 없음).
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`// 자동 숨김 (기본값)
<Scrollbar autoHide={true}>
  {content}
</Scrollbar>

// 항상 표시
<Scrollbar autoHide={false}>
  {content}
</Scrollbar>

// 부드러운 스크롤 (기본값)
<Scrollbar smooth={true}>
  {content}
</Scrollbar>

// 즉시 스크롤
<Scrollbar smooth={false}>
  {content}
</Scrollbar>`}</code>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;glass&apos; | &apos;colorful&apos; | &apos;minimal&apos; | &apos;neon&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스크롤바의 스타일 변형</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스크롤바의 크기</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">orientation</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;vertical&apos; | &apos;horizontal&apos; | &apos;both&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;both&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스크롤 방향</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">autoHide</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">true</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스크롤하지 않을 때 자동 숨김</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">smooth</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">true</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">부드러운 스크롤 애니메이션</td>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스크롤할 콘텐츠</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </ComponentLayout>
  )
} 