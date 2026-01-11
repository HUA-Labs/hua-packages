"use client"

import React from "react"
import { LoadingSpinner, Card, CardContent } from '@hua-labs/hua-ux'

export default function LoadingSpinnerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          LoadingSpinner 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          로딩 상태를 표시하는 스피너 컴포넌트입니다. 
          다양한 스타일과 크기를 지원하며, 사용자에게 작업 진행 상황을 알려줍니다.
        </p>
      </div>

      {/* 기본 LoadingSpinner */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 LoadingSpinner
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <LoadingSpinner variant="default" text="기본 스피너" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="dots" text="점 스피너" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="bars" text="바 스피너" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="ring" text="링 스피너" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="ripple" text="리플 스피너" />
            </div>
          </div>
        </div>
      </div>

      {/* 크기별 LoadingSpinner */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 LoadingSpinner
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <LoadingSpinner size="sm" text="작은 크기" />
            </div>
            <div className="text-center">
              <LoadingSpinner size="md" text="기본 크기" />
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" text="큰 크기" />
            </div>
            <div className="text-center">
              <LoadingSpinner size="xl" text="매우 큰 크기" />
            </div>
          </div>
        </div>
      </div>

      {/* 색상별 LoadingSpinner */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          색상별 LoadingSpinner
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <LoadingSpinner color="default" text="기본 색상" />
            </div>
            <div className="text-center">
              <LoadingSpinner color="primary" text="주요 색상" />
            </div>
            <div className="text-center">
              <LoadingSpinner color="success" text="성공 색상" />
            </div>
            <div className="text-center">
              <LoadingSpinner color="warning" text="경고 색상" />
            </div>
            <div className="text-center">
              <LoadingSpinner color="error" text="오류 색상" />
            </div>
            <div className="text-center">
              <LoadingSpinner color="glass" text="Glass 색상" />
            </div>
          </div>
        </div>
      </div>

      {/* 글래스모피즘 LoadingSpinner */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          글래스모피즘 LoadingSpinner
        </h2>
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl p-6 dark:from-blue-500/10 dark:to-purple-500/10 dark:border-slate-700/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            특별한 배경에서 사용할 때 예쁘게 보이는 글래스모피즘 스타일입니다.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <LoadingSpinner variant="default" color="glass" text="Glass 기본" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="dots" color="glass" text="Glass 점" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="ring" color="glass" text="Glass 링" />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="ripple" color="glass" text="Glass 리플" />
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
                페이지 로딩
              </h3>
              <div className="space-y-4">
                <LoadingSpinner 
                  variant="default" 
                  color="primary" 
                  text="페이지를 불러오는 중..." 
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  전체 페이지가 로드될 때 사용하는 큰 스피너입니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                버튼 로딩
              </h3>
              <div className="space-y-4">
                <LoadingSpinner 
                  size="sm" 
                  color="default" 
                  text="처리 중..." 
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  버튼 클릭 후 작업이 진행될 때 사용하는 작은 스피너입니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                데이터 로딩
              </h3>
              <div className="space-y-4">
                <LoadingSpinner 
                  variant="dots" 
                  color="success" 
                  text="데이터를 불러오는 중..." 
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  API 호출이나 데이터를 가져올 때 사용하는 스피너입니다.
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
                <LoadingSpinner 
                  variant="ring" 
                  color="warning" 
                  text="파일을 업로드하는 중..." 
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  파일 업로드나 다운로드 시 사용하는 스피너입니다.
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
{`import { LoadingSpinner } from '@hua-labs/hua-ux'

// 기본 스피너
<LoadingSpinner />

// 텍스트와 함께
<LoadingSpinner text="로딩 중..." />

// 크기 지정
<LoadingSpinner size="lg" text="큰 스피너" />

// 색상 지정
<LoadingSpinner color="primary" text="주요 색상" />

// 스타일 지정
<LoadingSpinner variant="dots" text="점 스피너" />`}
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
                      <td className="p-2 font-mono text-sm">variant</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos; | &apos;dots&apos; | &apos;bars&apos; | &apos;ring&apos; | &apos;ripple&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos;</td>
                      <td className="p-2 text-sm">스피너의 스타일 변형</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">size</td>
                      <td className="p-2 font-mono text-sm">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;md&apos;</td>
                      <td className="p-2 text-sm">스피너의 크기</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">color</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos; | &apos;primary&apos; | &apos;secondary&apos; | &apos;success&apos; | &apos;warning&apos; | &apos;error&apos; | &apos;glass&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos;</td>
                      <td className="p-2 text-sm">스피너의 색상</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">text</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">스피너 아래에 표시할 텍스트</td>
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