"use client"

import React, { useState } from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Card, CardContent } from "@hua-labs/ui"
import { ComponentLayout } from "@hua-labs/ui"

export default function AccordionPage() {
  const [singleValue, setSingleValue] = useState<string>("item-1")
  const [multipleValue, setMultipleValue] = useState<string[]>(["item-1"])

  return (
    <ComponentLayout
      title="Accordion"
      description="여러 패널을 펼치고 접을 수 있는 아코디언 컴포넌트입니다."
      prevPage={{ title: "Tabs", href: "/components/tabs" }}
      nextPage={{ title: "Menu", href: "/components/menu" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Accordion" }
      ]}
    >
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">기본 Accordion</h2>
          <Accordion type="single" value={singleValue} onValueChange={(value) => setSingleValue(value as string)}>
            <AccordionItem value="item-1">
              <AccordionTrigger>아코디언 제목 1</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  이것은 첫 번째 아코디언의 내용입니다. 여기에 다양한 콘텐츠를 포함할 수 있습니다.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>아코디언 제목 2</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  이것은 두 번째 아코디언의 내용입니다. 긴 텍스트나 복잡한 컴포넌트도 포함할 수 있습니다.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">추가 정보</h4>
                  <p className="text-sm text-gray-600">
                    아코디언 내부에 다른 컴포넌트들도 자유롭게 배치할 수 있습니다.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>아코디언 제목 3</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  이것은 세 번째 아코디언의 내용입니다.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">다중 선택 Accordion</h2>
          <Accordion type="multiple" value={multipleValue} onValueChange={(value) => setMultipleValue(value as string[])}>
            <AccordionItem value="item-1">
              <AccordionTrigger>다중 선택 1</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  다중 선택 모드에서는 여러 아코디언을 동시에 열 수 있습니다.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>다중 선택 2</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  각 아코디언을 독립적으로 열고 닫을 수 있습니다.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>다중 선택 3</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  모든 아코디언을 동시에 열어서 내용을 비교할 수 있습니다.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">접을 수 있는 Accordion</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>접을 수 있는 아코디언</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  collapsible 옵션이 활성화되면 열린 아코디언을 다시 클릭하여 닫을 수 있습니다.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>다른 아코디언</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  이 아코디언도 접을 수 있습니다.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">커스텀 아이콘</h2>
          <Accordion>
            <AccordionItem value="item-1">
              <AccordionTrigger icon="chevronDown" iconPosition="right">
                오른쪽 아이콘
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  아이콘을 오른쪽에 배치한 아코디언입니다.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger icon="plus" iconPosition="left">
                왼쪽 아이콘
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">
                  아이콘을 왼쪽에 배치한 아코디언입니다.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">실제 사용 예시</h2>
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">FAQ 섹션</h3>
              <Accordion type="single" collapsible>
                <AccordionItem value="faq-1">
                  <AccordionTrigger>서비스 이용 방법은 어떻게 되나요?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      서비스 이용을 위해서는 먼저 회원가입을 진행하신 후, 
                      원하는 기능을 선택하여 사용하시면 됩니다.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>결제 방법은 어떤 것이 있나요?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      신용카드, 계좌이체, 간편결제 등 다양한 결제 방법을 지원합니다.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>환불 정책은 어떻게 되나요?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      구매 후 7일 이내에 환불 신청이 가능하며, 
                      사용하지 않은 서비스에 대해서는 전액 환불됩니다.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">설정 메뉴</h3>
              <Accordion type="multiple">
                <AccordionItem value="settings-1">
                  <AccordionTrigger>계정 설정</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">이름</label>
                        <input type="text" className="w-full px-3 py-2 border rounded" placeholder="이름을 입력하세요" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">이메일</label>
                        <input type="email" className="w-full px-3 py-2 border rounded" placeholder="이메일을 입력하세요" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="settings-2">
                  <AccordionTrigger>알림 설정</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">이메일 알림</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">푸시 알림</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="settings-3">
                  <AccordionTrigger>보안 설정</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        비밀번호 변경
                      </button>
                      <button className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        2단계 인증 설정
                      </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Props</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Prop</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Default</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">children</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">ReactNode</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">-</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">AccordionItem 컴포넌트들</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">type</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">&quot;single&quot; | &quot;multiple&quot;</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">&quot;single&quot;</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">아코디언 타입 (단일/다중 선택)</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">value</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">string | string[]</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">-</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">현재 열린 아이템 (제어 모드)</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">defaultValue</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">string | string[]</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">-</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">초기 열린 아이템</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">onValueChange</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">(value: string | string[]) =&gt; void</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">-</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">값 변경 핸들러</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">collapsible</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">boolean</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">false</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">접을 수 있는지 여부</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">className</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">string</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">-</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">추가 CSS 클래스</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">사용 가이드</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">기본 사용법</h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@hua-labs/ui"

// 기본 아코디언
<Accordion>
  <AccordionItem value="item-1">
    <AccordionTrigger>제목</AccordionTrigger>
    <AccordionContent>
      <p>내용</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">다중 선택</h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// 다중 선택 아코디언
<Accordion type="multiple">
  <AccordionItem value="item-1">
    <AccordionTrigger>제목 1</AccordionTrigger>
    <AccordionContent>내용 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>제목 2</AccordionTrigger>
    <AccordionContent>내용 2</AccordionContent>
  </AccordionItem>
</Accordion>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">제어 모드</h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// 제어 모드 아코디언
const [value, setValue] = useState("item-1")

<Accordion 
  type="single" 
  value={value} 
  onValueChange={setValue}
  collapsible
>
  <AccordionItem value="item-1">
    <AccordionTrigger>제목</AccordionTrigger>
    <AccordionContent>내용</AccordionContent>
  </AccordionItem>
</Accordion>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">커스텀 아이콘</h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// 커스텀 아이콘
<AccordionItem value="item-1">
  <AccordionTrigger 
    icon="chevronDown" 
    iconPosition="right"
  >
    제목
  </AccordionTrigger>
  <AccordionContent>내용</AccordionContent>
</AccordionItem>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </ComponentLayout>
  )
} 