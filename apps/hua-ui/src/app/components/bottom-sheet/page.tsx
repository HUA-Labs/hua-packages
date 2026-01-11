"use client"

import React, { useState } from "react"
import { BottomSheet, Button, Card, CardContent, ComponentLayout } from '@hua-labs/hua-ux'
import { X, Gear } from '@phosphor-icons/react'

export default function BottomSheetPage() {
  const [open, setOpen] = useState(false)
  const [openSmall, setOpenSmall] = useState(false)
  const [openLarge, setOpenLarge] = useState(false)
  const [openCustom, setOpenCustom] = useState(false)

  return (
    <ComponentLayout
      title="BottomSheet"
      description="하단에서 올라오는 시트 컴포넌트입니다."
      prevPage={{ title: "Popover", href: "/components/popover" }}
      nextPage={{ title: "Scrollbar", href: "/components/scrollbar" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "BottomSheet" }
      ]}
    >
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          BottomSheet 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          바텀시트 컴포넌트입니다. 
          화면 하단에서 슬라이드되어 나타나는 패널을 제공하며, 드래그로 크기를 조절할 수 있습니다.
        </p>
      </div>

      {/* 기본 BottomSheet */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 BottomSheet
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={() => setOpen(true)}>
            바텀시트 열기
          </Button>
          
          <BottomSheet open={open} onOpenChange={setOpen}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">바텀시트 제목</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  이것은 기본 바텀시트입니다. 하단에서 슬라이드되어 나타나며, 
                  드래그 핸들을 통해 크기를 조절할 수 있습니다.
                </p>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 1</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      첫 번째 섹션의 내용입니다.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 2</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      두 번째 섹션의 내용입니다.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 3</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      세 번째 섹션의 내용입니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setOpen(false)}>
                    확인
                  </Button>
                </div>
              </div>
            </div>
          </BottomSheet>
        </div>
      </div>

      {/* 크기별 BottomSheet */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 BottomSheet
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setOpenSmall(true)}>
              작은 바텀시트
            </Button>
            <Button onClick={() => setOpenLarge(true)}>
              큰 바텀시트
            </Button>
          </div>
          
          <BottomSheet open={openSmall} onOpenChange={setOpenSmall} height="sm">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">작은 바텀시트</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenSmall(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-600 dark:text-slate-400">
                  이것은 작은 크기의 바텀시트입니다. 간단한 정보나 빠른 액션에 적합합니다.
                </p>
              </div>
            </div>
          </BottomSheet>

          <BottomSheet open={openLarge} onOpenChange={setOpenLarge} height="lg">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">큰 바텀시트</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenLarge(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  이것은 큰 크기의 바텀시트입니다. 더 많은 콘텐츠를 표시할 수 있습니다.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 1</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      첫 번째 섹션의 내용입니다.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 2</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      두 번째 섹션의 내용입니다.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 3</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      세 번째 섹션의 내용입니다.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">섹션 4</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      네 번째 섹션의 내용입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BottomSheet>
        </div>
      </div>

      {/* 커스텀 BottomSheet */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          커스텀 BottomSheet
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={() => setOpenCustom(true)}>
            커스텀 바텀시트 열기
          </Button>
          
          <BottomSheet 
            open={openCustom} 
            onOpenChange={setOpenCustom}
            height="md"
            snapPoints={[25, 50, 75, 100]}
            defaultSnap={50}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">커스텀 바텀시트</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenCustom(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gear className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">설정</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    다양한 설정 옵션을 확인하세요.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">알림 설정</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        푸시 알림을 받을지 선택하세요
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      설정
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">개인정보</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        개인정보 보호 설정을 관리하세요
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      설정
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">테마</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        다크모드 또는 라이트모드를 선택하세요
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      설정
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpenCustom(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setOpenCustom(false)}>
                    저장
                  </Button>
                </div>
              </div>
            </div>
          </BottomSheet>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          실제 사용 예시
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                모바일 메뉴
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  메뉴 열기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  모바일에서 네비게이션 메뉴를 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                필터 패널
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  필터 열기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  검색 필터나 정렬 옵션을 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                상품 상세
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  상세 보기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  상품의 상세 정보를 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                액션 시트
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  액션 열기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  공유, 삭제 등의 액션을 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 사용법 가이드 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          사용법 가이드
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                기본 사용법
              </h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { BottomSheet, Button } from '@hua-labs/hua-ux'
import { useState } from 'react'

function MyComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        바텀시트 열기
      </Button>
      
      <BottomSheet open={open} onOpenChange={setOpen}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">바텀시트 제목</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              ✕
            </Button>
          </div>
          <div className="flex-1 p-4">
            <p>바텀시트 내용</p>
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setOpen(false)}>
                확인
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

// 크기 지정
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  height="lg"
  snapPoints={[25, 50, 75, 100]}
  defaultSnap={50}
>
  내용
</BottomSheet>

// 옵션 설정
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  showBackdrop={false}
  closeOnBackdropClick={false}
  closeOnEscape={false}
  showDragHandle={false}
>
  내용
</BottomSheet>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Props
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-2 font-semibold">Prop</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Default</th>
                      <th className="text-left p-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">open</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">바텀시트 표시 여부 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">onOpenChange</td>
                      <td className="p-2 font-mono text-sm">(open: boolean) =&gt; void</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">바텀시트 상태 변경 시 호출되는 함수 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">children</td>
                      <td className="p-2 font-mono text-sm">ReactNode</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">바텀시트 내용 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">height</td>
                      <td className="p-2 font-mono text-sm">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos; | &apos;full&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;md&apos;</td>
                      <td className="p-2 text-sm">바텀시트 높이</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">showBackdrop</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">배경 오버레이 표시 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">closeOnBackdropClick</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">배경 클릭으로 닫기 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">closeOnEscape</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">ESC 키로 닫기 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">showDragHandle</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">드래그 핸들 표시 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">snapPoints</td>
                      <td className="p-2 font-mono text-sm">number[]</td>
                      <td className="p-2 font-mono text-sm">[25, 50, 75, 100]</td>
                      <td className="p-2 text-sm">스냅 포인트 (퍼센트)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">defaultSnap</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">50</td>
                      <td className="p-2 text-sm">기본 스냅 포인트 (퍼센트)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 