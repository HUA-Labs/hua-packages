'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      console.log('Scroll Progress:', {
        scrollTop,
        docHeight,
        progress: Math.round(progress)
      })
      
      setScrollProgress(progress)
    }

    // 초기 실행
    updateScrollProgress()

    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('resize', updateScrollProgress, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
    }
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 origin-left"
      style={{
        scaleX: scrollProgress / 100,
        transformOrigin: 'left',
      }}
      transition={{ duration: 0.1 }}
    />
  )
} 