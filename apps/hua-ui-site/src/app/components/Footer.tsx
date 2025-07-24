'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 backdrop-blur-sm py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center text-slate-600 dark:text-slate-400">
          <p className="text-lg font-medium mb-2">© 2024 HUA Labs. 모든 권리 보유.</p>
          <p className="mb-4">
            Made with ❤️ by HUA Labs Team
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">문서</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">커뮤니티</a>
          </div>
        </div>
      </div>
    </footer>
  )
} 