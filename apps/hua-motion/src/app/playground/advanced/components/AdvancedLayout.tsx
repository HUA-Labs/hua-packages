'use client'

import { useState } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'

export default function AdvancedLayout() {
  const [activeDemo, setActiveDemo] = useState<'layout'>('layout')

  const demos = [
    {
      id: 'layout',
      title: 'useLayoutMotion',
      description: '레이아웃 변경에 따른 자동 모션 적용',
      code: `const layoutMotion = useLayoutMotion({
  onLayoutChange: (layout) => {
    // 레이아웃 변경 시 자동 모션 적용
    if (layout.width < 768) {
      return { scale: 0.9, opacity: 0.8 }
    }
    return { scale: 1, opacity: 1 }
  },
  duration: 300
})`
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
                ? 'bg-orange-500 text-white'
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
              <Icon name={"clock" as any} className="w-5 h-5 mr-2 text-yellow-600" />
              Coming Soon
            </h4>
            
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8 rounded-lg text-center min-w-[300px]">
                <Icon name={"move" as any} className="w-16 h-16 mx-auto mb-4" />
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
              <Icon name={"code" as any} className="w-5 h-5 mr-2 text-blue-600" />
              사용 예제
            </h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-green-400 text-sm">
                <code>{activeDemoData.code}</code>
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Action variant="gradient" gradient="green" size="sm">
                <Icon name={"copy" as any} className="w-4 h-4 mr-2" />
                코드 복사
              </Action>
              <Action variant="outline" size="sm">
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
