'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkle, GithubLogo, TwitterLogo } from '@phosphor-icons/react'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/20 bg-white/10 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkle className="w-6 h-6 text-blue-600" weight="fill" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HUA UI
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md">
              아름다운 디자인 시스템으로 더 나은 웹 경험을 만들어보세요.
              Tailwind CSS와 Phosphor Icons 기반의 현대적인 UI 컴포넌트 라이브러리입니다.
            </p>
            <div className="flex gap-4">
              <Link href="https://github.com/hua-labs/hua-ui" target="_blank" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                <GithubLogo className="w-5 h-5" weight="fill" />
              </Link>
              <Link href="https://twitter.com/hua_labs" target="_blank" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                <TwitterLogo className="w-5 h-5" weight="fill" />
              </Link>
            </div>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">제품</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/components" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  컴포넌트
                </Link>
              </li>
              <li>
                <Link href="/icons" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  아이콘
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  문서
                </Link>
              </li>
              <li>
                <Link href="/playground" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  플레이그라운드
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">지원</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs/getting-started" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  시작하기
                </Link>
              </li>
              <li>
                <Link href="/docs/installation" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  설치 가이드
                </Link>
              </li>
              <li>
                <Link href="https://github.com/hua-labs/hua-ui/issues" target="_blank" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  이슈 리포트
                </Link>
              </li>
              <li>
                <Link href="https://github.com/hua-labs/hua-ui/discussions" target="_blank" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  커뮤니티
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2024 HUA Labs. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
