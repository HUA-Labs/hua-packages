'use client'

import React from 'react'
import Image from 'next/image'
import { Icon, Action, Panel } from '@hua-labs/ui'
import { useSmartMotion } from '@hua-labs/motion'

export default function HeroSection() {
  // 스마트 모션
  const heroRef = useSmartMotion({ 
    type: 'hero',
    entrance: 'fadeIn',
    delay: 0,
    threshold: 0
  })
  
  const titleRef = useSmartMotion({ 
    type: 'title',
    entrance: 'slideUp',
    delay: 200,
    threshold: 0
  })

  return (
    <Panel 
      ref={heroRef.ref}
      style="glass"
      rounded="none"
      padding="xl"
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-8 sm:p-16 lg:p-24 mb-16 sm:mb-24"
    >
              {/* 모션 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 text-center">
        {/* 로고 */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-white/20">
            <Image
              src="/images/favicon_wh.svg"
              alt="HUA Logo"
              width={64}
              height={64}
              className="w-10 h-10 sm:w-16 sm:h-16"
            />
          </div>
        </div>
        
        <h1 
          ref={titleRef.ref}
          style={titleRef.style}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 drop-shadow-2xl"
        >
          HUA Motion
        </h1>
        
        <p className="text-lg sm:text-2xl lg:text-3xl text-white/90 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
          React 모션 훅과 유틸리티로 아름다운 웹 경험을 만들어보세요
        </p>
        
        <p className="text-base sm:text-xl text-white/80 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
          3단계 추상화 시스템으로 간단한 사용법부터 고급 기능까지 모두 제공합니다
        </p>
        
        {/* CTA 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
          <Action 
            href="/showcase"
            variant="glass"
            size="md"
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:scale-105 transition-transform duration-300 relative overflow-hidden group px-6 py-4 sm:px-8 sm:py-5 w-full sm:w-auto text-center flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <div className="relative z-10 flex items-center justify-center">
              <Icon name="layers" size={20} className="mr-2" />
              3단계 쇼케이스
            </div>
          </Action>
          
          <Action 
            href="/test"
            variant="glass"
            size="md"
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:scale-105 transition-transform duration-300 relative overflow-hidden group px-6 py-4 sm:px-8 sm:py-5 w-full sm:w-auto text-center flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <div className="relative z-10 flex items-center justify-center">
              <Icon name="zap" size={20} className="mr-2" />
              테스트 랩
            </div>
          </Action>
          
          <Action 
            href="/playground"
            variant="glass"
            size="md"
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:scale-105 transition-transform duration-300 relative overflow-hidden group px-6 py-4 sm:px-8 sm:py-5 w-full sm:w-auto text-center flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <div className="relative z-10 flex items-center justify-center">
              <Icon name="settings" size={20} className="mr-2" />
              플레이그라운드
            </div>
          </Action>
        </div>
      </div>
    </Panel>
  )
} 