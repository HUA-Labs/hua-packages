"use client"

import React, { useState } from "react"
import { Form, FormField, FormGroup } from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'
import { Button } from '@hua-labs/hua-ux'
import { Input } from '@hua-labs/hua-ux'
import { Textarea } from '@hua-labs/hua-ux'
import { Select, SelectOption } from '@hua-labs/hua-ux'
import { Checkbox } from '@hua-labs/hua-ux'
import { Radio } from '@hua-labs/hua-ux'

export default function FormPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    category: "",
    agree: false,
    notification: "email"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("폼 데이터:", formData)
    alert("폼이 제출되었습니다!")
  }

  return (
    <ComponentLayout
      title="Form"
      description="폼 컴포넌트입니다. 다양한 입력 필드를 포함한 폼을 쉽게 구성할 수 있습니다."
      prevPage={{ title: "Label", href: "/components/label" }}
      nextPage={{ title: "Alert", href: "/components/alert" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Form" }
      ]}
    >
      {/* 기본 사용법 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 사용법
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Form onSubmit={handleSubmit}>
            <FormField>
              <label className="block text-sm font-medium mb-2">이름</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="이름을 입력하세요"
              />
            </FormField>
            
            <FormField>
              <label className="block text-sm font-medium mb-2">이메일</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="이메일을 입력하세요"
              />
            </FormField>
            
            <FormField>
              <label className="block text-sm font-medium mb-2">메시지</label>
              <Textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="메시지를 입력하세요"
              />
            </FormField>
            
            <Button type="submit">제출</Button>
          </Form>
        </div>
      </div>

      {/* 변형 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          변형
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">기본 폼</h3>
              <Form>
                <FormField>
                  <label className="block text-sm font-medium mb-2">이름</label>
                  <Input placeholder="이름" />
                </FormField>
                <FormField>
                  <label className="block text-sm font-medium mb-2">이메일</label>
                  <Input type="email" placeholder="이메일" />
                </FormField>
                <Button>제출</Button>
              </Form>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">글래스 폼</h3>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                <Form variant="glass">
                  <FormField>
                    <label className="block text-sm font-medium mb-2 text-white">이름</label>
                    <Input placeholder="이름" className="bg-white/20 border-white/30 text-white placeholder-white/60" />
                  </FormField>
                  <FormField>
                    <label className="block text-sm font-medium mb-2 text-white">이메일</label>
                    <Input type="email" placeholder="이메일" className="bg-white/20 border-white/30 text-white placeholder-white/60" />
                  </FormField>
                  <Button variant="glass">제출</Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FormField와 FormGroup */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          FormField와 FormGroup
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Form>
            <FormField error="이 필드는 필수입니다.">
              <label className="block text-sm font-medium mb-2">필수 필드 *</label>
              <Input placeholder="필수 입력" />
            </FormField>
            
            <FormGroup inline>
              <FormField>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <Select placeholder="카테고리 선택">
                  <SelectOption value="general">일반</SelectOption>
                  <SelectOption value="support">지원</SelectOption>
                  <SelectOption value="feedback">피드백</SelectOption>
                </Select>
              </FormField>
              
              <FormField>
                <label className="block text-sm font-medium mb-2">우선순위</label>
                <Select placeholder="우선순위 선택">
                  <SelectOption value="low">낮음</SelectOption>
                  <SelectOption value="medium">보통</SelectOption>
                  <SelectOption value="high">높음</SelectOption>
                </Select>
              </FormField>
            </FormGroup>
            
            <FormGroup>
              <FormField>
                <div className="flex items-center space-x-2">
                  <Checkbox id="agree" />
                  <label htmlFor="agree" className="text-sm">이용약관에 동의합니다</label>
                </div>
              </FormField>
              
              <FormField>
                <label className="block text-sm font-medium mb-2">알림 설정</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Radio name="notification" value="email" id="email" />
                    <label htmlFor="email" className="text-sm">이메일</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio name="notification" value="sms" id="sms" />
                    <label htmlFor="sms" className="text-sm">SMS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio name="notification" value="none" id="none" />
                    <label htmlFor="none" className="text-sm">알림 없음</label>
                  </div>
                </div>
              </FormField>
            </FormGroup>
            
            <Button>제출</Button>
          </Form>
        </div>
      </div>

      {/* Props 테이블 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Props
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                    Prop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">variant</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">&quot;default&quot; | &quot;glass&quot;</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">&quot;default&quot;</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">폼의 스타일 변형</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">onSubmit</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">(e: FormEvent) =&gt; void</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">폼 제출 시 호출되는 함수</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">error</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">string</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">FormField의 에러 메시지</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">required</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">boolean</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">false</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">FormField의 필수 여부</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">inline</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">boolean</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">false</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">FormGroup의 인라인 레이아웃 여부</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 