"use client"

import React, { useState } from "react"
import { Drawer, Button, Card, CardContent } from '@hua-labs/hua-ux'
import { X } from '@phosphor-icons/react'

export default function DrawerPage() {
  const [open, setOpen] = useState(false)
  const [openLeft, setOpenLeft] = useState(false)
  const [openTop, setOpenTop] = useState(false)
  const [openBottom, setOpenBottom] = useState(false)
  const [openLarge, setOpenLarge] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Drawer 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          드로어 컴포넌트입니다. 
          화면 가장자리에서 슬라이드되어 나타나는 패널을 제공합니다.
        </p>
      </div>

      {/* 기본 Drawer */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Drawer
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={() => setOpen(true)}>
            오른쪽 드로어 열기
          </Button>
          
          <Drawer open={open} onOpenChange={setOpen}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">드로어 제목</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  이것은 기본 드로어입니다. 오른쪽에서 슬라이드되어 나타납니다.
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
          </Drawer>
        </div>
      </div>

      {/* 방향별 Drawer */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          방향별 Drawer
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setOpenLeft(true)}>
              왼쪽 드로어
            </Button>
            <Button onClick={() => setOpenTop(true)}>
              위쪽 드로어
            </Button>
            <Button onClick={() => setOpenBottom(true)}>
              아래쪽 드로어
            </Button>
          </div>
          
          <Drawer open={openLeft} onOpenChange={setOpenLeft} side="left">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">왼쪽 드로어</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenLeft(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-600 dark:text-slate-400">
                  왼쪽에서 슬라이드되어 나타나는 드로어입니다.
                </p>
              </div>
            </div>
          </Drawer>

          <Drawer open={openTop} onOpenChange={setOpenTop} side="top">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">위쪽 드로어</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenTop(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-600 dark:text-slate-400">
                  위쪽에서 슬라이드되어 나타나는 드로어입니다.
                </p>
              </div>
            </div>
          </Drawer>

          <Drawer open={openBottom} onOpenChange={setOpenBottom} side="bottom">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">아래쪽 드로어</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenBottom(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-600 dark:text-slate-400">
                  아래쪽에서 슬라이드되어 나타나는 드로어입니다.
                </p>
              </div>
            </div>
          </Drawer>
        </div>
      </div>

      {/* 크기별 Drawer */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 Drawer
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={() => setOpenLarge(true)}>
            큰 드로어 열기
          </Button>
          
          <Drawer open={openLarge} onOpenChange={setOpenLarge} size="lg">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">큰 드로어</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenLarge(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  이것은 큰 크기의 드로어입니다. 더 많은 콘텐츠를 표시할 수 있습니다.
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
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpenLarge(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setOpenLarge(false)}>
                    확인
                  </Button>
                </div>
              </div>
            </div>
          </Drawer>
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
                사이드바 네비게이션
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  메뉴 열기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  모바일에서 사이드바 메뉴를 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                설정 패널
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  설정 열기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  사용자 설정이나 옵션을 표시할 때 사용합니다.
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
                알림 패널
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  알림 열기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  알림 목록이나 메시지를 표시할 때 사용합니다.
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
{`import { Drawer, Button } from '@hua-labs/hua-ux'
import { useState } from 'react'

function MyComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        드로어 열기
      </Button>
      
      <Drawer open={open} onOpenChange={setOpen}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">드로어 제목</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              ✕
            </Button>
          </div>
          <div className="flex-1 p-4">
            <p>드로어 내용</p>
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
      </Drawer>
    </>
  )
}

// 방향 지정
<Drawer
  open={open}
  onOpenChange={setOpen}
  side="left"
  size="lg"
>
  내용
</Drawer>

// 옵션 설정
<Drawer
  open={open}
  onOpenChange={setOpen}
  showBackdrop={false}
  closeOnBackdropClick={false}
  closeOnEscape={false}
>
  내용
</Drawer>`}
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
                      <td className="p-2 text-sm">드로어 표시 여부 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">onOpenChange</td>
                      <td className="p-2 font-mono text-sm">(open: boolean) =&gt; void</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">드로어 상태 변경 시 호출되는 함수 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">children</td>
                      <td className="p-2 font-mono text-sm">ReactNode</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">드로어 내용 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">side</td>
                      <td className="p-2 font-mono text-sm">&apos;left&apos; | &apos;right&apos; | &apos;top&apos; | &apos;bottom&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;right&apos;</td>
                      <td className="p-2 text-sm">드로어가 나타나는 방향</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">size</td>
                      <td className="p-2 font-mono text-sm">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos; | &apos;full&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;md&apos;</td>
                      <td className="p-2 text-sm">드로어 크기</td>
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 