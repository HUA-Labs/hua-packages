'use client'

import React from 'react'
import { useState } from 'react'

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  React.useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* 히어로 섹션 */}
        <div 
          className={`text-center py-20 relative overflow-hidden rounded-3xl mb-20 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            animation: 'gradientShift 8s ease-in-out infinite'
          }}
        >
          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-12">
            <h1 
              className="text-5xl font-bold tracking-tight mb-6 text-white hover:scale-105 transition-transform duration-300"
            >
              아름다운 디자인 시스템
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              HUA Labs의 가볍고 스마트한 UI 컴포넌트 라이브러리. 
              Tailwind CSS와 Lucide React만으로 구축된 완벽한 디자인 시스템입니다.
            </p>
            <div className="flex gap-6 justify-center">
              <button className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg rounded-lg">
                📥 시작하기
              </button>
              <button className="px-8 py-4 border border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-lg rounded-lg">
                ⭐ GitHub
              </button>
            </div>
          </div>
        </div>

        {/* 특징 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">빠르고 가벼움</h3>
            <p className="text-slate-600 dark:text-slate-400">
              최적화된 번들 크기로 빠른 로딩과 부드러운 성능을 제공합니다.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              🎨
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">완벽한 커스터마이징</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Tailwind CSS 기반으로 모든 스타일을 쉽게 커스터마이징할 수 있습니다.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              ❤️
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">개발자 친화적</h3>
            <p className="text-slate-600 dark:text-slate-400">
              TypeScript 지원과 직관적인 API로 개발 경험을 향상시킵니다.
            </p>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-800 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            지금 시작해보세요
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            HUA UI와 함께 아름다운 웹 애플리케이션을 만들어보세요.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              ▶️ 컴포넌트 보기
            </button>
            <button className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              📖 문서 읽기
            </button>
          </div>
        </div>
      </div>


    </div>
  )
} 