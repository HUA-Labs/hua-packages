'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Icon, Drawer, DrawerHeader, DrawerContent, Action, ThemeToggle } from '@hua-labs/ui'
import { useSmartMotion } from '@hua-labs/motion'

export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: '홈', icon: 'home' as const },
    { href: '/showcase', label: '쇼케이스', icon: 'layers' as const },
    { href: '/test', label: '테스트 랩', icon: 'zap' as const },
    { href: '/playground', label: '플레이그라운드', icon: 'settings' as const },
    { href: '/docs', label: '문서', icon: 'bookOpen' as const }
  ]

  // Header entrance motions - 더 자연스럽고 미묘하게 조정
  const headerMotion = useSmartMotion({ type: 'text', entrance: 'fadeIn', duration: 300 })
  const logoMotion = useSmartMotion({ type: 'image', entrance: 'fadeIn', delay: 50, duration: 400 })
  const brandMotion = useSmartMotion({ type: 'title', entrance: 'fadeIn', delay: 100, duration: 400 })
  const actionsMotion = useSmartMotion({ type: 'button', entrance: 'fadeIn', delay: 150, duration: 400 })

  return (
    <header ref={headerMotion.ref} style={headerMotion.style}
      className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/5">
      {/* 애니메이션 배경 효과 - 테마별 최적화 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-cyan-500/8 dark:from-blue-500/4 dark:via-purple-500/4 dark:to-cyan-500/4 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 relative">
        <div className="flex justify-between items-center h-16">
          
          {/* 로고 및 브랜드 */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div ref={logoMotion.ref} style={logoMotion.style} className="relative w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                <Image
                  src="/images/favicon_wh.svg"
                  alt="HUA Motion"
                  width={24}
                  height={24}
                  className="w-6 h-6 transition-transform duration-300 group-hover:scale-105"
                />
                {/* 글로우 효과 - 더 미묘하게 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span ref={brandMotion.ref} style={brandMotion.style} className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  HUA Motion
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                  React Motion SDK
                </span>
              </div>
            </Link>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  pathname === item.href
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 ring-2 ring-white/30 dark:ring-white/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {/* 호버 배경 효과 - 테마별 최적화 */}
                <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/12 group-hover:to-purple-600/12 dark:group-hover:from-blue-500/8 dark:group-hover:to-purple-600/8'
                }`} />
                
                <span className="relative flex items-center">
                  <Icon 
                    name={item.icon} 
                    size={16} 
                    className={`mr-2 ${
                      pathname === item.href
                        ? 'text-white dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                  <span className={
                    pathname === item.href
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }>
                    {item.label}
                  </span>
                </span>
                
                {/* 언더라인 효과 - 테마별 최적화 */}
                <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                  pathname === item.href
                    ? 'w-full bg-white dark:bg-white shadow-sm dark:shadow-gray-800/50'
                    : 'w-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>

          {/* 우측 버튼들 */}
          <div ref={actionsMotion.ref} style={actionsMotion.style} className="flex items-center space-x-2">
            {/* 테마 토글 버튼 */}
            <ThemeToggle 
              variant="icon" 
              size="sm" 
              className="border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            />

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/8 group-hover:to-purple-600/8 dark:group-hover:from-blue-500/10 dark:group-hover:to-purple-600/10 rounded-lg transition-all duration-300" />
                <span className="relative">
                  {isMobileMenuOpen ? (
                    <Icon name="close" size={24} />
                  ) : (
                    <Icon name="menu" size={24} />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 드로어 메뉴 */}
        <Drawer
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
          side="right"
          size="md"
          showBackdrop={true}
          closeOnBackdropClick={true}
          closeOnEscape={true}
        >
          <DrawerHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Icon name="zap" size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HUA Motion
                </span>
                <span className="text-xs text-gray-500">React Motion SDK</span>
              </div>
            </div>
          </DrawerHeader>
          
          <DrawerContent>
            <div className="space-y-2 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 group ${
                    pathname === item.href
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 border-l-4 border-white/80 dark:border-white'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    className={`mr-3 ${
                      pathname === item.href
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                  <span className={
                    pathname === item.href
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }>
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* 모바일에서 테마 토글 */}
              <div className="px-4 py-3">
                <ThemeToggle 
                  variant="button" 
                  size="sm" 
                  showLabel={true}
                  className="w-full justify-start"
                />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                애니메이션 SDK 데모
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                HUA Labs © 2025
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  )
} 