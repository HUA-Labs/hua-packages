"use client"

import React, { useState } from "react"
import { Navigation, NavigationList, NavigationItem, NavigationContent, Panel, ComponentLayout } from '@hua-labs/hua-ux'
import { User, Gear, Bell } from '@phosphor-icons/react'

// API 문서용 타입 정의
const NAVIGATION_TYPES = {
  variant: '"pills" | "underline" | "cards"',
  variantDefault: '"pills"',
  scale: '"small" | "medium" | "large"',
  scaleDefault: '"medium"',
}

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState("tab1")

  return (
    <ComponentLayout
      title="Navigation"
      description="여러 콘텐츠를 네비게이션으로 전환할 수 있는 컴포넌트입니다."
      prevPage={{ title: "Table", href: "/components/table" }}
      nextPage={{ title: "Accordion", href: "/components/accordion" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Navigation" }
      ]}
    >
      {/* 기본 Navigation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">기본 사용법</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel padding="lg">
            <Navigation value={activeTab} onValueChange={setActiveTab}>
              <NavigationList>
                <NavigationItem value="tab1">첫 번째 탭</NavigationItem>
                <NavigationItem value="tab2">두 번째 탭</NavigationItem>
                <NavigationItem value="tab3">세 번째 탭</NavigationItem>
              </NavigationList>
              <NavigationContent value="tab1" active={activeTab === "tab1"}>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-2">첫 번째 탭 내용</h3>
                  <p className="text-slate-600 dark:text-slate-400">이것은 첫 번째 탭의 내용입니다. 여기에 다양한 콘텐츠를 배치할 수 있습니다.</p>
                </div>
              </NavigationContent>
              <NavigationContent value="tab2" active={activeTab === "tab2"}>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-2">두 번째 탭 내용</h3>
                  <p className="text-slate-600 dark:text-slate-400">이것은 두 번째 탭의 내용입니다. 폼이나 테이블 등을 포함할 수 있습니다.</p>
                </div>
              </NavigationContent>
              <NavigationContent value="tab3" active={activeTab === "tab3"}>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-2">세 번째 탭 내용</h3>
                  <p className="text-slate-600 dark:text-slate-400">이것은 세 번째 탭의 내용입니다. 차트나 그래프 등을 표시할 수 있습니다.</p>
                </div>
              </NavigationContent>
            </Navigation>
          </Panel>
          <Panel padding="lg">
            <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
              <code>{`import { Navigation, NavigationList, NavigationItem, NavigationContent } from '@hua-labs/hua-ux'

<Navigation value={value} onValueChange={setValue}>
  <NavigationList>
    <NavigationItem value="tab1">첫 번째 탭</NavigationItem>
    <NavigationItem value="tab2">두 번째 탭</NavigationItem>
    <NavigationItem value="tab3">세 번째 탭</NavigationItem>
  </NavigationList>
  <NavigationContent value="tab1" active={value === "tab1"}>
    첫 번째 탭 내용
  </NavigationContent>
  <NavigationContent value="tab2" active={value === "tab2"}>
    두 번째 탭 내용
  </NavigationContent>
  <NavigationContent value="tab3" active={value === "tab3"}>
    세 번째 탭 내용
  </NavigationContent>
</Navigation>`}</code>
            </pre>
          </Panel>
        </div>
      </section>

      {/* 아이콘이 있는 Navigation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          아이콘이 있는 Navigation
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Navigation defaultValue="profile">
            <NavigationList>
              <NavigationItem value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                프로필
              </NavigationItem>
              <NavigationItem value="settings" className="flex items-center gap-2">
                <Gear className="w-4 h-4" />
                설정
              </NavigationItem>
              <NavigationItem value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                알림
              </NavigationItem>
            </NavigationList>
            <NavigationContent value="profile" active={true}>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-2">프로필 정보</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  사용자의 프로필 정보를 관리할 수 있습니다.
                </p>
              </div>
            </NavigationContent>
            <NavigationContent value="settings" active={false}>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-2">설정</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  애플리케이션 설정을 변경할 수 있습니다.
                </p>
              </div>
            </NavigationContent>
            <NavigationContent value="notifications" active={false}>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-2">알림</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  알림 설정을 관리할 수 있습니다.
                </p>
              </div>
            </NavigationContent>
          </Navigation>
        </div>
      </div>

      {/* 스타일 변형 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">스타일 변형</h2>
        <div className="space-y-8">
          {/* Pills 스타일 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pills 스타일</h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Navigation defaultValue="tab1" variant="pills">
                <NavigationList>
                  <NavigationItem value="tab1">탭 1</NavigationItem>
                  <NavigationItem value="tab2">탭 2</NavigationItem>
                  <NavigationItem value="tab3">탭 3</NavigationItem>
                </NavigationList>
                <NavigationContent value="tab1" active={true}>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                    <p>Pills 스타일의 네비게이션입니다.</p>
                  </div>
                </NavigationContent>
              </Navigation>
            </div>
          </div>

          {/* Underline 스타일 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Underline 스타일</h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Navigation defaultValue="tab1" variant="underline">
                <NavigationList>
                  <NavigationItem value="tab1">탭 1</NavigationItem>
                  <NavigationItem value="tab2">탭 2</NavigationItem>
                  <NavigationItem value="tab3">탭 3</NavigationItem>
                </NavigationList>
                <NavigationContent value="tab1" active={true}>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                    <p>Underline 스타일의 네비게이션입니다.</p>
                  </div>
                </NavigationContent>
              </Navigation>
            </div>
          </div>

          {/* Cards 스타일 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cards 스타일</h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Navigation defaultValue="tab1" variant="cards">
                <NavigationList>
                  <NavigationItem value="tab1">탭 1</NavigationItem>
                  <NavigationItem value="tab2">탭 2</NavigationItem>
                  <NavigationItem value="tab3">탭 3</NavigationItem>
                </NavigationList>
                <NavigationContent value="tab1" active={true}>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                    <p>Cards 스타일의 네비게이션입니다.</p>
                  </div>
                </NavigationContent>
              </Navigation>
            </div>
          </div>
        </div>
      </section>

      {/* 크기 변형 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">크기 변형</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Small 크기</h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Navigation defaultValue="tab1" scale="small">
                <NavigationList>
                  <NavigationItem value="tab1">작은 탭</NavigationItem>
                  <NavigationItem value="tab2">작은 탭</NavigationItem>
                </NavigationList>
                <NavigationContent value="tab1" active={true}>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                    <p>작은 크기의 네비게이션입니다.</p>
                  </div>
                </NavigationContent>
              </Navigation>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Large 크기</h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Navigation defaultValue="tab1" scale="large">
                <NavigationList>
                  <NavigationItem value="tab1">큰 탭</NavigationItem>
                  <NavigationItem value="tab2">큰 탭</NavigationItem>
                </NavigationList>
                <NavigationContent value="tab1" active={true}>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-4">
                    <p>큰 크기의 네비게이션입니다.</p>
                  </div>
                </NavigationContent>
              </Navigation>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">API 참조</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Navigation Props</h3>
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
                  <td className="py-2 font-mono">value</td>
                  <td className="py-2 font-mono">string</td>
                  <td className="py-2 font-mono">-</td>
                  <td className="py-2">현재 활성화된 탭의 값</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-2 font-mono">defaultValue</td>
                  <td className="py-2 font-mono">string</td>
                  <td className="py-2 font-mono">-</td>
                  <td className="py-2">기본 활성화될 탭의 값</td>
                </tr>
                                 <tr className="border-b border-slate-200 dark:border-slate-700">
                   <td className="py-2 font-mono">onValueChange</td>
                   <td className="py-2 font-mono">(value: string) =&gt; void</td>
                   <td className="py-2 font-mono">-</td>
                   <td className="py-2">탭 변경 시 호출되는 콜백</td>
                 </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-2 font-mono">variant</td>
                  <td className="py-2 font-mono">{NAVIGATION_TYPES.variant}</td>
                  <td className="py-2 font-mono">{NAVIGATION_TYPES.variantDefault}</td>
                  <td className="py-2">네비게이션의 스타일</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-2 font-mono">scale</td>
                  <td className="py-2 font-mono">{NAVIGATION_TYPES.scale}</td>
                  <td className="py-2 font-mono">{NAVIGATION_TYPES.scaleDefault}</td>
                  <td className="py-2">네비게이션의 크기</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </ComponentLayout>
  )
} 