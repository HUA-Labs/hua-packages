"use client"

import React, { useState } from "react"
import { Radio } from '@hua-labs/hua-ux'
import { Label } from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'

export default function RadioPage() {
  const [selectedOption, setSelectedOption] = useState("option1")
  const [selectedSize, setSelectedSize] = useState("medium")
  const [selectedVariant, setSelectedVariant] = useState("default")

  return (
    <ComponentLayout
      title="Radio"
      description="라디오 버튼 컴포넌트입니다. 단일 선택을 위한 컴포넌트로, 다양한 스타일과 크기 옵션을 지원합니다."
      prevPage={{ title: "Checkbox", href: "/components/checkbox" }}
      nextPage={{ title: "Switch", href: "/components/switch" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Radio" }
      ]}
    >
      <div className="space-y-8">
          {/* Basic Usage */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">기본 라디오 그룹</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="option1"
                      name="basic-group"
                      value="option1"
                      label="옵션 1"
                    />
                    <Radio 
                      id="option2"
                      name="basic-group"
                      value="option2"
                      label="옵션 2"
                    />
                    <Radio 
                      id="option3"
                      name="basic-group"
                      value="option3"
                      label="옵션 3"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-lg font-semibold mb-3 block">설명이 있는 라디오</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="desc1"
                      name="desc-group"
                      value="desc1"
                      label="프리미엄 플랜"
                      description="모든 기능을 포함한 최고급 플랜입니다."
                    />
                    <Radio 
                      id="desc2"
                      name="desc-group"
                      value="desc2"
                      label="기본 플랜"
                      description="필수 기능만 포함한 기본 플랜입니다."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
                <code>{`import { Radio, Label } from '@hua-labs/hua-ux'

<div>
  <Label className="text-lg font-semibold mb-3 block">기본 라디오 그룹</Label>
  <div className="space-y-2">
    <Radio 
      id="option1"
      name="basic-group"
      value="option1"
      label="옵션 1"
    />
    <Radio 
      id="option2"
      name="basic-group"
      value="option2"
      label="옵션 2"
    />
    <Radio 
      id="option3"
      name="basic-group"
      value="option3"
      label="옵션 3"
    />
  </div>
</div>

<div>
  <Label className="text-lg font-semibold mb-3 block">설명이 있는 라디오</Label>
  <div className="space-y-2">
    <Radio 
      id="desc1"
      name="desc-group"
      value="desc1"
      label="프리미엄 플랜"
      description="모든 기능을 포함한 최고급 플랜입니다."
    />
    <Radio 
      id="desc2"
      name="desc-group"
      value="desc2"
      label="기본 플랜"
      description="필수 기능만 포함한 기본 플랜입니다."
    />
  </div>
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
                  <Label className="text-lg font-semibold mb-3 block">스타일 변형</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="default-variant"
                      name="variant-group"
                      value="default"
                      label="기본 스타일"
                      variant="default"
                    />
                    <Radio 
                      id="outline-variant"
                      name="variant-group"
                      value="outline"
                      label="아웃라인 스타일"
                      variant="outline"
                    />
                    <Radio 
                      id="filled-variant"
                      name="variant-group"
                      value="filled"
                      label="채워진 스타일"
                      variant="filled"
                    />
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                      <Radio 
                        id="glass-variant"
                        name="variant-group"
                        value="glass"
                        label="글래스 스타일"
                        variant="glass"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Radio 
  name="variant-group"
  value="default"
  label="기본 스타일"
  variant="default"
/>

<Radio 
  name="variant-group"
  value="outline"
  label="아웃라인 스타일"
  variant="outline"
/>

<Radio 
  name="variant-group"
  value="filled"
  label="채워진 스타일"
  variant="filled"
/>

<Radio 
  name="variant-group"
  value="glass"
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
                <div>
                  <Label className="text-lg font-semibold mb-3 block">크기 옵션</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="small-size"
                      name="size-group"
                      value="small"
                      label="작은 크기 (sm)"
                      size="sm"
                    />
                    <Radio 
                      id="medium-size"
                      name="size-group"
                      value="medium"
                      label="중간 크기 (md) - 기본값"
                      size="md"
                    />
                    <Radio 
                      id="large-size"
                      name="size-group"
                      value="large"
                      label="큰 크기 (lg)"
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Radio 
  name="size-group"
  value="small"
  label="작은 크기"
  size="sm"
/>

<Radio 
  name="size-group"
  value="medium"
  label="중간 크기 - 기본값"
  size="md"
/>

<Radio 
  name="size-group"
  value="large"
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
                <div>
                  <Label className="text-lg font-semibold mb-3 block">상태 예시</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="error-state"
                      name="state-group"
                      value="error"
                      label="에러 상태"
                      error
                    />
                    <Radio 
                      id="success-state"
                      name="state-group"
                      value="success"
                      label="성공 상태"
                      success
                    />
                    <Radio 
                      id="disabled-state"
                      name="state-group"
                      value="disabled"
                      label="비활성화"
                      disabled
                    />
                    <Radio 
                      id="disabled-checked"
                      name="state-group"
                      value="disabled-checked"
                      label="비활성화된 선택된 상태"
                      disabled
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`<Radio 
  name="state-group"
  value="error"
  label="에러 상태"
  error
/>

<Radio 
  name="state-group"
  value="success"
  label="성공 상태"
  success
/>

<Radio 
  name="state-group"
  value="disabled"
  label="비활성화"
  disabled
/>

<Radio 
  name="state-group"
  value="disabled-checked"
  label="비활성화된 선택된 상태"
  disabled
  defaultChecked
/>`}</code>
              </pre>
            </div>
          </section>

          {/* Controlled Example */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">제어된 상태 예시</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">선택된 옵션: {selectedOption}</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="controlled1"
                      name="controlled-group"
                      value="option1"
                      label="옵션 1"
                      checked={selectedOption === "option1"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <Radio 
                      id="controlled2"
                      name="controlled-group"
                      value="option2"
                      label="옵션 2"
                      checked={selectedOption === "option2"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <Radio 
                      id="controlled3"
                      name="controlled-group"
                      value="option3"
                      label="옵션 3"
                      checked={selectedOption === "option3"}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { useState } from "react"
import { Radio, Label } from '@hua-labs/hua-ux'

const [selectedOption, setSelectedOption] = useState("option1")

<div>
  <Label className="text-lg font-semibold mb-3 block">
    선택된 옵션: {selectedOption}
  </Label>
  <div className="space-y-2">
    <Radio 
      name="controlled-group"
      value="option1"
      label="옵션 1"
      checked={selectedOption === "option1"}
      onChange={(e) => setSelectedOption(e.target.value)}
    />
    <Radio 
      name="controlled-group"
      value="option2"
      label="옵션 2"
      checked={selectedOption === "option2"}
      onChange={(e) => setSelectedOption(e.target.value)}
    />
    <Radio 
      name="controlled-group"
      value="option3"
      label="옵션 3"
      checked={selectedOption === "option3"}
      onChange={(e) => setSelectedOption(e.target.value)}
    />
  </div>
</div>`}</code>
              </pre>
            </div>
          </section>

          {/* Form Example */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">폼 예시</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">배송 방법 선택</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="standard"
                      name="shipping"
                      value="standard"
                      label="일반 배송"
                      description="3-5일 소요, 무료"
                    />
                    <Radio 
                      id="express"
                      name="shipping"
                      value="express"
                      label="빠른 배송"
                      description="1-2일 소요, 5,000원"
                    />
                    <Radio 
                      id="overnight"
                      name="shipping"
                      value="overnight"
                      label="당일 배송"
                      description="당일 도착, 15,000원"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-lg font-semibold mb-3 block">결제 방법 선택</Label>
                  <div className="space-y-2">
                    <Radio 
                      id="card"
                      name="payment"
                      value="card"
                      label="신용카드"
                      description="Visa, MasterCard, American Express"
                    />
                    <Radio 
                      id="bank"
                      name="payment"
                      value="bank"
                      label="계좌이체"
                      description="실시간 계좌이체"
                    />
                    <Radio 
                      id="mobile"
                      name="payment"
                      value="mobile"
                      label="모바일 결제"
                      description="카카오페이, 네이버페이, 페이코"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Radio, Label } from '@hua-labs/hua-ux'

<div>
  <Label className="text-lg font-semibold mb-3 block">배송 방법 선택</Label>
  <div className="space-y-2">
    <Radio 
      id="standard"
      name="shipping"
      value="standard"
      label="일반 배송"
      description="3-5일 소요, 무료"
    />
    <Radio 
      id="express"
      name="shipping"
      value="express"
      label="빠른 배송"
      description="1-2일 소요, 5,000원"
    />
    <Radio 
      id="overnight"
      name="shipping"
      value="overnight"
      label="당일 배송"
      description="당일 도착, 15,000원"
    />
  </div>
</div>

<div>
  <Label className="text-lg font-semibold mb-3 block">결제 방법 선택</Label>
  <div className="space-y-2">
    <Radio 
      id="card"
      name="payment"
      value="card"
      label="신용카드"
      description="Visa, MasterCard, American Express"
    />
    <Radio 
      id="bank"
      name="payment"
      value="bank"
      label="계좌이체"
      description="실시간 계좌이체"
    />
    <Radio 
      id="mobile"
      name="payment"
      value="mobile"
      label="모바일 결제"
      description="카카오페이, 네이버페이, 페이코"
    />
  </div>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos; | &apos;outline&apos; | &apos;filled&apos; | &apos;glass&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;default&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 버튼의 스타일 변형</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 버튼의 크기</td>
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
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 버튼 라벨 텍스트</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">description</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 버튼 설명 텍스트</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">name</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 그룹 이름 (필수)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">value</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 버튼 값</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">checked</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">라디오 버튼 선택 상태</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">defaultChecked</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">초기 선택 상태</td>
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