'use client'

import React from 'react'
import { Icon, FeatureCard } from '@hua-labs/ui'
import { 
  useFadeIn, 
  useSlideUp, 
  useScaleIn, 
  usePulse 
} from '@hua-labs/animation'

export default function FeatureCards() {
  // 애니메이션 훅들
  const fadeIn1 = useFadeIn({ delay: 0.2, autoStart: true })
  const fadeIn2 = useFadeIn({ delay: 0.4, autoStart: true })
  const fadeIn3 = useFadeIn({ delay: 0.6, autoStart: true })
  
  const slideUp1 = useSlideUp({ delay: 0.3, autoStart: true })
  const slideUp2 = useSlideUp({ delay: 0.5, autoStart: true })
  const slideUp3 = useSlideUp({ delay: 0.7, autoStart: true })
  
  const scaleIn1 = useScaleIn({ delay: 0.4, autoStart: true })
  const scaleIn2 = useScaleIn({ delay: 0.6, autoStart: true })
  const scaleIn3 = useScaleIn({ delay: 0.8, autoStart: true })
  
  const pulse1 = usePulse({ autoStart: false })
  const pulse2 = usePulse({ autoStart: false })
  const pulse3 = usePulse({ autoStart: false })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
      {/* 카드 1 - 성능 최적화 */}
      <div 
        ref={fadeIn1.ref}
        style={{
          opacity: fadeIn1.opacity,
          transform: `translateY(${fadeIn1.translateY}px)`,
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
        }}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/20 to-purple-600/10 p-8 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2"
        onMouseEnter={() => pulse1.start()}
        onMouseLeave={() => pulse1.stop()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 text-center">
          <div 
            ref={scaleIn1.ref}
            style={{
              transform: `scale(${scaleIn1.scale})`,
              opacity: scaleIn1.opacity,
              transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
            }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-500"
          >
            <div 
              ref={pulse1.ref}
              style={{
                transform: pulse1.isAnimating ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              <Icon name={"zap" as any} size={32} className="text-white" />
            </div>
          </div>
          <h3 
            ref={slideUp1.ref}
            style={{
              opacity: slideUp1.opacity,
              transform: `translateY(${slideUp1.translateY}px)`,
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
            }}
            className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            성능 최적화
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            최적화된 애니메이션으로 부드러운 성능을 제공합니다. 
            React의 가상 DOM과 완벽하게 통합되어 있습니다.
          </p>
        </div>
      </div>
      
      {/* 카드 2 - 쉬운 사용법 */}
      <div 
        ref={fadeIn2.ref}
        style={{
          opacity: fadeIn2.opacity,
          transform: `translateY(${fadeIn2.translateY}px)`,
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
        }}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-600/20 to-teal-600/10 p-8 border border-green-200/50 dark:border-green-800/50 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:-translate-y-2"
        onMouseEnter={() => pulse2.start()}
        onMouseLeave={() => pulse2.stop()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 text-center">
          <div 
            ref={scaleIn2.ref}
            style={{
              transform: `scale(${scaleIn2.scale})`,
              opacity: scaleIn2.opacity,
              transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
            }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-500"
          >
            <div 
              ref={pulse2.ref}
              style={{
                transform: pulse2.isAnimating ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              <Icon name={"sparkles" as any} size={32} className="text-white" />
            </div>
          </div>
          <h3 
            ref={slideUp2.ref}
            style={{
              opacity: slideUp2.opacity,
              transform: `translateY(${slideUp2.translateY}px)`,
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
            }}
            className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            쉬운 사용법
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            직관적인 훅 API로 복잡한 애니메이션도 쉽게 구현할 수 있습니다. 
            3단계 추상화로 모든 수준의 개발자를 지원합니다.
          </p>
        </div>
      </div>
      
      {/* 카드 3 - TypeScript 지원 */}
      <div 
        ref={fadeIn3.ref}
        style={{
          opacity: fadeIn3.opacity,
          transform: `translateY(${fadeIn3.translateY}px)`,
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
        }}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-600/20 to-rose-600/10 p-8 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2"
        onMouseEnter={() => pulse3.start()}
        onMouseLeave={() => pulse3.stop()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 text-center">
          <div 
            ref={scaleIn3.ref}
            style={{
              transform: `scale(${scaleIn3.scale})`,
              opacity: scaleIn3.opacity,
              transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
            }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-500"
          >
            <div 
              ref={pulse3.ref}
              style={{
                transform: pulse3.isAnimating ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              <Icon name={"heart" as any} size={32} className="text-white" />
            </div>
          </div>
          <h3 
            ref={slideUp3.ref}
            style={{
              opacity: slideUp3.opacity,
              transform: `translateY(${slideUp3.translateY}px)`,
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
            }}
            className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            TypeScript 지원
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            완전한 TypeScript 지원으로 타입 안전성을 보장합니다. 
            자동완성과 타입 체크로 개발 경험을 향상시킵니다.
          </p>
        </div>
      </div>
    </div>
  )
} 