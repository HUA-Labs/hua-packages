'use client'

import { useState } from 'react'
import { 
  FadeInDemo, 
  SlideUpDemo, 
  SlideLeftDemo, 
  SlideRightDemo, 
  BounceInDemo, 
  ScaleInDemo, 
  SpringDemo, 
  PulseDemo, 
  GradientDemo, 
  ScrollRevealDemo 
} from './components/IndividualHookTests'
import { 
  ControlAPITest, 
  GestureTriggersTest, 
  SequencingTest 
} from './components/AdvancedFeatures'

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState('individual')

  // 개별 훅 테스트 탭들
  const individualTabs = [
    { id: 'fadeIn', name: 'Fade In', component: FadeInDemo },
    { id: 'slideUp', name: 'Slide Up', component: SlideUpDemo },
    { id: 'slideLeft', name: 'Slide Left', component: SlideLeftDemo },
    { id: 'slideRight', name: 'Slide Right', component: SlideRightDemo },
    { id: 'bounceIn', name: 'Bounce In', component: BounceInDemo },
    { id: 'scaleIn', name: 'Scale In', component: ScaleInDemo },
    { id: 'spring', name: 'Spring', component: SpringDemo },
    { id: 'pulse', name: 'Pulse', component: PulseDemo },
    { id: 'gradient', name: 'Gradient', component: GradientDemo },
    { id: 'scrollReveal', name: 'Scroll Reveal', component: ScrollRevealDemo },
  ]

  // 고급 기능 테스트 탭들
  const advancedTabs = [
    { id: 'controlAPI', name: 'Control API', component: ControlAPITest },
    { id: 'gestureTriggers', name: 'Gesture Triggers', component: GestureTriggersTest },
    { id: 'sequencing', name: 'Sequencing', component: SequencingTest },
  ]

  const [activeIndividualTab, setActiveIndividualTab] = useState('fadeIn')
  const [activeAdvancedTab, setActiveAdvancedTab] = useState('controlAPI')

  const ActiveIndividualComponent = individualTabs.find(tab => tab.id === activeIndividualTab)?.component
  const ActiveAdvancedComponent = advancedTabs.find(tab => tab.id === activeAdvancedTab)?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎨 Animation Playground
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            개별 훅 테스트와 고급 기능을 모두 체험해보세요
          </p>
        </header>

        {/* 메인 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🎯 개별 훅 테스트
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ⚡ 고급 기능 테스트
            </button>
          </div>
        </div>

        {/* 개별 훅 테스트 섹션 */}
        {activeTab === 'individual' && (
          <div>
            {/* 서브 탭 네비게이션 */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {individualTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveIndividualTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeIndividualTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 활성 탭 컨텐츠 */}
            <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                {individualTabs.find(tab => tab.id === activeIndividualTab)?.name} Demo
              </h2>
              {ActiveIndividualComponent && <ActiveIndividualComponent />}
            </section>
          </div>
        )}

        {/* 고급 기능 테스트 섹션 */}
        {activeTab === 'advanced' && (
          <div>
            {/* 서브 탭 네비게이션 */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {advancedTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdvancedTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeAdvancedTab === tab.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 활성 탭 컨텐츠 */}
            <div>
              {ActiveAdvancedComponent && <ActiveAdvancedComponent />}
            </div>

            {/* 스크롤 공간 (제스처 트리거 테스트용) */}
            <div className="h-96 bg-gray-200 rounded flex items-center justify-center">
              <p className="text-gray-600">Scroll down to test scroll reveal animations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 