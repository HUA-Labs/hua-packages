'use client'

import React from 'react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* 히어로 섹션 */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-6">
            HUA Animation
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            React 애니메이션 훅과 유틸리티로 아름다운 웹 경험을 만들어보세요
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              시작하기
            </button>
            <button className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              문서 보기
            </button>
          </div>
        </div>

        {/* 특징 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">성능 최적화</h3>
            <p className="text-slate-600 dark:text-slate-400">
              최적화된 애니메이션으로 부드러운 성능을 제공합니다.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              🎨
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">쉬운 사용법</h3>
            <p className="text-slate-600 dark:text-slate-400">
              직관적인 훅 API로 복잡한 애니메이션도 쉽게 구현할 수 있습니다.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              ❤️
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">TypeScript 지원</h3>
            <p className="text-slate-600 dark:text-slate-400">
              완전한 TypeScript 지원으로 타입 안전성을 보장합니다.
            </p>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-800 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            지금 시작해보세요
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            HUA Animation과 함께 아름다운 웹 애니메이션을 만들어보세요.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              데모 보기
            </button>
            <button className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              문서 읽기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 