'use client'

import { useState } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'

export function CoreBasic() {
  const [activeDemo, setActiveDemo] = useState<'fade' | 'slide' | 'scale' | 'bounce' | 'pulse'>('fade')

  // 기본 모션 훅들 (Coming Soon)

  const demos = [
    {
      id: 'fade',
      title: 'useFadeIn',
      description: '페이드 인 효과',
      code: `const motion = useFadeIn({ duration: 1000 })`
    },
    {
      id: 'slide',
      title: 'useSlideUp',
      description: '아래에서 위로 슬라이드',
      code: `const motion = useSlideUp({ duration: 1000 })`
    },
    {
      id: 'scale',
      title: 'useScaleIn',
      description: '크기 확대 효과',
      code: `const motion = useScaleIn({ duration: 1000 })`
    },
    {
      id: 'bounce',
      title: 'useBounceIn',
      description: '바운스 효과',
      code: `const motion = useBounceIn({ duration: 1000 })`
    },
    {
      id: 'pulse',
      title: 'usePulse',
      description: '맥박 효과',
      code: `const motion = usePulse({ duration: 1000 })`
    }
  ]

  const activeDemoData = demos.find(demo => demo.id === activeDemo)

  return (
    <div className="space-y-8">
      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {demos.map((demo) => (
          <button
            key={demo.id}
            onClick={() => setActiveDemo(demo.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeDemo === demo.id
                ? 'bg-green-500 text-white'
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

          {/* Coming Soon 데모 */}
          <Panel className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="clock" className="w-5 h-5 mr-2 text-yellow-600" />
              Coming Soon
            </h4>
            
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg text-center min-w-[300px]">
                <Icon name="zap" className="w-16 h-16 mx-auto mb-4" />
                <h5 className="text-xl font-bold mb-2">{activeDemoData.title}</h5>
                <p>{activeDemoData.description}</p>
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <p className="text-sm opacity-90">
                    이 기능은 Core 패키지에서 제공됩니다
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          {/* 코드 예제 */}
          <Panel className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="code" className="w-5 h-5 mr-2 text-blue-600" />
              사용 예제
            </h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-green-400 text-sm">
                <code>{activeDemoData.code}</code>
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Action variant="gradient" gradient="green" size="sm">
                <Icon name="copy" className="w-4 h-4 mr-2" />
                코드 복사
              </Action>
              <Action variant="outline" size="sm">
                <Icon name="externalLink" className="w-4 h-4 mr-2" />
                문서 보기
              </Action>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
