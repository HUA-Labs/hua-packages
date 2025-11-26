'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronDown, Play, ArrowRight } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from '@hua-labs/i18n-sdk/easy'

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 디버깅용: 번역 데이터 확인
  useEffect(() => {
    console.log('🌐 HeroSection - Translation test:');
    console.log('  t("common.hero_title"):', t('common.hero_title'));
    console.log('  t("common.nav_about"):', t('common.nav_about'));
    console.log('  t("common.codeLines.innovation"):', t('common.codeLines.innovation'));
  }, [t])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 스크롤 자동 이동 로직 제거 - 사용자가 직접 스크롤할 수 있도록 함

  const scrollToNext = () => {
    const nextSection = document.getElementById('about')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 번역된 코드 라인 데이터 - SDK 활용
  const codeLines = useMemo(() => {
    const codeKeys = ['innovation', 'creativity', 'technology', 'future', 'development', 'solutions']
    const positions = [
      { left: "10%", top: "20%" }, { left: "25%", top: "35%" }, { left: "40%", top: "50%" },
      { left: "55%", top: "65%" }, { left: "70%", top: "80%" }, { left: "85%", top: "15%" },
      { left: "15%", top: "85%" }, { left: "30%", top: "70%" }, { left: "45%", top: "25%" },
      { left: "60%", top: "40%" }, { left: "75%", top: "55%" }, { left: "90%", top: "30%" },
      { left: "5%", top: "60%" }, { left: "20%", top: "45%" }, { left: "35%", top: "75%" },
      { left: "50%", top: "10%" }, { left: "65%", top: "90%" }, { left: "80%", top: "5%" },
      { left: "95%", top: "45%" }, { left: "8%", top: "75%" }
    ]

    return positions.map((pos, i) => ({
      text: t(`common.codeLines.${codeKeys[i % codeKeys.length]}`),
      left: pos.left,
      top: pos.top,
    }))
  }, [t])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 동적 배경 파티클 */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }}
        />
        
        {/* 코드 라인 애니메이션 */}
        <div className="absolute inset-0 overflow-hidden">
          {codeLines.map((line, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-400/10 text-xs font-mono whitespace-nowrap"
              style={{
                left: line.left,
                top: line.top,
              }}
              animate={{
                y: [0, -1000],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: isClient ? (Math.random() * 10 + 10) : 15,
                repeat: Infinity,
                delay: isClient ? (Math.random() * 5) : i * 0.5,
              }}
            >
              {line.text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* 로고/브랜드 */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              {t('common.hero_title')}
            </h1>
          </motion.div>

          {/* 슬로건 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-xl md:text-2xl text-slate-300 font-light mb-4">
              {t('common.hero_subtitle')}
            </h2>
            <h3 className="text-2xl md:text-3xl text-white font-medium">
              {t('common.hero_description')}
            </h3>
          </motion.div>

          {/* 설명 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t('common.hero_content')}
          </motion.p>

          {/* CTA 버튼들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium group"
            >
              {t('common.hero_startButton')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 text-lg font-medium"
            >
              <Play className="mr-2 h-5 w-5" />
              {t('common.hero_demoButton')}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.button
          onClick={scrollToNext}
          className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm mb-2">{t('common.hero_scrollText')}</span>
          <ChevronDown className="h-6 w-6" />
        </motion.button>
      </motion.div>

      {/* 커스텀 커서 효과 */}
      <div 
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 20,
          top: mousePosition.y - 20,
        }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-white"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </section>
  )
} 