"use client"

import React from "react"
import { Select, SelectOption, Label, Icon, ComponentLayout } from "@hua-labs/ui"

export default function SelectPage() {
  return (
    <ComponentLayout
      title="Select"
      description="드롭다운 선택 컴포넌트입니다. 다양한 스타일과 크기 옵션을 지원하며, 아이콘도 추가할 수 있습니다."
      prevPage={{ title: "Textarea", href: "/components/textarea" }}
      nextPage={{ title: "Checkbox", href: "/components/checkbox" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Select" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="basic-select">국가 선택</Label>
                  <Select id="basic-select" placeholder="국가를 선택하세요">
                    <SelectOption value="kr">대한민국</SelectOption>
                    <SelectOption value="us">미국</SelectOption>
                    <SelectOption value="jp">일본</SelectOption>
                    <SelectOption value="cn">중국</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-select">카테고리</Label>
                  <Select id="category-select" placeholder="카테고리를 선택하세요">
                    <SelectOption value="tech">기술</SelectOption>
                    <SelectOption value="design">디자인</SelectOption>
                    <SelectOption value="business">비즈니스</SelectOption>
                    <SelectOption value="lifestyle">라이프스타일</SelectOption>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Select, SelectOption, Label } from "@hua-labs/ui"

<div>
  <Label htmlFor="basic-select">국가 선택</Label>
  <Select id="basic-select" placeholder="국가를 선택하세요">
    <SelectOption value="kr">대한민국</SelectOption>
    <SelectOption value="us">미국</SelectOption>
    <SelectOption value="jp">일본</SelectOption>
    <SelectOption value="cn">중국</SelectOption>
  </Select>
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
                  <Select id="default-variant" variant="default" placeholder="기본 스타일">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="outline-variant">아웃라인</Label>
                  <Select id="outline-variant" variant="outline" placeholder="아웃라인 스타일">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filled-variant">채워진</Label>
                  <Select id="filled-variant" variant="filled" placeholder="채워진 스타일">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ghost-variant">고스트</Label>
                  <Select id="ghost-variant" variant="ghost" placeholder="고스트 스타일">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <Label htmlFor="glass-variant" variant="glass">글래스</Label>
                  <Select id="glass-variant" variant="glass" placeholder="글래스 스타일">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Select variant="default" placeholder="기본 스타일">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>

<Select variant="outline" placeholder="아웃라인 스타일">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>`}</code>
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
                  <Select id="small-size" size="sm" placeholder="작은 크기 (sm)">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="medium-size">중간 크기</Label>
                  <Select id="medium-size" size="md" placeholder="중간 크기 (md) - 기본값">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="large-size">큰 크기</Label>
                  <Select id="large-size" size="lg" placeholder="큰 크기 (lg)">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Select size="sm" placeholder="작은 크기">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>

<Select size="md" placeholder="중간 크기 - 기본값">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>

<Select size="lg" placeholder="큰 크기">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>`}</code>
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
                  <Select id="error-state" error placeholder="에러가 발생한 상태">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="success-state">성공 상태</Label>
                  <Select id="success-state" success placeholder="성공한 상태">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="disabled-state">비활성화</Label>
                  <Select id="disabled-state" disabled placeholder="비활성화된 상태">
                    <SelectOption value="option1">옵션 1</SelectOption>
                    <SelectOption value="option2">옵션 2</SelectOption>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Select error placeholder="에러 상태">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>

<Select success placeholder="성공 상태">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>

<Select disabled placeholder="비활성화 상태">
  <SelectOption value="option1">옵션 1</SelectOption>
  <SelectOption value="option2">옵션 2</SelectOption>
</Select>`}</code>
              </pre>
            </div>
          </section>

          {/* With Icons */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">아이콘과 함께</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="icon-select">아이콘이 있는 선택</Label>
                  <Select 
                    id="icon-select" 
                    leftIcon={<Icon name={"globe" as any} size={16} />}
                    placeholder="국가를 선택하세요"
                  >
                    <SelectOption value="kr">대한민국</SelectOption>
                    <SelectOption value="us">미국</SelectOption>
                    <SelectOption value="jp">일본</SelectOption>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user-select">사용자 아이콘</Label>
                  <Select 
                    id="user-select" 
                    leftIcon={<Icon name={"user" as any} size={16} />}
                    placeholder="사용자를 선택하세요"
                  >
                    <SelectOption value="user1">김철수</SelectOption>
                    <SelectOption value="user2">이영희</SelectOption>
                    <SelectOption value="user3">박민수</SelectOption>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Icon } from "@hua-labs/ui"

<Select 
  leftIcon={<Icon name={"globe" as any} size={16} />}
  placeholder="국가를 선택하세요"
>
  <SelectOption value="kr">대한민국</SelectOption>
  <SelectOption value="us">미국</SelectOption>
  <SelectOption value="jp">일본</SelectOption>
</Select>

<Select 
  leftIcon={<Icon name={"user" as any} size={16} />}
  placeholder="사용자를 선택하세요"
>
  <SelectOption value="user1">김철수</SelectOption>
  <SelectOption value="user2">이영희</SelectOption>
  <SelectOption value="user3">박민수</SelectOption>
</Select>`}</code>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">선택 컴포넌트의 스타일 변형</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">선택 컴포넌트의 크기</td>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">leftIcon</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">ReactNode</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">왼쪽에 표시할 아이콘</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">placeholder</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">플레이스홀더 텍스트</td>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">SelectOption 컴포넌트들</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SelectOption Props */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">SelectOption Props</h2>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">value</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">옵션의 값</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">children</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">ReactNode</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">옵션에 표시할 텍스트</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">disabled</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">옵션 비활성화</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </ComponentLayout>
  )
} 