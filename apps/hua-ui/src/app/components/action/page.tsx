"use client"

import React from "react"
import { Action, Icon, ComponentLayout } from "@hua-labs/ui"

// 디버깅을 위한 로그
console.log("Action component:", Action)
console.log("Icon component:", Icon)
console.log("ComponentLayout component:", ComponentLayout)

export default function ActionPage() {
  return (
    <ComponentLayout
      title="Action"
      description="다양한 스타일과 변형을 지원하는 액션 컴포넌트입니다."
      prevPage={{ title: "EmotionAnalysis", href: "/components/emotion-analysis" }}
      nextPage={{ title: "Input", href: "/components/input" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Action" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Action>기본 액션</Action>
                <Action appearance="outline">아웃라인</Action>
                <Action appearance="ghost">고스트</Action>
                <Action appearance="glass">글래스</Action>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Action } from "@hua-labs/ui"

<Action>기본 액션</Action>
<Action appearance="outline">아웃라인</Action>
<Action appearance="ghost">고스트</Action>
<Action appearance="glass">글래스</Action>`}</code>
              </pre>
            </div>
          </section>

          {/* Variants */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">외관</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Action>기본</Action>
                <Action appearance="secondary">보조</Action>
                <Action appearance="outline">아웃라인</Action>
                <Action appearance="ghost">고스트</Action>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <Action appearance="glass">글래스</Action>
                </div>
              </div>
            </div>
            
            {/* 아웃라인 액션 테스트 - 다양한 배경 */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">아웃라인 액션 테스트</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <Action appearance="outline">흰 배경 위 아웃라인</Action>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                  <Action appearance="outline">회색 배경 위 아웃라인</Action>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <Action appearance="outline">파란 배경 위 아웃라인</Action>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Action>기본</Action>
<Action appearance="secondary">보조</Action>
<Action appearance="outline">아웃라인</Action>
<Action appearance="ghost">고스트</Action>
<Action appearance="glass">글래스</Action>`}</code>
              </pre>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">크기</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <Action scale="small">작은 액션</Action>
                <Action>기본 액션</Action>
                <Action scale="large">큰 액션</Action>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Action scale="small">작은 액션</Action>
<Action>기본 액션</Action>
<Action scale="large">큰 액션</Action>`}</code>
              </pre>
            </div>
          </section>

          {/* With Icons */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">아이콘과 함께</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Action>
                  <Icon name="download" className="w-4 h-4 mr-2" />
                  다운로드
                </Action>
                <Action appearance="outline">
                  <Icon name="heart" className="w-4 h-4 mr-2" />
                  좋아요
                </Action>
                <Action appearance="ghost">
                  <Icon name="share" className="w-4 h-4 mr-2" />
                  공유
                </Action>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Action>
  <Icon name="download" className="w-4 h-4 mr-2" />
  다운로드
</Action>
<Action appearance="outline">
  <Icon name="heart" className="w-4 h-4 mr-2" />
  좋아요
</Action>
<Action appearance="ghost">
  <Icon name="share" className="w-4 h-4 mr-2" />
  공유
</Action>`}</code>
              </pre>
            </div>
          </section>

          {/* Loading State */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">로딩 상태</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Action loading>로딩 중</Action>
                <Action appearance="outline" loading>로딩 중</Action>
                <Action appearance="ghost" loading>로딩 중</Action>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Action loading>로딩 중</Action>
<Action appearance="outline" loading>로딩 중</Action>
<Action appearance="ghost" loading>로딩 중</Action>`}</code>
              </pre>
            </div>
          </section>

          {/* Disabled State */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">비활성화 상태</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Action disabled>비활성화</Action>
                <Action appearance="outline" disabled>비활성화</Action>
                <Action appearance="ghost" disabled>비활성화</Action>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Action disabled>비활성화</Action>
<Action appearance="outline" disabled>비활성화</Action>
<Action appearance="ghost" disabled>비활성화</Action>`}</code>
              </pre>
            </div>
          </section>

          {/* Smart Utilities */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">스마트 유틸리티</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">merge 유틸리티</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    HUA UI의 스마트 클래스 병합 유틸리티로 중복 클래스를 자동으로 해결합니다.
                  </p>
                  <pre className="bg-slate-800 text-slate-100 p-3 rounded text-sm">
                    <code>{`import { merge } from "@hua-labs/ui"

// 중복 클래스 자동 해결
merge("px-2 py-1", "px-4") // "py-1 px-4"
merge("text-red-500", "text-blue-500") // "text-blue-500"`}</code>
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">mergeIf 유틸리티</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    조건부 클래스 병합으로 더 깔끔한 코드를 작성할 수 있습니다.
                  </p>
                  <pre className="bg-slate-800 text-slate-100 p-3 rounded text-sm">
                    <code>{`import { mergeIf } from "@hua-labs/ui"

// 조건부 클래스 적용
mergeIf(isActive, "bg-blue-500", "bg-gray-200")
mergeIf(isLoading, "opacity-50 cursor-not-allowed")`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">mergeMap 유틸리티</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    객체 기반 클래스 병합으로 복잡한 조건을 쉽게 관리할 수 있습니다.
                  </p>
                  <pre className="bg-slate-800 text-slate-100 p-3 rounded text-sm">
                    <code>{`import { mergeMap } from "@hua-labs/ui"

// 객체 기반 조건부 클래스
mergeMap({
  "bg-blue-500": isPrimary,
  "bg-gray-500": !isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
})`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">API 참조</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Action Props</h3>
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
                      <td className="py-2 font-mono">appearance</td>
                      <td className="py-2 font-mono">"primary" | "secondary" | "outline" | "ghost" | "glass"</td>
                      <td className="py-2 font-mono">"primary"</td>
                      <td className="py-2">액션의 외관 스타일</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">scale</td>
                      <td className="py-2 font-mono">"small" | "medium" | "large"</td>
                      <td className="py-2 font-mono">"medium"</td>
                      <td className="py-2">액션의 크기</td>
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