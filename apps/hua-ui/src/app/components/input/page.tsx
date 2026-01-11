"use client"

import React, { useState } from "react"
import { Input, Label, ComponentLayout } from '@hua-labs/hua-ux'
import { MagnifyingGlass, Envelope, Lock, Eye } from '@phosphor-icons/react'

export default function InputPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    search: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <ComponentLayout
      title="Input"
      description="사용자 입력을 받는 다양한 입력 필드 컴포넌트입니다."
      prevPage={{ title: "Button", href: "/components/button" }}
      nextPage={{ title: "Textarea", href: "/components/textarea" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Input" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input 
                    id="name"
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Input, Label } from '@hua-labs/hua-ux'

<div>
  <Label htmlFor="name">이름</Label>
  <Input 
    id="name"
    placeholder="이름을 입력하세요"
  />
</div>

<div>
  <Label htmlFor="email">이메일</Label>
  <Input 
    id="email"
    type="email"
    placeholder="이메일을 입력하세요"
  />
</div>

<div>
  <Label htmlFor="password">비밀번호</Label>
  <Input 
    id="password"
    type="password"
    placeholder="비밀번호를 입력하세요"
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
                  <Input 
                    id="default-variant"
                    placeholder="기본 스타일"
                  />
                </div>
                <div>
                  <Label htmlFor="outline-variant">아웃라인</Label>
                  <Input 
                    id="outline-variant"
                    placeholder="아웃라인 스타일"
                  />
                </div>
                <div>
                  <Label htmlFor="filled-variant">채워진</Label>
                  <Input 
                    id="filled-variant"
                    placeholder="채워진 스타일"
                  />
                </div>
                <div>
                  <Label htmlFor="ghost-variant">고스트</Label>
                  <Input 
                    id="ghost-variant"
                    placeholder="고스트 스타일"
                  />
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <Label htmlFor="glass-variant">글래스</Label>
                  <Input 
                    id="glass-variant"
                    placeholder="글래스 스타일"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Input placeholder="기본 스타일" />
<Input placeholder="아웃라인 스타일" />
<Input placeholder="채워진 스타일" />
<Input placeholder="고스트 스타일" />
<Input placeholder="글래스 스타일" />`}</code>
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
                  <Input 
                    id="small-size"
                    placeholder="작은 크기"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="medium-size">중간 크기</Label>
                  <Input 
                    id="medium-size"
                    placeholder="중간 크기 - 기본값"
                  />
                </div>
                <div>
                  <Label htmlFor="large-size">큰 크기</Label>
                  <Input 
                    id="large-size"
                    placeholder="큰 크기"
                    className="text-lg"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Input placeholder="작은 크기" className="text-sm" />
<Input placeholder="중간 크기 - 기본값" />
<Input placeholder="큰 크기" className="text-lg" />`}</code>
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
                  <Input 
                    id="error-state"
                    aria-invalid={true}
                    placeholder="에러가 발생한 상태"
                  />
                </div>
                <div>
                  <Label htmlFor="success-state">성공 상태</Label>
                  <Input 
                    id="success-state"
                    placeholder="성공한 상태"
                    className="border-green-500 focus-visible:ring-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="disabled-state">비활성화</Label>
                  <Input 
                    id="disabled-state"
                    disabled
                    placeholder="비활성화된 상태"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Input aria-invalid={true} placeholder="에러 상태" />
<Input placeholder="성공 상태" className="border-green-500 focus-visible:ring-green-500" />
<Input disabled placeholder="비활성화 상태" />`}</code>
              </pre>
            </div>
          </section>

          {/* With Icons */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">아이콘과 함께</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-input">검색</Label>
                  <div className="relative">
                    <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="search-input"
                      placeholder="검색어를 입력하세요"
                      className="pl-10"
                      value={formData.search}
                      onChange={(e) => handleInputChange('search', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email-input">이메일</Label>
                  <div className="relative">
                    <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email-input"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password-input">비밀번호</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Eye size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
                    <Input 
                      id="password-input"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      className="pl-10 pr-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { MagnifyingGlass, Envelope, Lock, Eye } from '@phosphor-icons/react'

<div className="relative">
  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input placeholder="검색어를 입력하세요" className="pl-10" />
</div>

<div className="relative">
  <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input type="email" placeholder="이메일을 입력하세요" className="pl-10" />
</div>

<div className="relative">
  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Eye size={16} className="absolute right-3 top-1/2 -translate-y-1/2" />
  <Input type="password" placeholder="비밀번호를 입력하세요" className="pl-10 pr-10" />
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">variant</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;outline&apos; | &apos;filled&apos; | &apos;ghost&apos; | &apos;glass&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">입력 필드의 스타일 변형</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">입력 필드의 크기</td>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">rightIcon</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">ReactNode</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">오른쪽에 표시할 아이콘</td>
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
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </ComponentLayout>
  )
} 