'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import LanguageToggle from './LanguageToggle'
import { useTranslation } from 'hua-i18n-sdk/easy'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const shouldBeScrolled = scrollTop > 50
      
      console.log('Header Scroll:', {
        scrollTop,
        shouldBeScrolled,
        isScrolled
      })
      
      setIsScrolled(shouldBeScrolled)
    }

    // 초기 실행
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // 다크모드 상태 확인
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    document.documentElement.classList.toggle('dark', newMode)
  }

  const navItems = [
    { href: '#about', label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#sdk', label: t('nav.sdk') },
    { href: '#contact', label: t('nav.contact') },
  ]

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/20' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/favicon_sum.svg"
                alt="HUA Labs"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HUA Labs
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 우측 버튼들 */}
            <div className="flex items-center space-x-4">
              {/* 언어 토글 */}
              <LanguageToggle />
              
              {/* 다크모드 토글 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-9 h-9 p-0"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* CTA 버튼 */}
              <Button className="hidden sm:inline-flex bg-purple-600 hover:bg-purple-700">
                시작하기
              </Button>

              {/* 모바일 메뉴 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden w-9 h-9 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/20"
            >
              <nav className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  시작하기
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
} 