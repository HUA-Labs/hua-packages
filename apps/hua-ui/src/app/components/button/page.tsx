"use client"

import React from "react"
import { Button, Icon, ComponentLayout } from "@hua-labs/ui"

export default function ButtonPage() {
  return (
    <ComponentLayout
      title="Button"
      description="다양한 스타일과 변형을 지원하는 버튼 컴포넌트입니다."
      prevPage={{ title: "EmotionAnalysis", href: "/components/emotion-analysis" }}
      nextPage={{ title: "Input", href: "/components/input" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Button" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Button>기본 버튼</Button>
                <Button variant="outline">아웃라인</Button>
                <Button variant="ghost">고스트</Button>
                <Button variant="glass">글래스</Button>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Button } from "@hua-labs/ui"

<Button>기본 버튼</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button variant="glass">글래스</Button>`}</code>
              </pre>
            </div>
          </section>

          {/* Variants */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">외관</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button>기본</Button>
                <Button variant="secondary">보조</Button>
                <Button variant="outline">아웃라인</Button>
                <Button variant="ghost">고스트</Button>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <Button variant="glass">글래스</Button>
                </div>
              </div>
            </div>
            
            {/* 아웃라인 버튼 테스트 - 다양한 배경 */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">아웃라인 버튼 테스트</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <Button variant="outline">흰 배경 위 아웃라인</Button>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                  <Button variant="outline">회색 배경 위 아웃라인</Button>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <Button variant="outline">파란 배경 위 아웃라인</Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Button>기본</Button>
<Button variant="secondary">보조</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button variant="glass">글래스</Button>`}</code>
              </pre>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">크기</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">작은 버튼</Button>
                <Button>기본 버튼</Button>
                <Button size="lg">큰 버튼</Button>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Button size="sm">작은 버튼</Button>
<Button>기본 버튼</Button>
<Button size="lg">큰 버튼</Button>`}</code>
              </pre>
            </div>
          </section>

          {/* With Icons */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">아이콘과 함께</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Icon name="download" className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
                <Button variant="outline">
                  <Icon name="heart" className="w-4 h-4 mr-2" />
                  좋아요
                </Button>
                <Button variant="ghost">
                  <Icon name="share" className="w-4 h-4 mr-2" />
                  공유
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Button>
  <Icon name="download" className="w-4 h-4 mr-2" />
  다운로드
</Button>
<Button variant="outline">
  <Icon name="heart" className="w-4 h-4 mr-2" />
  좋아요
</Button>
<Button variant="ghost">
  <Icon name="share" className="w-4 h-4 mr-2" />
  공유
</Button>`}</code>
              </pre>
            </div>
          </section>

          {/* Loading State */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">로딩 상태</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Button loading>로딩 중</Button>
                <Button variant="outline" loading>로딩 중</Button>
                <Button variant="ghost" loading>로딩 중</Button>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Button loading>로딩 중</Button>
<Button variant="outline" loading>로딩 중</Button>
<Button variant="ghost" loading>로딩 중</Button>`}</code>
              </pre>
            </div>
          </section>

          {/* Disabled State */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">비활성화 상태</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Button disabled>비활성화</Button>
                <Button variant="outline" disabled>비활성화</Button>
                <Button variant="ghost" disabled>비활성화</Button>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Button disabled>비활성화</Button>
<Button variant="outline" disabled>비활성화</Button>
<Button variant="ghost" disabled>비활성화</Button>`}</code>
              </pre>
            </div>
          </section>

          {/* API Reference */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">API 참조</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Button Props</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 font-medium">Prop</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Default</th>
                      <th className="text-left py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">variant</td>
                      <td className="py-2 font-mono">"default" | "secondary" | "outline" | "ghost" | "glass"</td>
                      <td className="py-2 font-mono">"default"</td>
                      <td className="py-2">버튼의 외관 스타일</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">size</td>
                      <td className="py-2 font-mono">"sm" | "md" | "lg"</td>
                      <td className="py-2 font-mono">"md"</td>
                      <td className="py-2">버튼의 크기</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">loading</td>
                      <td className="py-2 font-mono">boolean</td>
                      <td className="py-2 font-mono">false</td>
                      <td className="py-2">로딩 상태 표시</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">disabled</td>
                      <td className="py-2 font-mono">boolean</td>
                      <td className="py-2 font-mono">false</td>
                      <td className="py-2">비활성화 상태</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
    </ComponentLayout>
  )
} 