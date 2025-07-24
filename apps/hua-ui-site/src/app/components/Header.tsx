'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const navigation = [
    { name: '홈', href: '/' },
    { name: '컴포넌트', href: '/components' },
    { name: '아이콘', href: '/icons' },
    { name: '문서', href: '/docs' },
    { name: '플레이그라운드', href: '/playground' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-slate-800/50 dark:bg-slate-900/80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HUA UI
                </h1>
              </div>
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              🌙
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 