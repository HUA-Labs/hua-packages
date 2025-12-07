'use client'

import React from 'react'
import { Icon, Button } from '@hua-labs/ui'
import { useSmartAnimation } from '@hua-labs/animation'

export default function HeroSection() {
  // 스마트 애니메이션 - 초기 상태를 visible로 설정
  const heroRef = useSmartAnimation({ 
    type: 'hero',
    entrance: 'fadeIn',
    delay: 0, // 즉시 시작
    threshold: 0 // 뷰포트에 들어오자마자 트리거
  })
  
  const titleRef = useSmartAnimation({ 
    type: 'title',
    entrance: 'slideUp',
    delay: 200,
    threshold: 0
  })

  return (
    <div 
      ref={heroRef.ref}
      style={heroRef.style}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-16 sm:p-24 mb-24"
    >
      {/* 애니메이션 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-white/6 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="relative z-10 text-center">
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl shadow-white/20">
            <img 
              src="/images/favicon_wh.svg" 
              alt="HUA Logo" 
              className="w-16 h-16"
            />
          </div>
        </div>
        
        <h1 
          ref={titleRef.ref}
          style={titleRef.style}
          className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-8 drop-shadow-2xl"
        >
          HUA Animation
        </h1>
        <p className="text-2xl sm:text-3xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
          React 애니메이션 훅과 유틸리티로 아름다운 웹 경험을 만들어보세요
        </p>
        <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
          3단계 추상화 시스템으로 간단한 사용법부터 고급 기능까지 모두 제공합니다
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            href="/demos"
            variant="glass"
            size="lg"
            hover="glow"
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center">
              <Icon name={"layers" as any} size={24} className="mr-3" />
              3단계 데모
            </span>
          </Button>
          
          <Button 
            href="/test"
            variant="glass"
            size="lg"
            hover="glow"
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center">
              <Icon name={"zap" as any} size={24} className="mr-3" />
              테스트 랩
            </span>
          </Button>
          
          <Button 
            href="/playground"
            variant="outline"
            size="lg"
            hover="scale"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <span className="flex items-center">
              <Icon name={"settings" as any} size={24} className="mr-3" />
              플레이그라운드
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
} 