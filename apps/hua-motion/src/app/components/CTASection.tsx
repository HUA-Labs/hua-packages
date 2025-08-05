'use client'

import React from 'react'
import { Icon, Action, Panel } from '@hua-labs/ui'
import { useSmartAnimation, useFadeIn } from '@hua-labs/motion'

export default function CTASection() {
  // 우아한 로딩 애니메이션
  const ctaRef = useSmartAnimation({ 
    type: 'card',
    entrance: 'fadeIn',
    delay: 300,
    threshold: 0.1,
    duration: 800
  })
  
  const titleRef = useSmartAnimation({ 
    type: 'title',
    entrance: 'slideUp',
    delay: 500,
    threshold: 0.1,
    duration: 600
  })
  
  const buttonsRef = useSmartAnimation({ 
    type: 'button',
    entrance: 'fadeIn',
    delay: 700,
    threshold: 0.1,
    duration: 500
  })

  return (
    <div className="relative">
      {/* 다크모드에 어울리는 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-blue-50/30 to-indigo-100/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-800/50 rounded-3xl" />
      
      <div 
        ref={ctaRef.ref}
        style={ctaRef.style}
      >
        <Panel 
          style="glass" 
          padding="xl" 
          className="text-center relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
        >
        <h2 
          ref={titleRef.ref}
          style={titleRef.style}
          className="text-4xl font-bold mb-8 text-gray-900 dark:text-white"
        >
          지금 시작해보세요
        </h2>
                 <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
           HUA Motion과 함께 아름다운 웹 모션을 만들어보세요
         </p>
        <div 
          ref={buttonsRef.ref}
          style={buttonsRef.style}
          className="flex flex-wrap justify-center gap-8"
        >
          <Action 
            href="/test" 
            variant="gradient"
            gradient="blue"
            size="md"
            hapticFeedback={true}
            glowIntensity={0.3}
            glowColor="blue"
            className="py-4 px-8 min-h-[56px] rounded-2xl transition-all duration-300"
          >
            <Icon name="zap" size={20} className="mr-3" />
            테스트 랩
          </Action>
          
          <Action 
            href="/playground" 
            variant="gradient"
            gradient="green"
            size="md"
            hover="glow"
            hapticFeedback={true}
            glowIntensity={0.3}
            glowColor="green"
            className="py-3 px-6 min-h-[48px] rounded-xl transition-all duration-300"
          >
            <Icon name="settings" size={20} className="mr-3" />
            플레이그라운드
          </Action>
          
          <Action 
            href="/docs" 
            variant="gradient"
            gradient="purple"
            size="md"
            hover="glow"
            hapticFeedback={true}
            glowIntensity={0.3}
            glowColor="purple"
            className="py-3 px-6 min-h-[48px] rounded-xl transition-all duration-300"
          >
            <Icon name="bookOpen" size={20} className="mr-3" />
            문서
          </Action>
          
          <Action 
            href="/docs" 
            variant="gradient"
            gradient="orange"
            size="lg"
            hover="glow"
            hapticFeedback={true}
            glowIntensity={0.3}
            glowColor="orange"
            className="py-4 px-8 min-h-[56px] rounded-2xl transition-all duration-300"
          >
            <Icon name="settings" size={20} className="mr-3" />
            고급 기능
          </Action>
        </div>
        </Panel>
      </div>
    </div>
  )
} 