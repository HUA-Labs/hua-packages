'use client'

import { Icon } from '@hua-labs/ui'
import { Action } from '@hua-labs/ui'
import { Panel } from '@hua-labs/ui'

export default function TierSystemSection() {
  return (
    <section className="mb-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          <Icon name="layers" size={40} className="inline-block align-text-bottom mr-3 text-blue-600 dark:text-blue-400" />
          3단계 모션 시스템
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          사용자의 경험 수준에 맞춰 단계별로 제공되는 모션 시스템입니다. 
          간단한 설정부터 고급 커스터마이징까지 모든 요구사항을 충족합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tier 1 */}
        <Panel style="glass" padding="lg" className="text-center flex flex-col h-full">
          <div className="flex-1">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Icon name="zap" size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tier 1: Simple</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              프리셋 기반의 간단한 모션으로 빠르게 시작하세요.
            </p>
            <ul className="text-left text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>• 한 줄로 완성되는 모션</li>
              <li>• 5가지 페이지 타입 지원</li>
              <li>• 최소한의 설정으로 즉시 사용 가능</li>
            </ul>
          </div>
          <Action 
            href="/simple-motion"
            variant="outline"
            size="lg"
            className="mt-auto border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-300 transition-all duration-300 flex items-center justify-center"
          >
            <Icon name="play" size={20} className="mr-3" />
            데모 보기
          </Action>
        </Panel>

        {/* Tier 2 */}
        <Panel style="glass" padding="lg" className="text-center flex flex-col h-full">
          <div className="flex-1">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <Icon name="layers" size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tier 2: Smart</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              개별 요소를 세밀하게 제어하는 스마트 모션 시스템.
            </p>
            <ul className="text-left text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>• 개별 요소별 모션 제어</li>
              <li>• 호버, 클릭 인터랙션</li>
              <li>• 중앙집중식 상태 관리</li>
            </ul>
          </div>
          <Action 
            href="/page-motion"
            variant="outline"
            size="lg"
            className="mt-auto border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:border-green-300 transition-all duration-300 flex items-center justify-center"
          >
            <Icon name="play" size={20} className="mr-3" />
            데모 보기
          </Action>
        </Panel>

        {/* Tier 3 */}
        <Panel style="glass" padding="lg" className="text-center flex flex-col h-full">
          <div className="flex-1">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Icon name="sparkles" size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tier 3: Advanced</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              완전한 커스터마이징이 가능한 고급 모션 시스템.
            </p>
            <ul className="text-left text-gray-700 dark:text-gray-300 mb-6 space-y-2">
              <li>• 개별 훅 조합 및 오케스트레이션</li>
              <li>• 제스처 및 스프링 모션</li>
              <li>• 최대한의 유연성</li>
            </ul>
          </div>
          <Action 
            href="/smart-motion"
            variant="outline"
            size="lg"
            className="mt-auto border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 dark:hover:border-purple-300 transition-all duration-300 flex items-center justify-center"
          >
            <Icon name="play" size={20} className="mr-3" />
            데모 보기
          </Action>
        </Panel>
      </div>
    </section>
  )
} 