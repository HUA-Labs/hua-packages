import { useMemo } from 'react'
import { usePageAnimations, AnimationRef } from './usePageAnimations'

// 페이지별 애니메이션 설정
const PAGE_ANIMATIONS = {
  // 홈페이지
  home: {
    hero: { type: 'hero' as const },
    title: { type: 'title' as const },
    description: { type: 'text' as const },
    cta: { type: 'button' as const },
    feature1: { type: 'card' as const },
    feature2: { type: 'card' as const },
    feature3: { type: 'card' as const }
  },
  
  // 대시보드
  dashboard: {
    header: { type: 'hero' as const },
    sidebar: { type: 'card' as const, entrance: 'slideLeft' as const },
    main: { type: 'text' as const, entrance: 'fadeIn' as const },
    card1: { type: 'card' as const },
    card2: { type: 'card' as const },
    card3: { type: 'card' as const },
    chart: { type: 'image' as const }
  },
  
  // 제품 페이지
  product: {
    hero: { type: 'hero' as const },
    title: { type: 'title' as const },
    image: { type: 'image' as const },
    description: { type: 'text' as const },
    price: { type: 'text' as const },
    buyButton: { type: 'button' as const },
    features: { type: 'card' as const }
  },
  
  // 블로그
  blog: {
    header: { type: 'hero' as const },
    title: { type: 'title' as const },
    content: { type: 'text' as const },
    sidebar: { type: 'card' as const, entrance: 'slideRight' as const },
    related1: { type: 'card' as const },
    related2: { type: 'card' as const },
    related3: { type: 'card' as const }
  }
} as const

type PageType = keyof typeof PAGE_ANIMATIONS

export function useSimplePageAnimation(pageType: PageType): Record<string, AnimationRef> {
  const config = useMemo(() => PAGE_ANIMATIONS[pageType], [pageType])
  return usePageAnimations(config)
}

// 커스텀 설정도 가능
export function useCustomPageAnimation(config: Record<string, any>): Record<string, AnimationRef> {
  return usePageAnimations(config)
} 