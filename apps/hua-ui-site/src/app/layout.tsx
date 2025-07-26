import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import { ThemeProvider, ScrollToTop } from '@hua-labs/ui'
import Header from './components/Header'
import Footer from './components/Footer'
import { HydrationProvider } from './components/HydrationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HUA UI - 아름다운 디자인 시스템',
  description: 'HUA Labs의 가볍고 스마트한 UI 컴포넌트 라이브러리',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 하이드레이션 문제 방지를 위한 메타 태그 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationProvider>
          <ThemeProvider 
            defaultTheme="system" 
            storageKey="hua-ui-theme"
            enableTransition={false}
          >
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
              <div className="relative z-10">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              {React.createElement(ScrollToTop as any, {
                variant: "primary",
                size: "md",
                threshold: 300
              })}
            </div>
          </ThemeProvider>
        </HydrationProvider>
      </body>
    </html>
  )
} 