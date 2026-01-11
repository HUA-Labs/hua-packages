"use client"

import React, { useState } from "react"
import { Switch } from '@hua-labs/hua-ux'
import { Label } from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'

export default function SwitchPage() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <ComponentLayout
      title="Switch"
      description="토글 스위치 컴포넌트입니다. 온/오프 상태를 전환할 수 있습니다."
      prevPage={{ title: "Radio", href: "/components/radio" }}
      nextPage={{ title: "Label", href: "/components/label" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Switch" }
      ]}
    >
      <div className="space-y-8">
        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">기본 사용법</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <Switch 
                id="basic-switch"
                label="기본 스위치"
              />
              <Switch 
                id="description-switch"
                label="설명이 있는 스위치"
                description="이 스위치는 추가 설명을 포함합니다."
              />
              <Switch 
                id="checked-switch"
                label="기본적으로 켜진 상태"
                defaultChecked
              />
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { Switch } from '@hua-labs/hua-ux'

<Switch 
  id="basic-switch"
  label="기본 스위치"
/>

<Switch 
  id="description-switch"
  label="설명이 있는 스위치"
  description="이 스위치는 추가 설명을 포함합니다."
/>

<Switch 
  id="checked-switch"
  label="기본적으로 켜진 상태"
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
              <Switch 
                id="default-variant"
                label="기본 스타일"
                variant="default"
              />
              <Switch 
                id="outline-variant"
                label="아웃라인 스타일"
                variant="outline"
              />
              <Switch 
                id="filled-variant"
                label="채워진 스타일"
                variant="filled"
              />
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
                <Switch 
                  id="glass-variant"
                  label="글래스 스타일"
                  variant="glass"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Switch 
  label="기본 스타일"
  variant="default"
/>

<Switch 
  label="아웃라인 스타일"
  variant="outline"
/>

<Switch 
  label="채워진 스타일"
  variant="filled"
/>

<Switch 
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
              <Switch 
                id="small-size"
                label="작은 크기 (sm)"
                size="sm"
              />
              <Switch 
                id="medium-size"
                label="중간 크기 (md) - 기본값"
                size="md"
              />
              <Switch 
                id="large-size"
                label="큰 크기 (lg)"
                size="lg"
              />
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Switch 
  label="작은 크기"
  size="sm"
/>

<Switch 
  label="중간 크기 - 기본값"
  size="md"
/>

<Switch 
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
              <Switch 
                id="error-state"
                label="에러 상태"
                error
              />
              <Switch 
                id="success-state"
                label="성공 상태"
                success
              />
              <Switch 
                id="disabled-state"
                label="비활성화"
                disabled
              />
              <Switch 
                id="disabled-checked"
                label="비활성화된 켜진 상태"
                disabled
                defaultChecked
              />
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Switch 
  label="에러 상태"
  error
/>

<Switch 
  label="성공 상태"
  success
/>

<Switch 
  label="비활성화"
  disabled
/>

<Switch 
  label="비활성화된 켜진 상태"
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
                <Label className="text-lg font-semibold mb-3 block">상태: {isEnabled ? '켜짐' : '꺼짐'}</Label>
                <Switch 
                  id="controlled-switch"
                  label="제어된 스위치"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                상태 변화를 실시간으로 확인할 수 있습니다.
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { useState } from "react"
import { Switch, Label } from '@hua-labs/hua-ux'

const [isEnabled, setIsEnabled] = useState(false)

<div>
  <Label className="text-lg font-semibold mb-3 block">
    상태: {isEnabled ? '켜짐' : '꺼짐'}
  </Label>
  <Switch 
    id="controlled-switch"
    label="제어된 스위치"
    checked={isEnabled}
    onChange={(e) => setIsEnabled(e.target.checked)}
  />
</div>`}</code>
            </pre>
          </div>
        </section>

        {/* Settings Example */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">설정 예시</h2>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold mb-3 block">앱 설정</Label>
                <div className="space-y-3">
                  <Switch 
                    id="notifications"
                    label="푸시 알림"
                    description="새로운 메시지나 업데이트에 대한 알림을 받습니다."
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <Switch 
                    id="dark-mode"
                    label="다크 모드"
                    description="어두운 테마로 앱을 사용합니다."
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <Switch 
                    id="auto-save"
                    label="자동 저장"
                    description="작업 내용을 자동으로 저장합니다."
                    defaultChecked
                  />
                  <Switch 
                    id="analytics"
                    label="분석 데이터 수집"
                    description="앱 사용 통계를 수집하여 서비스를 개선합니다."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              <code>{`import { useState } from "react"
import { Switch, Label } from '@hua-labs/hua-ux'

const [notifications, setNotifications] = useState(true)
const [darkMode, setDarkMode] = useState(false)

<div>
  <Label className="text-lg font-semibold mb-3 block">앱 설정</Label>
  <div className="space-y-3">
    <Switch 
      id="notifications"
      label="푸시 알림"
      description="새로운 메시지나 업데이트에 대한 알림을 받습니다."
      checked={notifications}
      onChange={(e) => setNotifications(e.target.checked)}
    />
    <Switch 
      id="dark-mode"
      label="다크 모드"
      description="어두운 테마로 앱을 사용합니다."
      checked={darkMode}
      onChange={(e) => setDarkMode(e.target.checked)}
    />
    <Switch 
      id="auto-save"
      label="자동 저장"
      description="작업 내용을 자동으로 저장합니다."
      defaultChecked
    />
    <Switch 
      id="analytics"
      label="분석 데이터 수집"
      description="앱 사용 통계를 수집하여 서비스를 개선합니다."
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
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스위치의 스타일 변형</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">size</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">&apos;md&apos;</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스위치의 크기</td>
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
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스위치 라벨 텍스트</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">description</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">string</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">-</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스위치 설명 텍스트</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">checked</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">스위치 켜짐 상태</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">defaultChecked</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">boolean</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">false</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">초기 켜짐 상태</td>
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