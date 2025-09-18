'use client'

import { useState, useRef, useEffect } from 'react'
import { usePageMotions } from '@hua-labs/motion'
import { 
  Button, 
  Card, 
  Badge, 
  Icon,
  Slider
} from '@hua-labs/ui'

export function AdvancedPageMotion() {
  const [selectedPreset, setSelectedPreset] = useState<'dashboard' | 'gallery' | 'timeline'>('dashboard')
  const [motionIntensity, setMotionIntensity] = useState(1)
  const [enableOrchestration, setEnableOrchestration] = useState(true)
  const [performanceMode, setPerformanceMode] = useState<'balanced' | 'smooth' | 'fast'>('balanced')

  // 고급 페이지 프리셋
  const advancedPresets = {
    dashboard: {
      title: 'Dashboard Layout',
      description: '복잡한 대시보드 레이아웃을 위한 고급 모션',
      config: {
        header: { 
          type: 'hero', 
          hover: true, 
          duration: 800,
          delay: 0,
          threshold: 0.1
        },
        sidebar: { 
          type: 'sidebar', 
          duration: 600,
          delay: 100,
          threshold: 0.2
        },
        mainContent: { 
          type: 'content', 
          duration: 700,
          delay: 200,
          threshold: 0.3
        },
        widget1: { 
          type: 'card', 
          hover: true, 
          click: true,
          duration: 500,
          delay: 300,
          threshold: 0.4
        },
        widget2: { 
          type: 'card', 
          hover: true, 
          click: true,
          duration: 500,
          delay: 400,
          threshold: 0.5
        },
        widget3: { 
          type: 'card', 
          hover: true, 
          click: true,
          duration: 500,
          delay: 500,
          threshold: 0.6
        },
        footer: { 
          type: 'footer', 
          duration: 600,
          delay: 600,
          threshold: 0.8
        }
      }
    },
    gallery: {
      title: 'Gallery Grid',
      description: '동적 갤러리 그리드를 위한 고급 모션',
      config: {
        title: { 
          type: 'title', 
          duration: 600,
          delay: 0,
          threshold: 0.1
        },
        filterBar: { 
          type: 'toolbar', 
          hover: true,
          duration: 500,
          delay: 100,
          threshold: 0.2
        },
        gridContainer: { 
          type: 'container', 
          duration: 800,
          delay: 200,
          threshold: 0.3
        },
        item1: { 
          type: 'galleryItem', 
          hover: true, 
          click: true,
          duration: 400,
          delay: 300,
          threshold: 0.4
        },
        item2: { 
          type: 'galleryItem', 
          hover: true, 
          click: true,
          duration: 400,
          delay: 350,
          threshold: 0.45
        },
        item3: { 
          type: 'galleryItem', 
          hover: true, 
          click: true,
          duration: 400,
          delay: 400,
          threshold: 0.5
        },
        item4: { 
          type: 'galleryItem', 
          hover: true, 
          click: true,
          duration: 400,
          delay: 450,
          threshold: 0.55
        },
        item5: { 
          type: 'galleryItem', 
          hover: true, 
          click: true,
          duration: 400,
          delay: 500,
          threshold: 0.6
        },
        item6: { 
          type: 'galleryItem', 
          hover: true, 
          click: true,
          duration: 400,
          delay: 550,
          threshold: 0.65
        }
      }
    },
    timeline: {
      title: 'Timeline View',
      description: '시간 기반 타임라인을 위한 고급 모션',
      config: {
        header: { 
          type: 'title', 
          duration: 600,
          delay: 0,
          threshold: 0.1
        },
        timeline: { 
          type: 'timeline', 
          duration: 1000,
          delay: 100,
          threshold: 0.2
        },
        event1: { 
          type: 'timelineEvent', 
          hover: true,
          duration: 500,
          delay: 200,
          threshold: 0.3
        },
        event2: { 
          type: 'timelineEvent', 
          hover: true,
          duration: 500,
          delay: 300,
          threshold: 0.4
        },
        event3: { 
          type: 'timelineEvent', 
          hover: true,
          duration: 500,
          delay: 400,
          threshold: 0.5
        },
        event4: { 
          type: 'timelineEvent', 
          hover: true,
          duration: 500,
          delay: 500,
          threshold: 0.6
        },
        event5: { 
          type: 'timelineEvent', 
          hover: true,
          duration: 500,
          delay: 600,
          threshold: 0.7
        }
      }
    }
  }

  const activePreset = advancedPresets[selectedPreset]
  
  // 모션 강도에 따른 설정 조정
  const adjustedConfig = { ...activePreset.config }
  Object.keys(adjustedConfig).forEach(key => {
    const element = adjustedConfig[key as keyof typeof adjustedConfig]
    if (element) {
      element.duration = Math.round(element.duration! * motionIntensity)
      element.delay = Math.round(element.delay! * motionIntensity)
    }
  })

  const motions = usePageMotions(adjustedConfig)

  // 모션 요소 렌더링
  const renderMotionElement = (elementId: string, children: React.ReactNode) => {
    const motion = motions[elementId as keyof typeof motions] as any
    if (!motion) return <div>{children}</div>

    return (
      <div
        key={elementId}
        data-motion-id={elementId}
        style={motion.style}
        className="transition-all duration-300"
      >
        {children}
      </div>
    )
  }

  // Dashboard Demo
  const DashboardDemo = () => (
    <div className="space-y-6">
      {renderMotionElement('header', (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
          <h1 className="text-2xl font-bold mb-2">Advanced Dashboard</h1>
          <p className="opacity-90">고급 페이지 모션의 진정한 힘을 경험해보세요</p>
        </div>
      ))}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {renderMotionElement('sidebar', (
          <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Navigation</h3>
            <div className="space-y-2">
              <div className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer">Dashboard</div>
              <div className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer">Analytics</div>
              <div className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer">Settings</div>
            </div>
          </div>
        ))}
        
        <div className="lg:col-span-3 space-y-6">
          {renderMotionElement('mainContent', (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
              <p className="text-gray-600 dark:text-gray-400">이 영역은 페이지 모션의 핵심 기능을 보여줍니다.</p>
            </div>
          ))}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderMotionElement('widget1', (
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h4 className="font-medium mb-2">Widget 1</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">첫 번째 위젯</p>
              </Card>
            ))}
            
            {renderMotionElement('widget2', (
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h4 className="font-medium mb-2">Widget 2</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">두 번째 위젯</p>
              </Card>
            ))}
            
            {renderMotionElement('widget3', (
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h4 className="font-medium mb-2">Widget 3</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">세 번째 위젯</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {renderMotionElement('footer', (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 HUA Motion. All rights reserved.</p>
        </div>
      ))}
    </div>
  )

  // Gallery Demo
  const GalleryDemo = () => (
    <div className="space-y-6">
      {renderMotionElement('title', (
        <h2 className="text-2xl font-bold text-center mb-6">Advanced Gallery</h2>
      ))}
      
      {renderMotionElement('filterBar', (
        <div className="flex justify-center gap-4 mb-6">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">Photos</Button>
          <Button variant="outline" size="sm">Videos</Button>
          <Button variant="outline" size="sm">Documents</Button>
        </div>
      ))}
      
      {renderMotionElement('gridContainer', (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {renderMotionElement('item1', (
            <div className="aspect-square bg-gradient-to-br from-red-400 to-pink-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
          ))}
          {renderMotionElement('item2', (
            <div className="aspect-square bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
          ))}
          {renderMotionElement('item3', (
            <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
          ))}
          {renderMotionElement('item4', (
            <div className="aspect-square bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
          ))}
          {renderMotionElement('item5', (
            <div className="aspect-square bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
          ))}
          {renderMotionElement('item6', (
            <div className="aspect-square bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
          ))}
        </div>
      ))}
    </div>
  )

  // Timeline Demo
  const TimelineDemo = () => (
    <div className="space-y-6">
      {renderMotionElement('header', (
        <h2 className="text-2xl font-bold text-center mb-6">Project Timeline</h2>
      ))}
      
      {renderMotionElement('timeline', (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div className="space-y-8">
            {renderMotionElement('event1', (
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="ml-8 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                  <h4 className="font-medium">Project Kickoff</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2024년 1월 15일</p>
                </div>
              </div>
            ))}
            
            {renderMotionElement('event2', (
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-8 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                  <h4 className="font-medium">Design Phase</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2024년 2월 1일</p>
                </div>
              </div>
            ))}
            
            {renderMotionElement('event3', (
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="ml-8 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                  <h4 className="font-medium">Development</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2024년 3월 1일</p>
                </div>
              </div>
            ))}
            
            {renderMotionElement('event4', (
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="ml-8 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                  <h4 className="font-medium">Testing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2024년 4월 15일</p>
                </div>
              </div>
            ))}
            
            {renderMotionElement('event5', (
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="ml-8 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                  <h4 className="font-medium">Launch</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2024년 5월 1일</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">고급 페이지 모션 시스템</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          <code>usePageMotions</code>의 고급 기능과 오케스트레이션을 체험해보세요
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Icon name="zap" className="w-4 h-4 mr-2" />
            고급 프리셋
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Icon name="layers" className="w-4 h-4 mr-2" />
            모션 오케스트라
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Icon name="settings" className="w-4 h-4 mr-2" />
            성능 최적화
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">고급 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">프리셋 선택</label>
            <select 
              value={selectedPreset} 
              onChange={(e) => setSelectedPreset(e.target.value as keyof typeof advancedPresets)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dashboard">Dashboard</option>
              <option value="gallery">Gallery</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">모션 강도: {motionIntensity.toFixed(1)}x</label>
            <Slider
              value={motionIntensity}
              onValueChange={setMotionIntensity}
              min={0.5}
              max={2.0}
              step={0.1}
              showValue={true}
              variant="primary"
              size="md"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enableOrchestration}
              onChange={(e) => setEnableOrchestration(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium">오케스트레이션</label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">성능 모드</label>
            <select 
              value={performanceMode} 
              onChange={(e) => setPerformanceMode(e.target.value as 'balanced' | 'smooth' | 'fast')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fast">Fast</option>
              <option value="balanced">Balanced</option>
              <option value="smooth">Smooth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Demo */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">실시간 데모</h3>
        <div className="mb-4">
          <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/20">
            <Icon name="play" className="w-4 h-4 mr-2" />
            {activePreset.title}
          </Badge>
        </div>
        
        <div className="min-h-[500px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
          {selectedPreset === 'dashboard' && <DashboardDemo />}
          {selectedPreset === 'gallery' && <GalleryDemo />}
          {selectedPreset === 'timeline' && <TimelineDemo />}
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">고급 설정 코드</h3>
        <pre className="text-sm overflow-x-auto">
          <code>{`// ${activePreset.title} 고급 설정
const motions = usePageMotions({
  ...${selectedPreset}Config,
  // 모션 강도 조정
  duration: element.duration * ${motionIntensity},
  delay: element.delay * ${motionIntensity},
  // 성능 최적화
  performanceMode: '${performanceMode}',
  // 오케스트레이션
  orchestration: ${enableOrchestration}
})

// 사용법
<div data-motion-id="header" style={motions.header?.style}>
  <h1>Advanced Header</h1>
</div>`}</code>
        </pre>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="zap" className="w-5 h-5 mr-2 text-yellow-500" />
            고급 프리셋 시스템
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            복잡한 레이아웃을 위한 고급 프리셋을 제공합니다.
            Dashboard, Gallery, Timeline 등 다양한 패턴을 지원합니다.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="layers" className="w-5 h-5 mr-2 text-blue-500" />
            모션 오케스트레이션
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            여러 요소의 모션을 조율하여 일관된 사용자 경험을 제공합니다.
            타이밍과 순서를 정교하게 제어할 수 있습니다.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="settings" className="w-5 h-5 mr-2 text-green-500" />
            성능 최적화
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fast, Balanced, Smooth 모드를 통해 성능과 품질의 균형을 맞출 수 있습니다.
            디바이스 성능에 따라 자동으로 최적화됩니다.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="mousePointer" className="w-5 h-5 mr-2 text-purple-500" />
            고급 인터랙션
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            호버, 클릭, 스크롤 등 다양한 인터랙션에 반응하는 모션을
            세밀하게 제어할 수 있습니다.
          </p>
        </Card>
      </div>
    </div>
  )
}
