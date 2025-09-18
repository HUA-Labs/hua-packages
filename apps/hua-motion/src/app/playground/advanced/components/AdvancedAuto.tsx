'use client'

import { useState } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'

export default function AdvancedAuto() {
  const [activeDemo, setActiveDemo] = useState<'fade' | 'slide' | 'scale' | 'play'>('fade')

  const demos = [
    {
      id: 'fade',
      title: 'useAutoFade',
      description: '자동 페이드 인/아웃 반복',
      code: `const motion = useAutoFade({
  interval: 3000,
  fadeIn: { duration: 1000 },
  fadeOut: { duration: 1000 }
})`
    },
    {
      id: 'slide',
      title: 'useAutoSlide',
      description: '자동 슬라이드 애니메이션',
      code: `const motion = useAutoSlide({
  interval: 4000,
  direction: 'horizontal',
  distance: 100
})`
    },
    {
      id: 'scale',
      title: 'useAutoScale',
      description: '자동 크기 변화 애니메이션',
      code: `const motion = useAutoScale({
  interval: 2000,
  minScale: 0.8,
  maxScale: 1.2
})`
    },
    {
      id: 'play',
      title: 'useAutoPlay',
      description: '자동 재생/일시정지 제어',
      code: `const motion = useAutoPlay({
  autoStart: true,
  loop: true,
  interval: 5000
})`
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

          {/* Coming Soon 데모 */}
          <Panel className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="clock" className="w-5 h-5 mr-2 text-yellow-600" />
              Coming Soon
            </h4>
            
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center min-w-[300px]">
                <Icon name="zap" className="w-16 h-16 mx-auto mb-4" />
                <h5 className="text-xl font-bold mb-2">{activeDemoData.title}</h5>
                <p>{activeDemoData.description}</p>
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <p className="text-sm opacity-90">
                    이 기능은 Advanced 패키지에서 제공됩니다
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
