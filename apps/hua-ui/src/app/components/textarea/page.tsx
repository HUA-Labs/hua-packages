"use client"

import React from "react"
import { Textarea, Label, ComponentLayout } from "@hua-labs/ui"

export default function TextareaPage() {
  return (
    <ComponentLayout
      title="Textarea"
      description="여러 줄 텍스트 입력을 위한 컴포넌트입니다. 다양한 스타일과 크기 옵션을 지원합니다."
      prevPage={{ title: "Input", href: "/components/input" }}
      nextPage={{ title: "Select", href: "/components/select" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Textarea" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="basic-textarea">메모</Label>
                  <Textarea 
                    id="basic-textarea" 
                    placeholder="메모를 입력하세요..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea 
                    id="description" 
                    placeholder="상세한 설명을 입력하세요..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Textarea, Label } from "@hua-labs/ui"

<div>
  <Label htmlFor="basic-textarea">메모</Label>
  <Textarea 
    id="basic-textarea" 
    placeholder="메모를 입력하세요..."
  />
</div>
<div>
  <Label htmlFor="description">설명</Label>
  <Textarea 
    id="description" 
    placeholder="상세한 설명을 입력하세요..."
    rows={4}
  />
</div>`}</code>
              </pre>
            </div>
          </section>

          {/* Variants */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">변형</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="default-variant">기본</Label>
                  <Textarea 
                    id="default-variant" 
                    variant="default"
                    placeholder="기본 스타일"
                  />
                </div>
                <div>
                  <Label htmlFor="outline-variant">아웃라인</Label>
                  <Textarea 
                    id="outline-variant" 
                    variant="outline"
                    placeholder="아웃라인 스타일"
                  />
                </div>
                <div>
                  <Label htmlFor="filled-variant">채워진</Label>
                  <Textarea 
                    id="filled-variant" 
                    variant="filled"
                    placeholder="채워진 스타일"
                  />
                </div>
                <div>
                  <Label htmlFor="ghost-variant">고스트</Label>
                  <Textarea 
                    id="ghost-variant" 
                    variant="ghost"
                    placeholder="고스트 스타일"
                  />
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <Label htmlFor="glass-variant" className="text-white">글래스</Label>
                  <Textarea 
                    id="glass-variant" 
                    variant="glass"
                    placeholder="글래스 모피즘 스타일"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Textarea variant="default" placeholder="기본 스타일" />
<Textarea variant="outline" placeholder="아웃라인 스타일" />
<Textarea variant="filled" placeholder="채워진 스타일" />
<Textarea variant="ghost" placeholder="고스트 스타일" />
<Textarea variant="glass" placeholder="글래스 스타일" />`}</code>
              </pre>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">크기</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="small-size">작은 크기</Label>
                  <Textarea 
                    id="small-size" 
                    size="sm"
                    placeholder="작은 크기 (sm)"
                  />
                </div>
                <div>
                  <Label htmlFor="medium-size">중간 크기</Label>
                  <Textarea 
                    id="medium-size" 
                    size="md"
                    placeholder="중간 크기 (md) - 기본값"
                  />
                </div>
                <div>
                  <Label htmlFor="large-size">큰 크기</Label>
                  <Textarea 
                    id="large-size" 
                    size="lg"
                    placeholder="큰 크기 (lg)"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Textarea size="sm" placeholder="작은 크기" />
<Textarea size="md" placeholder="중간 크기 - 기본값" />
<Textarea size="lg" placeholder="큰 크기" />`}</code>
              </pre>
            </div>
          </section>

          {/* States */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">상태</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="error-state">에러 상태</Label>
                  <Textarea 
                    id="error-state" 
                    error
                    placeholder="에러가 발생한 상태"
                  />
                </div>
                <div>
                  <Label htmlFor="success-state">성공 상태</Label>
                  <Textarea 
                    id="success-state" 
                    success
                    placeholder="성공한 상태"
                  />
                </div>
                <div>
                  <Label htmlFor="disabled-state">비활성화</Label>
                  <Textarea 
                    id="disabled-state" 
                    disabled
                    placeholder="비활성화된 상태"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Textarea error placeholder="에러 상태" />
<Textarea success placeholder="성공 상태" />
<Textarea disabled placeholder="비활성화 상태" />`}</code>
              </pre>
            </div>
          </section>

          {/* Resize Options */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">크기 조절 옵션</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resize-none">크기 조절 없음</Label>
                  <Textarea 
                    id="resize-none" 
                    resize="none"
                    placeholder="크기 조절 불가능"
                  />
                </div>
                <div>
                  <Label htmlFor="resize-vertical">세로만 조절</Label>
                  <Textarea 
                    id="resize-vertical" 
                    resize="vertical"
                    placeholder="세로 크기만 조절 가능 (기본값)"
                  />
                </div>
                <div>
                  <Label htmlFor="resize-horizontal">가로만 조절</Label>
                  <Textarea 
                    id="resize-horizontal" 
                    resize="horizontal"
                    placeholder="가로 크기만 조절 가능"
                  />
                </div>
                <div>
                  <Label htmlFor="resize-both">모든 방향 조절</Label>
                  <Textarea 
                    id="resize-both" 
                    resize="both"
                    placeholder="모든 방향으로 크기 조절 가능"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Textarea resize="none" placeholder="크기 조절 불가능" />
<Textarea resize="vertical" placeholder="세로만 조절 가능" />
<Textarea resize="horizontal" placeholder="가로만 조절 가능" />
<Textarea resize="both" placeholder="모든 방향 조절 가능" />`}</code>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;outline&apos; | &apos;filled&apos; | &apos;ghost&apos; | &apos;glass&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">텍스트 영역의 스타일 변형</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">텍스트 영역의 크기</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">error</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">에러 상태 스타일 적용</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">success</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">성공 상태 스타일 적용</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">resize</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;none&apos; | &apos;vertical&apos; | &apos;horizontal&apos; | &apos;both&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;vertical&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">크기 조절 방향 설정</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">className</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">추가 CSS 클래스</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">placeholder</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">플레이스홀더 텍스트</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">rows</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">number</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">초기 행 수</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </ComponentLayout>
  )
} 