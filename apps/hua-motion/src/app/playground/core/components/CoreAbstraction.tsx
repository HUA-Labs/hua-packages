'use client'

import { useState } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'
import { 
  useSimplePageMotion, 
  usePageMotions,
  useSmartMotion,
  useFadeIn,
  useSlideUp,
  useScaleIn
} from '@hua-labs/motion-core'

export function CoreAbstraction() {
  const [activeDemo, setActiveDemo] = useState<'simple' | 'page' | 'smart' | 'basic'>('simple')

  // 3단계 추상화 데모 (실제 동작)
  const demos = [
    {
      id: 'simple',
      title: 'useSimplePageMotion',
      description: '1단계: 가장 간단한 모션 - 프리셋 기반',
      code: `const motions = useSimplePageMotion('home')`,
      component: <SimpleMotionDemo />
    },
    {
      id: 'page',
      title: 'usePageMotions',
      description: '2단계: 페이지 레벨 모션 - 프리셋 + 인터랙션',
      code: `const motions = usePageMotions({
  hero: { type: 'hero', hover: true },
  title: { type: 'title' },
  button: { type: 'button', click: true }
})`,
      component: <PageMotionDemo />
    },
    {
      id: 'smart',
      title: 'useSmartMotion',
      description: '3단계: 개별 요소별 완전한 제어가 가능한 모션',
      code: `const motion = useSmartMotion({
  type: 'hero',
  entrance: 'fadeIn',
  duration: 800,
  hover: true,
  click: true
})`,
      component: <SmartMotionDemo />
    },
    {
      id: 'basic',
      title: '기본 모션 훅들',
      description: '개별 모션 훅들을 직접 사용하는 방식',
      code: `const fadeIn = useFadeIn({ duration: 800 })
const slideUp = useSlideUp({ delay: 200 })
const scaleIn = useScaleIn({ delay: 400 })`,
      component: <BasicMotionDemo />
    }
  ]

  const activeDemoData = demos.find(demo => demo.id === activeDemo)

  return (
    <div className="space-y-8">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-gray-200">
        {demos.map((demo) => (
          <button
            key={demo.id}
            onClick={() => setActiveDemo(demo.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeDemo === demo.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {demo.title}
          </button>
        ))}
      </div>

      {/* 데모 컨텐츠 */}
      {activeDemoData && (
        <div className="space-y-6">
          {/* 설명 */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {activeDemoData.title}
            </h3>
            <p className="text-gray-600">
              {activeDemoData.description}
            </p>
          </div>

          {/* 실제 동작하는 데모 */}
          <Panel className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name={"play" as any} className="w-5 h-5 mr-2 text-green-600" />
              실시간 데모
            </h4>
            
            <div className="mb-6">
              {activeDemoData.component}
            </div>
          </Panel>

          {/* 코드 예제 */}
          <Panel className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name={"code" as any} className="w-5 h-5 mr-2 text-blue-600" />
              사용 예제
            </h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-green-400 text-sm">
                <code>{activeDemoData.code}</code>
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Action 
                variant="gradient" 
                gradient="green" 
                size="md"
                onClick={() => navigator.clipboard.writeText(activeDemoData.code)}
              >
                <Icon name={"copy" as any} className="w-4 h-4 mr-2" />
                코드 복사
              </Action>
              <Action variant="outline" size="md">
                <Icon name={"externalLink" as any} className="w-4 h-4 mr-2" />
                문서 보기
              </Action>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}

// 1단계: Simple Motion Demo - 가장 단순한 모션
function SimpleMotionDemo() {
  const motions = useSimplePageMotion('home')

  return (
    <div className="text-center space-y-6">
      <div 
        ref={motions.hero?.ref as React.Ref<HTMLDivElement>}
        style={motions.hero?.style}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl transform transition-all duration-500"
        data-motion-id="hero"
      >
        <h3 className="text-2xl font-bold mb-2">Hero Section Template</h3>
        <p className="text-lg mb-4">메인 페이지 히어로 섹션을 위한 모션 프리셋</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">🚀</div>
            <div>페이드인</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">⚡</div>
            <div>슬라이드업</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">✨</div>
            <div>스케일인</div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">✅ <strong>장점:</strong> 설정이 매우 간단함</p>
        <p className="mb-2">⚠️ <strong>제한:</strong> 커스터마이징 옵션이 제한적</p>
        <p>🎨 <strong>사용처:</strong> 빠른 프로토타이핑, 간단한 페이지</p>
      </div>
    </div>
  )
}

// 2단계: Page Motion Demo - 복잡한 시퀀스와 인터랙션
function PageMotionDemo() {
  const motions = usePageMotions({
    hero: { type: 'hero', hover: true, duration: 800 },
    cards: { type: 'card', duration: 700, delay: 200 },
    cta: { type: 'button', click: true, duration: 600, delay: 400 }
  }) as any
  
  return (
    <div className="space-y-6">
      <div 
        data-motion-id="hero"
        ref={motions.hero?.ref as any}
        style={motions.hero?.style}
        className="p-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <h3 className="text-xl font-bold mb-2">Hero Section (2단계)</h3>
        <p className="opacity-90">프리셋 + 호버 인터랙션</p>
        <p className="text-sm opacity-75 mt-2">🖱️ 마우스를 올려보세요!</p>
      </div>
      
      <div 
        data-motion-id="cards"
        ref={motions.cards?.ref as any}
        style={motions.cards?.style}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">🎨</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Card Grid Template</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">카드 그리를 위한 모션 프리셋</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">📱</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Responsive</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">반응형 그리드 레이아웃</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">⚡</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Performance</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">최적화된 애니메이션</p>
        </div>
      </div>
      
      <div 
        data-motion-id="cta"
        ref={motions.cta?.ref as any}
        style={motions.cta?.style}
        className="text-center"
      >
        <Action 
          className="bg-green-600 hover:bg-green-700 text-white transform transition-all duration-200 hover:scale-105"
        >
          🎯 CTA 버튼 (2단계)
        </Action>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          클릭하면 모션 라이브러리가 자동으로 애니메이션을 적용합니다
        </p>
      </div>
      
      {/* 모션 상태 정보 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 text-sm border border-gray-200 dark:border-gray-600">
        <h5 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
          📊 Page Motion 상태:
        </h5>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-2 rounded bg-white dark:bg-gray-700">
            <div className="text-lg mb-1">{motions.hero?.isHovered ? '🟢' : '⚪'}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Hero</div>
          </div>
          <div className="p-2 rounded bg-white dark:bg-gray-700">
            <div className="text-lg mb-1">{motions.cards?.isVisible ? '🟢' : '⚪'}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Cards</div>
          </div>
          <div className="p-2 rounded bg-white dark:bg-gray-700">
            <div className="text-lg mb-1">{motions.cta?.isClicked ? '🟢' : '⚪'}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">CTA</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
          🎨 <strong>Card Grid Template:</strong> 카드 그리드를 위한 모션 프리셋
        </div>
      </div>
    </div>
  )
}

// 3단계: Smart Motion Demo - 고급 인터랙션과 완전한 제어
function SmartMotionDemo() {
  const motion = useSmartMotion({
    type: 'hero',
    entrance: 'fadeIn',
    duration: 800,
    hover: true,
    click: true
  })
  
  return (
    <div className="space-y-6">
      <div 
        ref={motion.ref as any}
        style={motion.style}
        className="p-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-2xl text-center cursor-pointer transform transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:rotate-1"
      >
        <h3 className="text-2xl font-bold mb-3">Form Template</h3>
        <p className="opacity-90 text-lg mb-4">폼 요소들을 위한 모션 프리셋</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">📝</div>
            <div>입력 필드</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl mb-1">✅</div>
            <div>유효성 검사</div>
          </div>
        </div>
        <p className="text-sm opacity-75 mt-4">🖱️ 호버와 클릭을 모두 시도해보세요!</p>
      </div>
      
      {/* 폼 요소 데모 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">📧</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Email Input</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">이메일 입력 필드</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">🔒</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Password</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">비밀번호 입력</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center transform transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">📋</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Textarea</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">긴 텍스트 입력</p>
        </div>
      </div>
      
      {/* 고급 모션 상태 정보 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700/50">
        <h5 className="font-semibold mb-4 text-purple-900 dark:text-purple-100 flex items-center">
          🚀 Form Template 상태 대시보드:
        </h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600/50">
            <div className="text-2xl mb-2">{motion.isHovered ? '🟢' : '⚪'}</div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">호버</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {motion.isHovered ? '활성' : '대기'}
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600/50">
            <div className="text-2xl mb-2">{motion.isClicked ? '🟢' : '⚪'}</div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">클릭</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {motion.isClicked ? '활성' : '대기'}
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600/50">
            <div className="text-2xl mb-2">{motion.isVisible ? '🟢' : '⚪'}</div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">가시성</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {motion.isVisible ? '보임' : '숨김'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600/50">
          <h6 className="font-medium text-purple-700 dark:text-purple-300 mb-2">🎨 Form Template의 특징:</h6>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 폼 요소별 개별 모션 제어</li>
            <li>• 유효성 검사 상태에 따른 모션</li>
            <li>• 사용자 입력에 반응하는 인터랙션</li>
            <li>• 접근성을 고려한 모션 설계</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 기본 모션 훅들 데모 - 개별 효과를 명확하게 보여줌
function BasicMotionDemo() {
  const fadeIn = useFadeIn({ duration: 800 })
  const slideUp = useSlideUp({ delay: 200 })
  const scaleIn = useScaleIn({ delay: 400 })
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🎭 개별 모션 훅들
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          각각의 모션 훅을 직접 조합하여 사용하는 방식
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          ref={fadeIn.ref}
          style={fadeIn.style}
          className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-300 dark:border-blue-600/50 rounded-xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="text-4xl mb-3">✨</div>
          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Fade In</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">부드러운 페이드인 효과</p>
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
            지연: 0ms | 지속: 800ms
          </div>
        </div>
        
        <div 
          ref={slideUp.ref}
          style={slideUp.style}
          className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-300 dark:border-green-600/50 rounded-xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="text-4xl mb-3">📈</div>
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Slide Up</h4>
          <p className="text-green-700 dark:text-green-300 text-sm">아래에서 위로 슬라이드</p>
          <div className="mt-3 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
            지연: 200ms | 지속: 700ms
          </div>
        </div>
        
        <div 
          ref={scaleIn.ref}
          style={scaleIn.style}
          className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 border-2 border-purple-300 dark:border-purple-600/50 rounded-xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="text-4xl mb-3">🎯</div>
          <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">Scale In</h4>
          <p className="text-purple-700 dark:text-purple-300 text-sm">확대되며 나타나는 효과</p>
          <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
            지연: 400ms | 지속: 1000ms
          </div>
        </div>
      </div>
      
      {/* 사용법 안내 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
        <h5 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
          💡 기본 모션 훅 사용법:
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">✅ 장점:</h6>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 각 모션을 독립적으로 제어</li>
              <li>• 세밀한 타이밍 조정 가능</li>
              <li>• 성능 최적화</li>
            </ul>
          </div>
          <div>
            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">⚠️ 주의사항:</h6>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 코드가 복잡해질 수 있음</li>
              <li>• 각 훅의 상태를 개별 관리</li>
              <li>• 초보자에게는 어려울 수 있음</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
