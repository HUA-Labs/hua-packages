'use client'

import React from 'react'
import { Sparkle, Play, Check, ShareNetwork, Info, Warning } from '@phosphor-icons/react'

export default function PlaygroundPage() {
  const [code, setCode] = React.useState(`import { Card, CardContent, CardHeader, CardTitle } from '@hua-labs/hua-ux'

function BasicCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 카드</CardTitle>
      </CardHeader>
      <CardContent>
        <p>이것은 기본 카드 컴포넌트입니다.</p>
      </CardContent>
    </Card>
  )
}`)
  const [copied, setCopied] = React.useState('')
  const [selectedTemplate, setSelectedTemplate] = React.useState('basic-card')

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const templates = [
    {
      id: 'basic-card',
      name: '기본 카드',
      description: '간단한 카드 컴포넌트 예제',
      code: `import { Card, CardContent, CardHeader, CardTitle } from '@hua-labs/hua-ux'

function BasicCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 카드</CardTitle>
      </CardHeader>
      <CardContent>
        <p>이것은 기본 카드 컴포넌트입니다.</p>
      </CardContent>
    </Card>
  )
}`
    },
    {
      id: 'button-gallery',
      name: '버튼 갤러리',
      description: '다양한 버튼 스타일 예제',
      code: `import { Button } from '@hua-labs/hua-ux'

function ButtonGallery() {
  return (
    <div className="space-y-4">
      <Button variant="default">기본 버튼</Button>
      <Button variant="primary">프라이머리 버튼</Button>
      <Button variant="outline">아웃라인 버튼</Button>
      <Button variant="ghost">고스트 버튼</Button>
      <Button variant="destructive">삭제 버튼</Button>
    </div>
  )
}`
    },
    {
      id: 'form-example',
      name: '폼 예제',
      description: '간단한 폼 컴포넌트 조합',
      code: `import { Input, Button, Label, Form, FormField } from '@hua-labs/hua-ux'

function FormExample() {
  return (
    <Form className="space-y-4">
      <FormField>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="이메일을 입력하세요" />
      </FormField>
      <FormField>
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" type="password" placeholder="비밀번호를 입력하세요" />
      </FormField>
      <Button type="submit">로그인</Button>
    </Form>
  )
}`
    },
    {
      id: 'icon-example',
      name: '아이콘 예제',
      description: '아이콘과 버튼 조합',
      code: `import { Button, Icon } from '@hua-labs/hua-ux'

function IconExample() {
  return (
    <div className="space-y-4">
      <Button>
        <Icon name="heart" className="w-4 h-4 mr-2" />
        좋아요
      </Button>
      <Button variant="outline">
        <Icon name="download" className="w-4 h-4 mr-2" />
        다운로드
      </Button>
      <Button variant="ghost">
        <Icon name="share" className="w-4 h-4 mr-2" />
        공유
      </Button>
      <Button variant="ghost" size="sm">
        <Icon name="star" className="w-4 h-4" />
      </Button>
    </div>
  )
}`
    },
    {
      id: 'emotion-selector',
      name: '감정 선택기',
      description: '감정 표현 컴포넌트',
      code: `import { EmotionSelector } from '@hua-labs/hua-ux'

function EmotionExample() {
  const [selectedEmotion, setSelectedEmotion] = React.useState('')
  
  return (
    <div className="space-y-4">
      <h3>현재 감정을 선택해주세요</h3>
      <EmotionSelector
        selectedEmotion={selectedEmotion}
        onEmotionSelect={setSelectedEmotion}
        layout="grid"
        variant="button"
      />
    </div>
  )
}`
    },
    {
      id: 'accordion-example',
      name: '아코디언',
      description: '접을 수 있는 콘텐츠 영역',
      code: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@hua-labs/hua-ux'

function AccordionExample() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>첫 번째 항목</AccordionTrigger>
        <AccordionContent>
          첫 번째 항목의 내용입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>두 번째 항목</AccordionTrigger>
        <AccordionContent>
          두 번째 항목의 내용입니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setCode(template.code)
      setSelectedTemplate(templateId)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkle className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            플레이그라운드
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            HUA UI 컴포넌트를 실시간으로 실험하고 코드를 공유해보세요
          </p>
        </div>

        {/* 메인 에디터 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 코드 에디터 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                코드 에디터
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  실행
                </button>
                <button 
                  onClick={() => copyToClipboard(code, 'share')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {copied === 'share' ? (
                    <>
                      <Check className="w-4 h-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <ShareNetwork className="w-4 h-4" />
                      공유
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-slate-900 text-slate-100 p-4 font-mono text-sm resize-none focus:outline-none"
                placeholder="여기에 코드를 입력하세요..."
              />
            </div>
          </div>

          {/* 미리보기 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              미리보기
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-96 overflow-auto">
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">기본 카드</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    이것은 기본 카드 컴포넌트입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 정보 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 사용 가능한 컴포넌트 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5" />
              사용 가능한 컴포넌트
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Button</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Icon</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Card</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Input</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Label</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Form</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Accordion</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">EmotionSelector</span>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Warning className="w-5 h-5" />
              주의사항
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• 안전한 코드만 실행됩니다</li>
                <li>• 브라우저 환경에서만 작동합니다</li>
                <li>• 외부 라이브러리는 사용할 수 없습니다</li>
                <li>• 일부 고급 기능은 제한될 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 예제 템플릿 */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            예제 템플릿
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-white dark:bg-slate-800 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {template.description}
                </p>
                <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  클릭하여 선택 →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 