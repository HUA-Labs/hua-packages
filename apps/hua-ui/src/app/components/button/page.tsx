"use client"

import React from "react"
import Link from "next/link"
import { Button, CodeBlock, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@hua-labs/hua-ux"
import { ArrowLeft, ArrowRight, DownloadSimple, Heart, ShareNetwork } from "@phosphor-icons/react"

export default function ButtonPage() {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Link */}
        <Link
          href="/components"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          컴포넌트
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Button</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
            다양한 스타일과 변형을 지원하는 버튼 컴포넌트입니다.
          </p>
          <CodeBlock
            language="tsx"
            code={`import { Button } from "@hua-labs/hua-ux"`}
          />
        </div>

        {/* Basic Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>기본 사용법</CardTitle>
            <CardDescription>다양한 variant로 버튼 스타일을 변경할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
              <div className="flex flex-wrap gap-4">
                <Button>기본 버튼</Button>
                <Button variant="outline">아웃라인</Button>
                <Button variant="ghost">고스트</Button>
                <Button variant="glass">글래스</Button>
              </div>
            </div>
            <CodeBlock
              language="tsx"
              code={`<Button>기본 버튼</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button variant="glass">글래스</Button>`}
            />
          </CardContent>
        </Card>

        {/* Variants */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>외관</CardTitle>
            <CardDescription>9가지 기본 variant를 제공합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button>기본</Button>
                <Button variant="secondary">보조</Button>
                <Button variant="outline">아웃라인</Button>
                <Button variant="ghost">고스트</Button>
                <Button variant="destructive">위험</Button>
                <Button variant="link">링크</Button>
              </div>
            </div>
            <CodeBlock
              language="tsx"
              code={`<Button>기본</Button>
<Button variant="secondary">보조</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button variant="destructive">위험</Button>
<Button variant="link">링크</Button>`}
            />
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>크기</CardTitle>
            <CardDescription>5가지 크기 옵션을 제공합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">작은 버튼</Button>
                <Button>기본 버튼</Button>
                <Button size="lg">큰 버튼</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>
            <CodeBlock
              language="tsx"
              code={`<Button size="sm">작은 버튼</Button>
<Button>기본 버튼</Button>
<Button size="lg">큰 버튼</Button>
<Button size="xl">Extra Large</Button>`}
            />
          </CardContent>
        </Card>

        {/* With Icons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>아이콘과 함께</CardTitle>
            <CardDescription>icon prop으로 아이콘을 추가할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
              <div className="flex flex-wrap gap-4">
                <Button icon={<DownloadSimple className="w-4 h-4" />}>
                  다운로드
                </Button>
                <Button variant="outline" icon={<Heart className="w-4 h-4" />}>
                  좋아요
                </Button>
                <Button variant="ghost" icon={<ShareNetwork className="w-4 h-4" />}>
                  공유
                </Button>
              </div>
            </div>
            <CodeBlock
              language="tsx"
              code={`<Button icon={<DownloadSimple className="w-4 h-4" />}>
  다운로드
</Button>
<Button variant="outline" icon={<Heart className="w-4 h-4" />}>
  좋아요
</Button>
<Button variant="ghost" icon={<ShareNetwork className="w-4 h-4" />}>
  공유
</Button>`}
            />
          </CardContent>
        </Card>

        {/* Loading State */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>로딩 상태</CardTitle>
            <CardDescription>loading prop으로 로딩 스피너를 표시합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
              <div className="flex flex-wrap gap-4">
                <Button loading>로딩 중</Button>
                <Button variant="outline" loading>로딩 중</Button>
                <Button variant="ghost" loading>로딩 중</Button>
              </div>
            </div>
            <CodeBlock
              language="tsx"
              code={`<Button loading>로딩 중</Button>
<Button variant="outline" loading>로딩 중</Button>
<Button variant="ghost" loading>로딩 중</Button>`}
            />
          </CardContent>
        </Card>

        {/* Disabled State */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>비활성화 상태</CardTitle>
            <CardDescription>disabled prop으로 버튼을 비활성화합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
              <div className="flex flex-wrap gap-4">
                <Button disabled>비활성화</Button>
                <Button variant="outline" disabled>비활성화</Button>
                <Button variant="ghost" disabled>비활성화</Button>
              </div>
            </div>
            <CodeBlock
              language="tsx"
              code={`<Button disabled>비활성화</Button>
<Button variant="outline" disabled>비활성화</Button>
<Button variant="ghost" disabled>비활성화</Button>`}
            />
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API 참조</CardTitle>
          </CardHeader>
          <CardContent>
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
                <tbody className="text-slate-600 dark:text-slate-400">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2 font-mono text-slate-900 dark:text-white">variant</td>
                    <td className="py-2 text-xs">&quot;default&quot; | &quot;secondary&quot; | &quot;outline&quot; | ...</td>
                    <td className="py-2">&quot;default&quot;</td>
                    <td className="py-2">버튼의 외관 스타일</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2 font-mono text-slate-900 dark:text-white">size</td>
                    <td className="py-2 text-xs">&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot; | &quot;icon&quot;</td>
                    <td className="py-2">&quot;md&quot;</td>
                    <td className="py-2">버튼의 크기</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2 font-mono text-slate-900 dark:text-white">loading</td>
                    <td className="py-2 text-xs">boolean</td>
                    <td className="py-2">false</td>
                    <td className="py-2">로딩 상태 표시</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2 font-mono text-slate-900 dark:text-white">disabled</td>
                    <td className="py-2 text-xs">boolean</td>
                    <td className="py-2">false</td>
                    <td className="py-2">비활성화 상태</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2 font-mono text-slate-900 dark:text-white">icon</td>
                    <td className="py-2 text-xs">ReactNode</td>
                    <td className="py-2">-</td>
                    <td className="py-2">아이콘 요소</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-slate-900 dark:text-white">hover</td>
                    <td className="py-2 text-xs">&quot;springy&quot; | &quot;scale&quot; | &quot;glow&quot; | ...</td>
                    <td className="py-2">&quot;springy&quot;</td>
                    <td className="py-2">호버 효과 스타일</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Link
            href="/components"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            컴포넌트 목록
          </Link>
          <Link
            href="/components/input"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Input
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
