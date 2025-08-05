"use client"

import React from "react"
import { Checkbox, Label, ComponentLayout } from "@hua-labs/ui"

export default function CheckboxPage() {
  return (
    <ComponentLayout
      title="Checkbox"
      description="체크박스 컴포넌트입니다. 다양한 스타일과 크기 옵션을 지원하며, 라벨과 설명도 포함할 수 있습니다."
      prevPage={{ title: "Select", href: "/components/select" }}
      nextPage={{ title: "Radio", href: "/components/radio" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Checkbox" }
      ]}
    >

        <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <Checkbox 
                  id="basic-checkbox"
                  label="기본 체크박스"
                />
                <Checkbox 
                  id="description-checkbox"
                  label="설명이 있는 체크박스"
                  description="이 체크박스는 추가 설명을 포함합니다."
                />
                <Checkbox 
                  id="checked-checkbox"
                  label="기본적으로 체크된 상태"
                  defaultChecked
                />
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Checkbox } from "@hua-labs/ui"

<Checkbox 
  id="basic-checkbox"
  label="기본 체크박스"
/>

<Checkbox 
  id="description-checkbox"
  label="설명이 있는 체크박스"
  description="이 체크박스는 추가 설명을 포함합니다."
/>

<Checkbox 
  id="checked-checkbox"
  label="기본적으로 체크된 상태"
  defaultChecked
/>`}</code>
              </pre>
            </div>
          </section>

          {/* Variants */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">변형</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <Checkbox 
                  id="default-variant"
                  label="기본 스타일"
                  variant="default"
                />
                <Checkbox 
                  id="outline-variant"
                  label="아웃라인 스타일"
                  variant="outline"
                />
                <Checkbox 
                  id="filled-variant"
                  label="채워진 스타일"
                  variant="filled"
                />
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                  <Checkbox 
                    id="glass-variant"
                    label="글래스 스타일"
                    variant="glass"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Checkbox 
  label="기본 스타일"
  variant="default"
/>

<Checkbox 
  label="아웃라인 스타일"
  variant="outline"
/>

<Checkbox 
  label="채워진 스타일"
  variant="filled"
/>

<Checkbox 
  label="글래스 스타일"
  variant="glass"
/>`}</code>
              </pre>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">크기</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <Checkbox 
                  id="small-size"
                  label="작은 크기 (sm)"
                  size="sm"
                />
                <Checkbox 
                  id="medium-size"
                  label="중간 크기 (md) - 기본값"
                  size="md"
                />
                <Checkbox 
                  id="large-size"
                  label="큰 크기 (lg)"
                  size="lg"
                />
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Checkbox 
  label="작은 크기"
  size="sm"
/>

<Checkbox 
  label="중간 크기 - 기본값"
  size="md"
/>

<Checkbox 
  label="큰 크기"
  size="lg"
/>`}</code>
              </pre>
            </div>
          </section>

          {/* States */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">상태</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <Checkbox 
                  id="error-state"
                  label="에러 상태"
                  error
                />
                <Checkbox 
                  id="success-state"
                  label="성공 상태"
                  success
                />
                <Checkbox 
                  id="disabled-state"
                  label="비활성화"
                  disabled
                />
                <Checkbox 
                  id="disabled-checked"
                  label="비활성화된 체크된 상태"
                  disabled
                  defaultChecked
                />
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Checkbox 
  label="에러 상태"
  error
/>

<Checkbox 
  label="성공 상태"
  success
/>

<Checkbox 
  label="비활성화"
  disabled
/>

<Checkbox 
  label="비활성화된 체크된 상태"
  disabled
  defaultChecked
/>`}</code>
              </pre>
            </div>
          </section>

          {/* Form Example */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">폼 예시</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">약관 동의</Label>
                  <div className="space-y-2">
                    <Checkbox 
                      id="terms"
                      label="이용약관에 동의합니다"
                      description="서비스 이용을 위해 필수로 동의해야 합니다."
                    />
                    <Checkbox 
                      id="privacy"
                      label="개인정보 처리방침에 동의합니다"
                      description="개인정보 수집 및 이용에 동의합니다."
                    />
                    <Checkbox 
                      id="marketing"
                      label="마케팅 정보 수신에 동의합니다"
                      description="선택사항입니다. 언제든지 철회할 수 있습니다."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Checkbox, Label } from "@hua-labs/ui"

<div>
  <Label className="text-lg font-semibold mb-3 block">약관 동의</Label>
  <div className="space-y-2">
    <Checkbox 
      id="terms"
      label="이용약관에 동의합니다"
      description="서비스 이용을 위해 필수로 동의해야 합니다."
    />
    <Checkbox 
      id="privacy"
      label="개인정보 처리방침에 동의합니다"
      description="개인정보 수집 및 이용에 동의합니다."
    />
    <Checkbox 
      id="marketing"
      label="마케팅 정보 수신에 동의합니다"
      description="선택사항입니다. 언제든지 철회할 수 있습니다."
    />
  </div>
</div>`}</code>
              </pre>
            </div>
          </section>

          {/* Controlled Example */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">제어된 상태 예시</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <Checkbox 
                  id="controlled-checkbox"
                  label="제어된 체크박스"
                  checked={true}
                  onChange={(e) => console.log('체크박스 상태:', e.target.checked)}
                />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  콘솔에서 상태 변화를 확인할 수 있습니다.
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { useState } from "react"
import { Checkbox } from "@hua-labs/ui"

const [isChecked, setIsChecked] = useState(false)

<Checkbox 
  id="controlled-checkbox"
  label="제어된 체크박스"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
/>`}</code>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;outline&apos; | &apos;filled&apos; | &apos;glass&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">체크박스의 스타일 변형</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">체크박스의 크기</td>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">label</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">체크박스 라벨 텍스트</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">description</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">체크박스 설명 텍스트</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">checked</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">체크박스 체크 상태</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">defaultChecked</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">초기 체크 상태</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">onChange</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">(event: ChangeEvent&lt;HTMLInputElement&gt;) =&gt; void</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">상태 변경 핸들러</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">disabled</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">비활성화 상태</td>
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