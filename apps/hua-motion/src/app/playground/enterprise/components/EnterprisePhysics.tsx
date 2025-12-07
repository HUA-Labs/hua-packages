'use client'

import { useState } from 'react'
import { Action, Panel, Icon } from '@hua-labs/ui'

export function EnterprisePhysics() {
  const [activeDemo, setActiveDemo] = useState<'spring' | 'gravity' | 'collision'>('spring')

  const demos = [
    {
      id: 'spring',
      title: 'usePhysicsSpring',
      description: '고급 스프링 물리 시뮬레이션',
      code: `const spring = usePhysicsSpring({
  mass: 1.0,
  stiffness: 100,
  damping: 10,
  restLength: 0
})`
    },
    {
      id: 'gravity',
      title: 'useGravity',
      description: '중력 효과와 낙하 시뮬레이션',
      code: `const gravity = useGravity({
  gravity: 9.8,
  bounce: 0.7,
  friction: 0.98
})`
    },
    {
      id: 'collision',
      title: 'useCollision',
      description: '충돌 감지와 반응',
      code: `const collision = useCollision({
  bounds: { width: 800, height: 600 },
  onCollide: (impact) => {
    // 충돌 시 반응 처리
  }
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

          {/* Enterprise Only 데모 */}
          <Panel className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name={"crown" as any} className="w-5 h-5 mr-2 text-yellow-600" />
              Enterprise Only
            </h4>
            
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center min-w-[300px]">
                <Icon name={"zap" as any} className="w-16 h-16 mx-auto mb-4" />
                <h5 className="text-xl font-bold mb-2">{activeDemoData.title}</h5>
                <p>{activeDemoData.description}</p>
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <p className="text-sm opacity-90">
                    이 기능은 Enterprise 패키지에서 제공됩니다
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    구독이 필요합니다
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
