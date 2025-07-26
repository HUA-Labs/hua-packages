"use client"

import React from "react"
import { Label } from "@hua-labs/ui"
import { Input } from "@hua-labs/ui"
import { ComponentLayout } from "@hua-labs/ui"

export default function LabelPage() {
  return (
    <ComponentLayout
      title="Label"
      description="입력 필드, 체크박스, 라디오 등과 함께 사용하는 라벨 컴포넌트입니다."
      prevPage={{ title: "Switch", href: "/components/switch" }}
      nextPage={{ title: "Form", href: "/components/form" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Label" }
      ]}
    >
      <div className="space-y-8">
        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="이메일을 입력하세요" />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input id="password" type="password" placeholder="비밀번호를 입력하세요" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { Label, Input } from "@hua-labs/ui"

<div>
  <Label htmlFor="email">이메일</Label>
  <Input id="email" type="email" placeholder="이메일을 입력하세요" />
</div>
<div>
  <Label htmlFor="password">비밀번호</Label>
  <Input id="password" type="password" placeholder="비밀번호를 입력하세요" />
</div>`}</code>
            </pre>
          </div>
        </section>

        {/* Required Label */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">필수 표시</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" required>이름</Label>
                <Input id="name" placeholder="이름을 입력하세요" />
              </div>
              <div>
                <Label htmlFor="phone" required>전화번호</Label>
                <Input id="phone" placeholder="전화번호를 입력하세요" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label htmlFor="name" required>이름</Label>
<Input id="name" placeholder="이름을 입력하세요" />

<Label htmlFor="phone" required>전화번호</Label>
<Input id="phone" placeholder="전화번호를 입력하세요" />`}</code>
            </pre>
          </div>
        </section>

        {/* Error State */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">에러 상태</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="error-email" error>이메일</Label>
                <Input id="error-email" type="email" placeholder="올바른 이메일을 입력하세요" />
              </div>
              <div>
                <Label htmlFor="error-password" error required>비밀번호</Label>
                <Input id="error-password" type="password" placeholder="8자 이상 입력하세요" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label htmlFor="error-email" error>이메일</Label>
<Input id="error-email" type="email" placeholder="올바른 이메일을 입력하세요" />

<Label htmlFor="error-password" error required>비밀번호</Label>
<Input id="error-password" type="password" placeholder="8자 이상 입력하세요" />`}</code>
            </pre>
          </div>
        </section>

        {/* Disabled State */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">비활성화 상태</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="disabled-input" disabled>비활성화된 입력</Label>
                <Input id="disabled-input" disabled placeholder="입력할 수 없습니다" />
              </div>
              <div>
                <Label htmlFor="disabled-required" disabled required>필수 비활성화</Label>
                <Input id="disabled-required" disabled placeholder="필수이지만 비활성화" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label htmlFor="disabled-input" disabled>비활성화된 입력</Label>
<Input id="disabled-input" disabled placeholder="입력할 수 없습니다" />

<Label htmlFor="disabled-required" disabled required>필수 비활성화</Label>
<Input id="disabled-required" disabled placeholder="필수이지만 비활성화" />`}</code>
            </pre>
          </div>
        </section>

        {/* Variants */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">변형</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-variant" variant="default">기본 스타일</Label>
                <Input id="default-variant" placeholder="기본 스타일의 라벨" />
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                <Label htmlFor="glass-variant" variant="glass">글래스 스타일</Label>
                <Input id="glass-variant" placeholder="글래스 스타일의 라벨" className="bg-white/20 border-white/30 text-white placeholder-white/70" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label htmlFor="default-variant" variant="default">기본 스타일</Label>
<Input id="default-variant" placeholder="기본 스타일의 라벨" />

<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
  <Label htmlFor="glass-variant" variant="glass">글래스 스타일</Label>
  <Input id="glass-variant" placeholder="글래스 스타일의 라벨" className="bg-white/20 border-white/30 text-white placeholder-white/70" />
</div>`}</code>
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
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">required</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">필수 필드 표시 (*)</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">error</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">에러 상태 스타일 적용</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">disabled</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">비활성화 상태 스타일 적용</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">variant</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;glass&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라벨의 스타일 변형</td>
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
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라벨 텍스트</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ComponentLayout>
  )
} 