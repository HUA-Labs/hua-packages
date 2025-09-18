'use client'

import { useState, useRef } from 'react'
import { usePageMotions } from '@hua-labs/motion'
import { 
  Button, 
  Card, 
  Badge, 
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@hua-labs/ui'

export function CorePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'hero' | 'card' | 'form'>('hero')
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const [isClicked, setIsClicked] = useState<string | null>(null)

  // 페이지 템플릿별 설정
  const templates = {
    hero: {
      title: 'Hero Section Template',
      description: '메인 페이지 히어로 섹션을 위한 모션 프리셋',
      config: {
        hero: { 
          type: 'hero', 
          hover: true, 
          duration: 800,
          delay: 0 
        },
        title: { 
          type: 'title', 
          duration: 700,
          delay: 200 
        },
        subtitle: { 
          type: 'subtitle', 
          duration: 700,
          delay: 400 
        },
        button: { 
          type: 'button', 
          hover: true, 
          click: true,
          duration: 600,
          delay: 600 
        }
      }
    },
    card: {
      title: 'Card Grid Template',
      description: '카드 그리드를 위한 모션 프리셋',
      config: {
        header: { 
          type: 'title', 
          duration: 600,
          delay: 0 
        },
        card1: { 
          type: 'card', 
          hover: true, 
          duration: 500,
          delay: 100 
        },
        card2: { 
          type: 'card', 
          hover: true, 
          duration: 500,
          delay: 200 
        },
        card3: { 
          type: 'card', 
          hover: true, 
          duration: 500,
          delay: 300 
        }
      }
    },
    form: {
      title: 'Form Template',
      description: '폼 요소들을 위한 모션 프리셋',
      config: {
        formTitle: { 
          type: 'title', 
          duration: 600,
          delay: 0 
        },
        input1: { 
          type: 'input', 
          hover: true, 
          focus: true,
          duration: 400,
          delay: 100 
        },
        input2: { 
          type: 'input', 
          hover: true, 
          focus: true,
          duration: 400,
          delay: 200 
        },
        submitButton: { 
          type: 'button', 
          hover: true, 
          click: true,
          duration: 500,
          delay: 300 
        }
      }
    }
  }

  const activeTemplate = templates[selectedTemplate]
  const motions = usePageMotions(activeTemplate.config)

  // 모션 요소 렌더링
  const renderMotionElement = (elementId: string, children: React.ReactNode) => {
    const motion = motions[elementId as keyof typeof motions] as any
    if (!motion) return <div>{children}</div>

    return (
      <div
        key={elementId}
        data-motion-id={elementId}
        style={motion.style}
        onMouseEnter={() => setIsHovered(elementId)}
        onMouseLeave={() => setIsHovered(null)}
        onClick={() => {
          setIsClicked(elementId)
          setTimeout(() => setIsClicked(null), 150)
        }}
        className="transition-all duration-300"
      >
        {children}
      </div>
    )
  }

  // Hero Template Demo
  const HeroDemo = () => (
    <div className="space-y-8">
      {renderMotionElement('hero', (
        <div className="text-center py-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to HUA Motion</h1>
          <p className="text-xl opacity-90">페이지 레벨 모션의 힘을 경험해보세요</p>
        </div>
      ))}
      
      {renderMotionElement('title', (
        <h2 className="text-3xl font-bold text-center mb-4">Hero Section</h2>
      ))}
      
      {renderMotionElement('subtitle', (
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
          프리셋 기반의 자동 모션 애니메이션
        </p>
      ))}
      
      {renderMotionElement('button', (
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            시작하기
          </Button>
        </div>
      ))}
    </div>
  )

  // Card Template Demo
  const CardDemo = () => (
    <div className="space-y-6">
      {renderMotionElement('header', (
        <h2 className="text-2xl font-bold text-center mb-6">Card Grid</h2>
      ))}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderMotionElement('card1', (
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">카드 1</h3>
            <p className="text-gray-600 dark:text-gray-400">첫 번째 카드입니다.</p>
          </Card>
        ))}
        
        {renderMotionElement('card2', (
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">카드 2</h3>
            <p className="text-gray-600 dark:text-gray-400">두 번째 카드입니다.</p>
          </Card>
        ))}
        
        {renderMotionElement('card3', (
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">카드 3</h3>
            <p className="text-gray-600 dark:text-gray-400">세 번째 카드입니다.</p>
          </Card>
        ))}
      </div>
    </div>
  )

  // Form Template Demo
  const FormDemo = () => (
    <div className="space-y-6">
      {renderMotionElement('formTitle', (
        <h2 className="text-2xl font-bold text-center mb-6">Contact Form</h2>
      ))}
      
      <div className="max-w-md mx-auto space-y-4">
        {renderMotionElement('input1', (
          <input
            type="text"
            placeholder="이름을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ))}
        
        {renderMotionElement('input2', (
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ))}
        
        {renderMotionElement('submitButton', (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            제출하기
          </Button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">페이지 모션 시스템</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          <code>usePageMotions</code>를 사용한 페이지 레벨 프리셋과 템플릿 기반 모션
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Icon name="layers" className="w-4 h-4 mr-2" />
            프리셋 기반
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Icon name="mousePointer" className="w-4 h-4 mr-2" />
            인터랙션 지원
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Icon name="fileText" className="w-4 h-4 mr-2" />
            템플릿 시스템
          </Badge>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">템플릿 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key as keyof typeof templates)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTemplate === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <h4 className="font-medium mb-2">{template.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Demo */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">실시간 데모</h3>
        <div className="mb-4">
          <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/20">
            <Icon name="play" className="w-4 h-4 mr-2" />
            {activeTemplate.title}
          </Badge>
        </div>
        
        <div className="min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
          {selectedTemplate === 'hero' && <HeroDemo />}
          {selectedTemplate === 'card' && <CardDemo />}
          {selectedTemplate === 'form' && <FormDemo />}
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">코드 예시</h3>
        <pre className="text-sm overflow-x-auto">
          <code>{`// ${activeTemplate.title}
const motions = usePageMotions(${JSON.stringify(activeTemplate.config, null, 2)})

// 사용법
<div data-motion-id="hero" style={motions.hero?.style}>
  <h1>Hero Title</h1>
</div>`}</code>
        </pre>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="zap" className="w-5 h-5 mr-2 text-yellow-500" />
            자동 프리셋 적용
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            요소 타입에 따라 자동으로 적절한 모션 프리셋이 적용됩니다.
            별도의 설정 없이도 아름다운 애니메이션을 구현할 수 있습니다.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="mousePointer" className="w-5 h-5 mr-2 text-blue-500" />
            인터랙션 지원
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            호버, 클릭, 포커스 등의 사용자 인터랙션에 반응하는 모션을
            쉽게 구현할 수 있습니다.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="fileText" className="w-5 h-5 mr-2 text-green-500" />
            템플릿 시스템
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            자주 사용하는 페이지 레이아웃을 템플릿으로 만들어
            재사용할 수 있습니다.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon name="layers" className="w-5 h-5 mr-2 text-purple-500" />
            단계별 추상화
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            2단계 추상화로 페이지 전체의 모션을 일관되게 관리하고
            요소 간의 상호작용을 조율할 수 있습니다.
          </p>
        </Card>
      </div>
    </div>
  )
}
