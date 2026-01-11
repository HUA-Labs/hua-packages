"use client"

import React, { useState } from "react"
import { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo, ComponentLayout } from '@hua-labs/hua-ux'
import { Button } from '@hua-labs/hua-ux'

export default function AlertPage() {
  const [showClosable, setShowClosable] = useState(true)

  return (
    <ComponentLayout
      title="Alert"
      description="사용자에게 중요한 정보나 상태를 알리는 알림 컴포넌트입니다."
      prevPage={{ title: "Form", href: "/components/form" }}
      nextPage={{ title: "Badge", href: "/components/badge" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Alert" }
      ]}
    >

      {/* 기본 사용법 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 사용법
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <Alert>
              이것은 기본 알림입니다. 중요한 정보를 사용자에게 전달합니다.
            </Alert>
            
            <Alert title="알림 제목">
              제목과 설명이 있는 알림입니다.
            </Alert>
            
            <Alert 
              title="상세한 알림"
              description="이것은 더 자세한 설명을 포함한 알림입니다. 사용자에게 중요한 정보를 명확하게 전달합니다."
            />
          </div>
        </div>
      </div>

      {/* 변형 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          변형
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <Alert variant="success" title="성공">
              작업이 성공적으로 완료되었습니다.
            </Alert>
            
            <Alert variant="warning" title="경고">
              이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
            </Alert>
            
            <Alert variant="error" title="오류">
              작업 중 오류가 발생했습니다. 다시 시도해주세요.
            </Alert>
            
            <Alert variant="info" title="정보">
              새로운 기능이 추가되었습니다. 확인해보세요.
            </Alert>
          </div>
        </div>
      </div>

      {/* 편의 컴포넌트 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          편의 컴포넌트
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <AlertSuccess title="성공">
              편의 컴포넌트를 사용한 성공 알림입니다.
            </AlertSuccess>
            
            <AlertWarning title="경고">
              편의 컴포넌트를 사용한 경고 알림입니다.
            </AlertWarning>
            
            <AlertError title="오류">
              편의 컴포넌트를 사용한 오류 알림입니다.
            </AlertError>
            
            <AlertInfo title="정보">
              편의 컴포넌트를 사용한 정보 알림입니다.
            </AlertInfo>
          </div>
        </div>
      </div>

      {/* 액션과 닫기 버튼 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          액션과 닫기 버튼
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <Alert 
              title="업데이트 가능"
              description="새로운 버전이 사용 가능합니다."
              action={<Button size="sm">업데이트</Button>}
            />
            
            {showClosable && (
              <Alert 
                variant="info"
                title="닫을 수 있는 알림"
                description="이 알림은 닫기 버튼이 있습니다."
                closable
                onClose={() => setShowClosable(false)}
              />
            )}
            
            <Alert 
              variant="warning"
              title="복잡한 액션"
              description="여러 액션을 포함할 수 있습니다."
              action={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">취소</Button>
                  <Button size="sm">확인</Button>
                </div>
              }
              closable
            />
          </div>
        </div>
      </div>

      {/* 커스텀 아이콘 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          커스텀 아이콘
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <Alert 
              title="커스텀 아이콘"
              description="사용자 정의 아이콘을 사용할 수 있습니다."
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            
            <Alert 
              variant="success"
              title="별 모양 아이콘"
              description="다양한 아이콘을 사용할 수 있습니다."
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
            />
          </div>
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
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">&quot;default&quot; | &quot;success&quot; | &quot;warning&quot; | &quot;error&quot; | &quot;info&quot;</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">&quot;default&quot;</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">알림의 스타일 변형</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">title</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">string</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">알림의 제목</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">description</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">string</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">알림의 설명</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">icon</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">ReactNode</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">커스텀 아이콘</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">action</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">ReactNode</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">액션 버튼</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">closable</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">boolean</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">false</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">닫기 버튼 표시 여부</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">onClose</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">() =&gt; void</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">-</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">닫기 버튼 클릭 시 호출되는 함수</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 