'use client'

import { useState } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'
import PageHeader from '../components/PageHeader'
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
  const [codePanel, setCodePanel] = useState(true)
  const [livePreview, setLivePreview] = useState(true)

  // 개별 훅 테스트 탭들
  const individualTabs = [
    { 
      id: 'fadeIn', 
      name: 'Fade In', 
      component: FadeInDemo,
      description: '요소가 부드럽게 나타나는 페이드 인 애니메이션',
      api: 'useFadeIn(options)',
      parameters: ['delay', 'duration', 'threshold', 'easing']
    },
    { 
      id: 'slideUp', 
      name: 'Slide Up', 
      component: SlideUpDemo,
      description: '요소가 아래에서 위로 슬라이드하며 나타나는 애니메이션',
      api: 'useSlideUp(options)',
      parameters: ['delay', 'duration', 'distance', 'easing']
    },
    { 
      id: 'slideLeft', 
      name: 'Slide Left', 
      component: SlideLeftDemo,
      description: '요소가 오른쪽에서 왼쪽으로 슬라이드하는 애니메이션',
      api: 'useSlideLeft(options)',
      parameters: ['delay', 'duration', 'distance', 'easing']
    },
    { 
      id: 'slideRight', 
      name: 'Slide Right', 
      component: SlideRightDemo,
      description: '요소가 왼쪽에서 오른쪽으로 슬라이드하는 애니메이션',
      api: 'useSlideRight(options)',
      parameters: ['delay', 'duration', 'distance', 'easing']
    },
    { 
      id: 'bounceIn', 
      name: 'Bounce In', 
      component: BounceInDemo,
      description: '바운스 효과와 함께 나타나는 애니메이션',
      api: 'useBounceIn(options)',
      parameters: ['delay', 'duration', 'bounce', 'easing']
    },
    { 
      id: 'scaleIn', 
      name: 'Scale In', 
      component: ScaleInDemo,
      description: '요소가 확대되며 나타나는 스케일 애니메이션',
      api: 'useScaleIn(options)',
      parameters: ['delay', 'duration', 'scale', 'easing']
    },
    { 
      id: 'spring', 
      name: 'Spring', 
      component: SpringDemo,
      description: '스프링 물리 기반의 자연스러운 애니메이션',
      api: 'useSpring(options)',
      parameters: ['stiffness', 'damping', 'mass', 'velocity']
    },
    { 
      id: 'pulse', 
      name: 'Pulse', 
      component: PulseDemo,
      description: '요소가 맥박처럼 반복적으로 확대/축소되는 애니메이션',
      api: 'usePulse(options)',
      parameters: ['delay', 'duration', 'scale', 'repeat']
    },
    { 
      id: 'gradient', 
      name: 'Gradient', 
      component: GradientDemo,
      description: '그라데이션 색상이 변화하는 애니메이션',
      api: 'useGradient(options)',
      parameters: ['colors', 'duration', 'direction', 'repeat']
    },
    { 
      id: 'scrollReveal', 
      name: 'Scroll Reveal', 
      component: ScrollRevealDemo,
      description: '스크롤에 따라 요소가 나타나는 애니메이션',
      api: 'useScrollReveal(options)',
      parameters: ['threshold', 'rootMargin', 'trigger', 'once']
    },
  ]

  // 고급 기능 테스트 탭들
  const advancedTabs = [
    { 
      id: 'controlAPI', 
      name: 'Control API', 
      component: ControlAPITest,
      description: '애니메이션을 프로그래밍 방식으로 제어하는 API',
      api: 'useAnimationControl()',
      parameters: ['play', 'pause', 'reverse', 'reset']
    },
    { 
      id: 'gestureTriggers', 
      name: 'Gesture Triggers', 
      component: GestureTriggersTest,
      description: '제스처와 터치 이벤트에 반응하는 애니메이션',
      api: 'useGestureAnimation(options)',
      parameters: ['drag', 'pinch', 'rotate', 'swipe']
    },
    { 
      id: 'sequencing', 
      name: 'Sequencing', 
      component: SequencingTest,
      description: '여러 애니메이션을 순차적으로 실행하는 기능',
      api: 'useAnimationSequence(animations)',
      parameters: ['stagger', 'delay', 'repeat', 'yoyo']
    },
  ]

  const [activeIndividualTab, setActiveIndividualTab] = useState('fadeIn')
  const [activeAdvancedTab, setActiveAdvancedTab] = useState('controlAPI')

  const ActiveIndividualComponent = individualTabs.find(tab => tab.id === activeIndividualTab)?.component
  const ActiveAdvancedComponent = advancedTabs.find(tab => tab.id === activeAdvancedTab)?.component
  const activeTabData = activeTab === 'individual' 
    ? individualTabs.find(tab => tab.id === activeIndividualTab)
    : advancedTabs.find(tab => tab.id === activeAdvancedTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <PageHeader
          title="Animation Playground"
          description="개별 훅 테스트와 고급 기능을 모두 체험해보세요"
          icon="code"
          color="purple"
          maxWidth="4xl"
        >
          {/* 개발자 도구 설명 */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/20">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Icon name="settings" size={20} className="mr-2" />
              개발자 실험실
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              각 훅의 파라미터를 실시간으로 조정하고, 코드를 편집하며, 결과를 즉시 확인할 수 있습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>실시간 파라미터 조정</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>코드 편집 및 실행</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>즉시 결과 확인</span>
              </div>
            </div>
          </div>
        </PageHeader>

        {/* 메인 탭 네비게이션 */}
        <Panel 
          style="glass" 
          padding="md" 
          className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <Action
              onClick={() => setActiveTab('individual')}
              variant={activeTab === 'individual' ? 'gradient' : 'outline'}
              gradient="blue"
              size="md"
              hapticFeedback={true}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'individual'
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🎯 개별 훅 테스트
            </Action>
            <Action
              onClick={() => setActiveTab('advanced')}
              variant={activeTab === 'advanced' ? 'gradient' : 'outline'}
              gradient="purple"
              size="md"
              hapticFeedback={true}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'advanced'
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ⚡ 고급 기능 테스트
            </Action>
          </div>
        </Panel>

        {/* 서브 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {(activeTab === 'individual' ? individualTabs : advancedTabs).map((tab) => (
              <Action
                key={tab.id}
                onClick={() => {
                  if (activeTab === 'individual') {
                    setActiveIndividualTab(tab.id)
                  } else {
                    setActiveAdvancedTab(tab.id)
                  }
                }}
                variant={
                  (activeTab === 'individual' && activeIndividualTab === tab.id) ||
                  (activeTab === 'advanced' && activeAdvancedTab === tab.id)
                    ? 'gradient'
                    : 'outline'
                }
                gradient="green"
                size="sm"
                className="px-4 py-2 text-xs"
              >
                {tab.name}
              </Action>
            ))}
          </div>
        </div>

        {/* 현재 선택된 훅 정보 */}
        {activeTabData && (
          <Panel 
            style="glass" 
            padding="md" 
            className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {activeTabData.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {activeTabData.description}
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                    {activeTabData.api}
                  </code>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📋 사용 가능한 파라미터
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeTabData.parameters.map((param, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* 컨트롤 패널 */}
        <Panel 
          style="glass" 
          padding="md" 
          className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
        >
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Action
              onClick={() => setCodePanel(!codePanel)}
              variant={codePanel ? 'gradient' : 'outline'}
              gradient="blue"
              size="sm"
            >
              💻 {codePanel ? '코드 패널 숨기기' : '코드 패널 보기'}
            </Action>
            <Action
              onClick={() => setLivePreview(!livePreview)}
              variant={livePreview ? 'gradient' : 'outline'}
              gradient="green"
              size="sm"
            >
              👁️ {livePreview ? '미리보기 숨기기' : '미리보기 보기'}
            </Action>
            <Action
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              🔄 리셋
            </Action>
          </div>
        </Panel>

        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 코드 편집 패널 */}
          {codePanel && (
            <Panel 
              style="glass" 
              padding="lg" 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💻 코드 편집기
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-auto">
                <pre className="text-green-400 text-sm">
                  <code>{`// ${activeTabData?.name} 예제 코드
import { ${activeTabData?.api.split('(')[0]} } from '@hua-labs/motion'

function Example() {
  const animation = ${activeTabData?.api}
  
  return (
    <div 
      ref={animation.ref}
      style={animation.style}
      className="p-4 bg-blue-500 rounded-lg"
    >
      애니메이션 요소
    </div>
  )
}`}</code>
                </pre>
              </div>
              <div className="mt-4 flex gap-2">
                <Action variant="gradient" gradient="green" size="sm">
                  ▶️ 실행
                </Action>
                <Action variant="outline" size="sm">
                  📋 복사
                </Action>
              </div>
            </Panel>
          )}

          {/* 라이브 미리보기 */}
          {livePreview && (
            <Panel 
              style="glass" 
              padding="lg" 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                👁️ 라이브 미리보기
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 h-96 flex items-center justify-center">
                {ActiveIndividualComponent && <ActiveIndividualComponent />}
                {ActiveAdvancedComponent && <ActiveAdvancedComponent />}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  실시간으로 파라미터를 조정하고 결과를 확인하세요
                </p>
              </div>
            </Panel>
          )}
        </div>

        {/* 파라미터 조정 패널 */}
        <Panel 
          style="glass" 
          padding="lg" 
          className="mt-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎛️ 파라미터 조정
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTabData?.parameters.map((param, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {param}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  defaultValue="200"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0</span>
                  <span>500</span>
                  <span>1000</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 다음 단계 안내 */}
        <div className="mt-12 text-center">
          <Panel 
            style="glass" 
            padding="lg" 
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🚀 다음 단계
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              실험을 마친 후, 실제 프로젝트에 적용해보세요
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Action variant="gradient" gradient="blue" size="lg">
                📚 문서 보기
              </Action>
              <Action variant="gradient" gradient="green" size="lg">
                🧪 통합 테스트
              </Action>
              <Action variant="outline" size="lg">
                🎨 쇼케이스 보기
              </Action>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
} 