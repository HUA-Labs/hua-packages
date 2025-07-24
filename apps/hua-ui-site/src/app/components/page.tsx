'use client'

import React from 'react'

export default function ComponentsPage() {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            UI 컴포넌트
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            다양한 UI 컴포넌트를 직접 체험해보세요
          </p>
        </div>

        {/* 기본 컴포넌트 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">기본 컴포넌트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🖱️ Button
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">다양한 스타일의 버튼 컴포넌트</p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">기본</button>
                  <button className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm">아웃라인</button>
                  <button className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-sm">고스트</button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  📝 Input
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">텍스트 입력 컴포넌트</p>
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="텍스트를 입력하세요" 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🔄 Switch
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">토글 컴포넌트</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                  </div>
                  <span className="text-sm">스위치: 꺼짐</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 피드백 컴포넌트 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">피드백 컴포넌트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  📊 Progress
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">진행 상태를 표시하는 컴포넌트</p>
              </div>
              <div className="space-y-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  ⚠️ Alert
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">다양한 유형의 알림 컴포넌트</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">정보</h4>
                    <p className="text-blue-700 dark:text-blue-300">이것은 정보 알림입니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  💀 Skeleton
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">로딩 상태를 표시하는 컴포넌트</p>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 