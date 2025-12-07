'use client'

import React from 'react'
import { Icon, Action, Panel } from '@hua-labs/ui'
import { useSmartMotion } from '@hua-labs/motion-core'

export default function CTASection() {
  const ctaRef = useSmartMotion({
    type: 'hero',
    entrance: 'fadeIn',
    delay: 0,
    duration: 600
  })

  const ctaTitleRef = useSmartMotion({
    type: 'title',
    entrance: 'slideUp',
    delay: 200,
    duration: 500
  })

  return (
    <Panel 
      ref={ctaRef.ref}
      style="glass"
      rounded="none"
      padding="xl"
      className="bg-gradient-to-r from-slate-50/50 via-blue-50/50 to-indigo-100/50 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 border border-slate-200/30 dark:border-slate-700/30"
    >
      <div className="text-center">
        <h2 
          ref={ctaTitleRef.ref}
          style={ctaTitleRef.style}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
        >
          지금 시작해보세요
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
          HUA Motion으로 아름다운 웹 경험을 만들어보세요.
          <br />
          간단한 설정으로 바로 사용할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Action 
            href="/docs"
            variant="default"
            size="md"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-8 sm:py-5 w-full sm:w-auto text-center flex items-center justify-center"
          >
            <Icon name={"book" as any} size={20} className="mr-2" />
            문서 보기
          </Action>
          <Action 
            href="https://www.npmjs.com/package/@hua-labs/motion"
            variant="outline"
            size="md"
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 px-6 py-4 sm:px-8 sm:py-5 w-full sm:w-auto text-center flex items-center justify-center"
          >
            <Icon name={"file" as any} size={20} className="mr-2" />
            npm
          </Action>
        </div>
      </div>
    </Panel>
  )
} 