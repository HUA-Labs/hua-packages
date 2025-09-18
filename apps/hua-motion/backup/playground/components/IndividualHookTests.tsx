'use client'

import { 
  useFadeIn, 
  useSlideUp, 
  useBounceIn, 
  useScaleIn, 
  useSlideLeft,
  useSlideRight,
  useScrollReveal, 
  usePulse,
  useGradient,
  useSpring
} from '@hua-labs/animation'

// 개별 훅 테스트 컴포넌트들
export function FadeInDemo() {
  const fadeIn = useFadeIn({ autoStart: false, duration: 1000 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={fadeIn.ref} 
        className="w-32 h-32 bg-blue-500 rounded flex items-center justify-center text-white text-sm transition-all duration-1000"
        style={{ 
          opacity: fadeIn.opacity, 
          transform: `translateY(${fadeIn.translateY}px)` 
        }}
      >
        Fade In
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => fadeIn.start()}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Start
        </button>
        <button 
          onClick={() => fadeIn.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function SlideUpDemo() {
  const slideUp = useSlideUp({ autoStart: false, duration: 800 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={slideUp.ref} 
        className="w-32 h-32 bg-green-500 rounded flex items-center justify-center text-white text-sm transition-all duration-800"
        style={{ 
          opacity: slideUp.opacity, 
          transform: `translateY(${slideUp.translateY}px)` 
        }}
      >
        Slide Up
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => slideUp.start()}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Start
        </button>
        <button 
          onClick={() => slideUp.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function SlideLeftDemo() {
  const slideLeft = useSlideLeft({ autoStart: false, duration: 800 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={slideLeft.ref} 
        className="w-32 h-32 bg-purple-500 rounded flex items-center justify-center text-white text-sm transition-all duration-800"
        style={{ 
          opacity: slideLeft.opacity, 
          transform: `translateX(${slideLeft.translateX}px)` 
        }}
      >
        Slide Left
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => slideLeft.start()}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
        >
          Start
        </button>
        <button 
          onClick={() => slideLeft.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function SlideRightDemo() {
  const slideRight = useSlideRight({ autoStart: false, duration: 800 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={slideRight.ref} 
        className="w-32 h-32 bg-pink-500 rounded flex items-center justify-center text-white text-sm transition-all duration-800"
        style={{ 
          opacity: slideRight.opacity, 
          transform: `translateX(${slideRight.translateX}px)` 
        }}
      >
        Slide Right
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => slideRight.start()}
          className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
        >
          Start
        </button>
        <button 
          onClick={() => slideRight.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function BounceInDemo() {
  const bounceIn = useBounceIn({ autoStart: false, duration: 1000 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={bounceIn.ref} 
        className="w-32 h-32 bg-yellow-500 rounded flex items-center justify-center text-white text-sm transition-all duration-1000"
        style={{ 
          opacity: bounceIn.opacity, 
          transform: `scale(${bounceIn.scale})` 
        }}
      >
        Bounce In
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => bounceIn.start()}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
        >
          Start
        </button>
        <button 
          onClick={() => bounceIn.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function ScaleInDemo() {
  const scaleIn = useScaleIn({ autoStart: false, duration: 800 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={scaleIn.ref} 
        className="w-32 h-32 bg-red-500 rounded flex items-center justify-center text-white text-sm transition-all duration-800"
        style={{ 
          opacity: scaleIn.opacity, 
          transform: `scale(${scaleIn.scale})` 
        }}
      >
        Scale In
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => scaleIn.start()}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Start
        </button>
        <button 
          onClick={() => scaleIn.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function SpringDemo() {
  const spring = useSpring({ autoStart: false, duration: 1200 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={spring.ref} 
        className="w-32 h-32 bg-indigo-500 rounded flex items-center justify-center text-white text-sm transition-all duration-1200"
        style={{ 
          opacity: spring.opacity, 
          transform: `translateY(${spring.translateY}px) scale(${spring.scale})` 
        }}
      >
        Spring
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => spring.start()}
          className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
        >
          Start
        </button>
        <button 
          onClick={() => spring.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function PulseDemo() {
  const pulse = usePulse({ autoStart: false, duration: 1000 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={pulse.ref} 
        className="w-32 h-32 bg-teal-500 rounded flex items-center justify-center text-white text-sm transition-all duration-1000"
        style={{ 
          opacity: pulse.opacity, 
          transform: `scale(${pulse.scale})` 
        }}
      >
        Pulse
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => pulse.start()}
          className="px-3 py-1 bg-teal-500 text-white rounded text-sm hover:bg-teal-600"
        >
          Start
        </button>
        <button 
          onClick={() => pulse.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function GradientDemo() {
  const gradient = useGradient({ autoStart: false, duration: 2000 })
  
  return (
    <div className="space-y-4">
      <div 
        ref={gradient.ref} 
        className="w-32 h-32 rounded flex items-center justify-center text-white text-sm transition-all duration-2000"
        style={{ 
          background: gradient.gradient,
          opacity: gradient.opacity
        }}
      >
        Gradient
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => gradient.start()}
          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-sm hover:from-purple-600 hover:to-pink-600"
        >
          Start
        </button>
        <button 
          onClick={() => gradient.reset()}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export function ScrollRevealDemo() {
  const scrollFadeIn = useScrollReveal({ 
    threshold: 0.5, 
    rootMargin: '-20% 0px',
    animationType: 'fadeIn'
  })
  const scrollSlideUp = useScrollReveal({ 
    threshold: 0.5, 
    rootMargin: '-20% 0px',
    animationType: 'slideUp'
  })
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scroll Reveal - Fade In</h3>
        <div 
          ref={scrollFadeIn.ref} 
          className="w-full h-32 bg-blue-500 rounded flex items-center justify-center text-white"
          style={scrollFadeIn.style}
        >
          Scroll to reveal - Fade In
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scroll Reveal - Slide Up</h3>
        <div 
          ref={scrollSlideUp.ref} 
          className="w-full h-32 bg-green-500 rounded flex items-center justify-center text-white"
          style={scrollSlideUp.style}
        >
          Scroll to reveal - Slide Up
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        💡 아래로 스크롤하면 애니메이션이 시작됩니다.
      </div>
    </div>
  )
} 