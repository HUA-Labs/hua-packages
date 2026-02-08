"use client"

import React, { useState } from "react"
import { Modal, Button, Card, CardContent } from '@hua-labs/hua-ux'
import { Check } from '@phosphor-icons/react'

export default function ModalPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenLarge, setIsOpenLarge] = useState(false)
  const [isOpenNoBackdrop, setIsOpenNoBackdrop] = useState(false)
  const [isOpenNoClose, setIsOpenNoClose] = useState(false)
  const [isOpenCustom, setIsOpenCustom] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Modal 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          모달 다이얼로그 컴포넌트입니다. 
          사용자의 주의를 끌고 중요한 작업을 수행할 때 사용됩니다.
        </p>
      </div>

      {/* 기본 Modal */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Modal
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={() => setIsOpen(true)}>
            모달 열기
          </Button>
          
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="기본 모달"
          >
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                이것은 기본 모달입니다. 사용자에게 중요한 정보를 표시하거나 
                확인이 필요한 작업을 수행할 때 사용됩니다.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  취소
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  확인
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      {/* 크기별 Modal */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 Modal
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsOpenLarge(true)}>
              큰 모달 열기
            </Button>
          </div>
          
          <Modal
            isOpen={isOpenLarge}
            onClose={() => setIsOpenLarge(false)}
            size="xl"
            title="큰 모달"
          >
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                이것은 큰 크기의 모달입니다. 더 많은 콘텐츠를 표시할 수 있습니다.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">섹션 1</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    첫 번째 섹션의 내용입니다.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">섹션 2</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    두 번째 섹션의 내용입니다.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpenLarge(false)}>
                  취소
                </Button>
                <Button onClick={() => setIsOpenLarge(false)}>
                  확인
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      {/* 옵션별 Modal */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          옵션별 Modal
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                배경 없음
              </h3>
              <Button onClick={() => setIsOpenNoBackdrop(true)}>
                배경 없는 모달
              </Button>
              
              <Modal
                isOpen={isOpenNoBackdrop}
                onClose={() => setIsOpenNoBackdrop(false)}
                showBackdrop={false}
                title="배경 없는 모달"
              >
                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    이 모달은 배경 오버레이가 없습니다.
                  </p>
                  <div className="flex justify-end">
                    <Button onClick={() => setIsOpenNoBackdrop(false)}>
                      닫기
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                닫기 버튼 없음
              </h3>
              <Button onClick={() => setIsOpenNoClose(true)}>
                닫기 버튼 없는 모달
              </Button>
              
              <Modal
                isOpen={isOpenNoClose}
                onClose={() => setIsOpenNoClose(false)}
                closable={false}
                title="닫기 버튼 없는 모달"
              >
                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    이 모달은 닫기 버튼이 없습니다. ESC 키나 배경 클릭으로만 닫을 수 있습니다.
                  </p>
                  <div className="flex justify-end">
                    <Button onClick={() => setIsOpenNoClose(false)}>
                      닫기
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>

      {/* 커스텀 Modal */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          커스텀 Modal
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={() => setIsOpenCustom(true)}>
            커스텀 모달 열기
          </Button>
          
          <Modal
            isOpen={isOpenCustom}
            onClose={() => setIsOpenCustom(false)}
            size="lg"
            title="커스텀 모달"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">작업 완료!</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  요청하신 작업이 성공적으로 완료되었습니다.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">작업 세부사항</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• 파일 업로드 완료</li>
                  <li>• 데이터 처리 완료</li>
                  <li>• 결과 저장 완료</li>
                </ul>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={() => setIsOpenCustom(false)}>
                  확인
                </Button>
              </div>
            </div>
          </Modal>
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
                확인 다이얼로그
              </h3>
              <div className="space-y-4">
                <Button variant="destructive">
                  삭제하기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  중요한 작업을 수행하기 전에 사용자 확인을 받을 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                폼 입력
              </h3>
              <div className="space-y-4">
                <Button>
                  새 항목 추가
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  사용자로부터 정보를 입력받을 때 모달을 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                상세 정보
              </h3>
              <div className="space-y-4">
                <Button variant="outline">
                  상세 보기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  항목의 상세 정보를 모달로 표시합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                알림 메시지
              </h3>
              <div className="space-y-4">
                <Button variant="outline">
                  알림 보기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  중요한 알림이나 메시지를 모달로 표시합니다.
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
{`import { Modal, Button } from '@hua-labs/hua-ux'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        모달 열기
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="모달 제목"
      >
        <div className="p-6">
          <p>모달 내용</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// 크기 지정
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="lg"
  title="큰 모달"
>
  내용
</Modal>

// 옵션 설정
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  closable={false}
  closeOnOverlayClick={false}
  showBackdrop={false}
  centered={false}
  title="커스텀 모달"
>
  내용
</Modal>`}
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
                      <td className="p-2 font-mono text-sm">isOpen</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">모달 표시 여부 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">onClose</td>
                      <td className="p-2 font-mono text-sm">() =&gt; void</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">모달 닫기 함수 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">children</td>
                      <td className="p-2 font-mono text-sm">ReactNode</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">모달 내용 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">size</td>
                      <td className="p-2 font-mono text-sm">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos; | &apos;2xl&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;md&apos;</td>
                      <td className="p-2 text-sm">모달 크기</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">title</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">모달 제목</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">closable</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">닫기 버튼 표시 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">closeOnOverlayClick</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">배경 클릭으로 닫기 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">showBackdrop</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">배경 오버레이 표시 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">centered</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">화면 중앙 정렬 여부</td>
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