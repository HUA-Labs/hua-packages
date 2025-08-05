"use client"

import React from "react"
import { useToast, Button, Card, CardContent, Icon, ToastProvider } from "@hua-labs/ui"

function ToastContent() {
  const { addToast } = useToast()

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: '성공!', message: '작업이 성공적으로 완료되었습니다.' },
      error: { title: '오류 발생', message: '작업 중 오류가 발생했습니다.' },
      warning: { title: '주의', message: '이 작업은 되돌릴 수 없습니다.' },
      info: { title: '정보', message: '새로운 정보가 있습니다.' }
    }

    addToast({
      type,
      ...messages[type]
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Toast 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          화면 우상단에 나타나는 임시 알림 메시지입니다. 
          사용자에게 빠른 피드백을 제공할 때 사용합니다.
        </p>
      </div>

      {/* Toast 트리거 버튼들 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Toast 트리거
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => showToast('success')} variant="outline">
              성공 Toast
            </Button>
            <Button onClick={() => showToast('error')} variant="outline">
              오류 Toast
            </Button>
            <Button onClick={() => showToast('warning')} variant="outline">
              경고 Toast
            </Button>
            <Button onClick={() => showToast('info')} variant="outline">
              정보 Toast
            </Button>
          </div>
        </div>
      </div>

      {/* Toast 타입별 예시 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Toast 타입별 예시
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="check" className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">성공</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    작업이 성공적으로 완료되었습니다.
                  </p>
                </div>
                <button className="text-green-400 hover:text-green-600 dark:hover:text-green-300">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 text-center">✕</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">오류 발생</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    작업 중 오류가 발생했습니다.
                  </p>
                </div>
                <button className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="warning" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">주의</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
                <button className="text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">정보</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    새로운 정보가 있습니다.
                  </p>
                </div>
                <button className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
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
                폼 제출
              </h3>
              <div className="space-y-4">
                <Button onClick={() => showToast('success')}>
                  폼 제출하기
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  폼 제출 성공 시 성공 메시지를 표시합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                파일 업로드
              </h3>
              <div className="space-y-4">
                <Button onClick={() => showToast('info')}>
                  파일 업로드
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  파일 업로드 진행 상황을 알립니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                삭제 확인
              </h3>
              <div className="space-y-4">
                <Button onClick={() => showToast('warning')} variant="destructive">
                  항목 삭제
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  삭제 작업 전 경고 메시지를 표시합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                네트워크 오류
              </h3>
              <div className="space-y-4">
                <Button onClick={() => showToast('error')} variant="destructive">
                  오류 시뮬레이션
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  네트워크 오류나 기타 오류를 알립니다.
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
{`import { useToast, ToastProvider } from '@hua-labs/ui'

function MyComponent() {
  const { addToast } = useToast()
  
  const showSuccessToast = () => {
    addToast({
      type: 'success',
      title: '성공!',
      message: '작업이 완료되었습니다.'
    })
  }
  
  return (
    <button onClick={showSuccessToast}>
      성공 토스트 보여주기
    </button>
  )
}

// 앱에서 ToastProvider로 감싸기
function App() {
  return (
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  )
}`}
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
                      <td className="p-2 font-mono text-sm">type</td>
                      <td className="p-2 font-mono text-sm">&apos;success&apos; | &apos;error&apos; | &apos;warning&apos; | &apos;info&apos;</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">토스트 타입 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">title</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">토스트 제목</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">message</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">토스트 메시지 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">duration</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">5000</td>
                      <td className="p-2 text-sm">토스트 표시 시간 (ms)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">action</td>
                      <td className="p-2 font-mono text-sm">{`{ label: string, onClick: () => void }`}</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">액션 버튼</td>
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

export default function ToastPage() {
  return (
    <ToastProvider>
      <ToastContent />
    </ToastProvider>
  )
} 