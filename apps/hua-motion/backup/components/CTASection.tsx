'use client'

import React from 'react'
import { Icon, Button, Panel } from '@hua-labs/ui'
import { useSmartAnimation, useFadeIn } from '@hua-labs/animation'

export default function CTASection() {
  // 로딩 애니메이션
  const ctaRef = useSmartAnimation({ 
    type: 'card',
    entrance: 'fadeIn',
    delay: 0,
    threshold: 0
  })
  
  const titleRef = useSmartAnimation({ 
    type: 'title',
    entrance: 'slideUp',
    delay: 200,
    threshold: 0
  })
  
  const buttonsRef = useSmartAnimation({ 
    type: 'button',
    entrance: 'scaleIn',
    delay: 400,
    threshold: 0
  })

  return (
    <div className="relative">
      {/* 다크모드에 어울리는 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-blue-50/30 to-indigo-100/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-800/50 rounded-3xl" />
      
      <Panel 
        ref={ctaRef.ref}
        style="glass" 
        padding="large" 
        className="text-center relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
        style={ctaRef.style}
      >
        <h2 
          ref={titleRef.ref}
          style={titleRef.style}
          className="text-4xl font-bold mb-8 text-gray-900 dark:text-white"
        >
          지금 시작해보세요
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          HUA Animation과 함께 아름다운 웹 애니메이션을 만들어보세요
        </p>
        <div 
          ref={buttonsRef.ref}
          style={buttonsRef.style}
          className="flex flex-wrap justify-center gap-6"
        >
          <Button 
            href="/test" 
            variant="gradient"
            gradient="blue"
            size="lg"
            hover="glow"
            className="py-4 px-8 min-h-[56px]"
          >
            <Icon name={"testTube" as any} size={20} className="mr-3" />
            테스트 랩
          </Button>
          
          <Button 
            href="/playground" 
            variant="gradient"
            gradient="green"
            size="lg"
            hover="glow"
            className="py-4 px-8 min-h-[56px]"
          >
            <Icon name={"code" as any} size={20} className="mr-3" />
            플레이그라운드
          </Button>
          
          <Button 
            href="/docs" 
            variant="gradient"
            gradient="purple"
            size="lg"
            hover="glow"
            className="py-4 px-8 min-h-[56px]"
          >
            <Icon name={"bookOpen" as any} size={20} className="mr-3" />
            문서
          </Button>
          
          <Button 
            href="/docs" 
            variant="gradient"
            gradient="orange"
            size="lg"
            hover="glow"
            className="py-4 px-8 min-h-[56px]"
          >
            <Icon name={"settings" as any} size={20} className="mr-3" />
            고급 기능
          </Button>
        </div>
      </Panel>
    </div>
  )
} 