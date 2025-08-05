"use client"

import React from "react"
import { 
  Panel,
  Action,
  Badge,
  ComponentLayout
} from "@hua-labs/ui"

export default function PanelPage() {
  return (
    <ComponentLayout
      title="Panel"
      description="콘텐츠를 담는 패널 컴포넌트입니다. 다양한 스타일과 패딩을 지원합니다."
      prevPage={{ title: "Badge", href: "/components/badge" }}
      nextPage={{ title: "Table", href: "/components/table" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Panel" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Panel style="solid" padding="large">
                  <h3 className="text-xl font-semibold mb-2">패널 제목</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">패널에 대한 설명입니다.</p>
                  <p>패널의 메인 콘텐츠 영역입니다.</p>
                  <div className="mt-4">
                    <Action>액션</Action>
                  </div>
                </Panel>
                <Panel style="solid" padding="medium">
                  <p>간단한 패널 콘텐츠입니다.</p>
                </Panel>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Panel, Action } from "@hua-labs/ui"

<Panel style="solid" padding="large">
  <h3 className="text-xl font-semibold mb-2">패널 제목</h3>
  <p className="text-slate-600 dark:text-slate-400 mb-4">패널에 대한 설명입니다.</p>
  <p>패널의 메인 콘텐츠 영역입니다.</p>
  <div className="mt-4">
    <Action>액션</Action>
  </div>
</Panel>

<Panel style="solid" padding="medium">
  <p>간단한 패널 콘텐츠입니다.</p>
</Panel>`}</code>
              </pre>
            </div>
          </section>

          {/* Styles */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">스타일</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Solid</h3>
                  <Panel style="solid" padding="medium">
                    <h4 className="font-semibold mb-2">Solid 패널</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">기본 스타일의 패널입니다.</p>
                  </Panel>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-white">Glass</h3>
                  <Panel style="glass" padding="medium">
                    <h4 className="font-semibold mb-2">Glass 패널</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">글래스 효과의 패널입니다.</p>
                  </Panel>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Outline</h3>
                  <Panel style="outline" padding="medium">
                    <h4 className="font-semibold mb-2">Outline 패널</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">테두리만 있는 패널입니다.</p>
                  </Panel>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Elevated</h3>
                  <Panel style="elevated" padding="medium">
                    <h4 className="font-semibold mb-2">Elevated 패널</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">그림자가 있는 패널입니다.</p>
                  </Panel>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Panel style="solid" padding="medium">Solid 패널</Panel>
<Panel style="glass" padding="medium">Glass 패널</Panel>
<Panel style="outline" padding="medium">Outline 패널</Panel>
<Panel style="elevated" padding="medium">Elevated 패널</Panel>`}</code>
              </pre>
            </div>
          </section>

          {/* Padding Options */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">패딩 옵션</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">None</h3>
                  <Panel style="solid" padding="none">
                    <p>패딩이 없는 패널입니다.</p>
                  </Panel>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Small</h3>
                  <Panel style="solid" padding="small">
                    <p>작은 패딩의 패널입니다.</p>
                  </Panel>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Medium</h3>
                  <Panel style="solid" padding="medium">
                    <p>중간 패딩의 패널입니다.</p>
                  </Panel>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Large</h3>
                  <Panel style="solid" padding="large">
                    <p>큰 패딩의 패널입니다.</p>
                  </Panel>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Panel style="solid" padding="none">패딩 없음</Panel>
<Panel style="solid" padding="small">작은 패딩</Panel>
<Panel style="solid" padding="medium">중간 패딩</Panel>
<Panel style="solid" padding="large">큰 패딩</Panel>`}</code>
              </pre>
            </div>
          </section>

          {/* Complex Example */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">복잡한 예시</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Panel style="elevated" padding="large">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge>New</Badge>
                    <h3 className="font-semibold">프리미엄 기능</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    고급 기능들을 포함한 프리미엄 패키지입니다.
                  </p>
                  <div className="flex gap-2">
                    <Action scale="small">자세히 보기</Action>
                    <Action appearance="outline" scale="small">구매하기</Action>
                  </div>
                </Panel>

                <Panel style="glass" padding="large">
                  <h3 className="font-semibold mb-2">글래스 효과</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    블러 효과가 적용된 모던한 디자인입니다.
                  </p>
                  <Action appearance="glass">시작하기</Action>
                </Panel>

                <Panel style="outline" padding="large">
                  <h3 className="font-semibold mb-2">아웃라인 스타일</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    깔끔한 테두리만 있는 미니멀한 디자인입니다.
                  </p>
                  <Action appearance="outline">더 알아보기</Action>
                </Panel>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Panel style="elevated" padding="large">
  <div className="flex items-center gap-2 mb-4">
    <Badge>New</Badge>
    <h3 className="font-semibold">프리미엄 기능</h3>
  </div>
  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
    고급 기능들을 포함한 프리미엄 패키지입니다.
  </p>
  <div className="flex gap-2">
    <Action scale="small">자세히 보기</Action>
    <Action appearance="outline" scale="small">구매하기</Action>
  </div>
</Panel>`}</code>
              </pre>
            </div>
          </section>

          {/* API Reference */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">API 참조</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Panel Props</h3>
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
                      <td className="py-2 font-mono">style</td>
                      <td className="py-2 font-mono">"solid" | "glass" | "outline" | "elevated"</td>
                      <td className="py-2 font-mono">"solid"</td>
                      <td className="py-2">패널의 스타일</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">padding</td>
                      <td className="py-2 font-mono">"none" | "small" | "medium" | "large"</td>
                      <td className="py-2 font-mono">"medium"</td>
                      <td className="py-2">패널의 내부 패딩</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">className</td>
                      <td className="py-2 font-mono">string</td>
                      <td className="py-2 font-mono">-</td>
                      <td className="py-2">추가 CSS 클래스</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono">children</td>
                      <td className="py-2 font-mono">ReactNode</td>
                      <td className="py-2 font-mono">-</td>
                      <td className="py-2">패널 내용</td>
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