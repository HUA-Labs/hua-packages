'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Panel, 
  Icon,
  Badge,
  Action,
  Input
} from '@hua-labs/ui'

export default function ComponentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)

  // 로컬 스토리지에서 북마크 불러오기
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('component-bookmarks')
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }, [])

  // 북마크 저장
  const saveBookmarks = (newBookmarks: string[]) => {
    setBookmarks(newBookmarks)
    localStorage.setItem('component-bookmarks', JSON.stringify(newBookmarks))
  }

  // 북마크 토글
  const toggleBookmark = (componentName: string) => {
    const newBookmarks = bookmarks.includes(componentName)
      ? bookmarks.filter(name => name !== componentName)
      : [...bookmarks, componentName]
    saveBookmarks(newBookmarks)
  }

  const componentCategories = [
    {
      name: '기본 컴포넌트',
      description: '가장 기본이 되는 UI 컴포넌트들',
      components: [
        { name: 'Action', description: '액션 컴포넌트', href: '/components/action', status: 'stable' },
        { name: 'Input', description: '입력 필드 컴포넌트', href: '/components/input', status: 'stable' },
        { name: 'Label', description: '라벨 컴포넌트', href: '/components/label', status: 'stable' },
        { name: 'Textarea', description: '텍스트 영역 컴포넌트', href: '/components/textarea', status: 'stable' },
        { name: 'Select', description: '선택 컴포넌트', href: '/components/select', status: 'stable' },
        { name: 'Checkbox', description: '체크박스 컴포넌트', href: '/components/checkbox', status: 'stable' },
        { name: 'Radio', description: '라디오 버튼 컴포넌트', href: '/components/radio', status: 'stable' },
        { name: 'Switch', description: '스위치 컴포넌트', href: '/components/switch', status: 'stable' },
        { name: 'Panel', description: '패널 레이아웃 컴포넌트', href: '/components/panel', status: 'stable' },
        { name: 'Badge', description: '배지 컴포넌트', href: '/components/badge', status: 'stable' },
        { name: 'Avatar', description: '아바타 컴포넌트', href: '/components/avatar', status: 'stable' },
        { name: 'Form', description: '폼 컴포넌트', href: '/components/form', status: 'stable' },
        { name: 'Divider', description: '구분선 컴포넌트', href: '/components/divider', status: 'stable' },
      ]
    },
    {
      name: '네비게이션',
      description: '사이트 탐색을 위한 컴포넌트들',
      components: [
        { name: 'Menu', description: '메뉴 컴포넌트', href: '/components/menu', status: 'stable' },
        { name: 'Breadcrumb', description: '브레드크럼 컴포넌트', href: '/components/breadcrumb', status: 'stable' },
        { name: 'Pagination', description: '페이지네이션 컴포넌트', href: '/components/pagination', status: 'stable' },
        { name: 'Navigation', description: '네비게이션 컴포넌트', href: '/components/navigation', status: 'stable' },
      ]
    },
    {
      name: '피드백',
      description: '사용자에게 정보를 전달하는 컴포넌트들',
      components: [
        { name: 'Alert', description: '알림 컴포넌트', href: '/components/alert', status: 'stable' },
        { name: 'Toast', description: '토스트 메시지 컴포넌트', href: '/components/toast', status: 'stable' },
        { name: 'Tooltip', description: '툴팁 컴포넌트', href: '/components/tooltip', status: 'stable' },
        { name: 'Progress', description: '진행률 컴포넌트', href: '/components/progress', status: 'stable' },
        { name: 'LoadingSpinner', description: '로딩 스피너 컴포넌트', href: '/components/loading-spinner', status: 'stable' },
      ]
    },
    {
      name: '오버레이',
      description: '모달, 팝오버 등의 오버레이 컴포넌트들',
      components: [
        { name: 'Modal', description: '모달 컴포넌트', href: '/components/modal', status: 'stable' },
        { name: 'Popover', description: '팝오버 컴포넌트', href: '/components/popover', status: 'stable' },
        { name: 'Drawer', description: '드로어 컴포넌트', href: '/components/drawer', status: 'stable' },
        { name: 'BottomSheet', description: '바텀시트 컴포넌트', href: '/components/bottom-sheet', status: 'stable' },
      ]
    },
    {
      name: '데이터 표시',
      description: '데이터를 표시하는 컴포넌트들',
      components: [
        { name: 'Table', description: '테이블 컴포넌트', href: '/components/table', status: 'beta' },
        { name: 'Skeleton', description: '스켈레톤 로딩 컴포넌트', href: '/components/skeleton', status: 'stable' },
        { name: 'Accordion', description: '아코디언 컴포넌트', href: '/components/accordion', status: 'stable' },
      ]
    },
    {
      name: '감정 표현',
      description: '감정 분석 및 표현을 위한 컴포넌트들',
      components: [
        { name: 'EmotionButton', description: '감정 버튼 컴포넌트', href: '/components/emotion-button', status: 'stable' },
        { name: 'EmotionSelector', description: '감정 선택 컴포넌트', href: '/components/emotion-selector', status: 'stable' },
        { name: 'EmotionMeter', description: '감정 측정 컴포넌트', href: '/components/emotion-meter', status: 'stable' },
        { name: 'EmotionAnalysis', description: '감정 분석 컴포넌트', href: '/components/emotion-analysis', status: 'beta' },
      ]
    },
    {
      name: '유틸리티',
      description: '편의를 위한 유틸리티 컴포넌트들',
      components: [
        { name: 'ThemeToggle', description: '테마 토글 컴포넌트', href: '/components/theme-toggle', status: 'stable' },
        { name: 'LanguageToggle', description: '언어 토글 컴포넌트', href: '/components/language-toggle', status: 'stable' },
        { name: 'ScrollToTop', description: '맨 위로 스크롤 컴포넌트', href: '/components/scroll-to-top', status: 'stable' },
        { name: 'Scrollbar', description: '커스터마이징 가능한 스크롤바 컴포넌트', href: '/components/scrollbar', status: 'stable' },
        { name: 'PageTransition', description: '페이지 전환 컴포넌트', href: '/components/page-transition', status: 'beta' },
      ]
    }
  ]

  // 모든 컴포넌트를 평면화
  const allComponents = componentCategories.flatMap(category => 
    category.components.map(component => ({
      ...component,
      category: category.name
    }))
  )

  // 검색 필터링
  const filteredComponents = allComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 북마크된 컴포넌트만 필터링
  const bookmarkedComponents = allComponents.filter(component =>
    bookmarks.includes(component.name)
  )

  // 표시할 컴포넌트 결정
  const displayComponents = showBookmarks ? bookmarkedComponents : filteredComponents

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'success'
      case 'beta': return 'warning'
      case 'alpha': return 'error'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'stable': return '안정'
      case 'beta': return '베타'
      case 'alpha': return '알파'
      default: return status
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {React.createElement(Icon as any, {
              name: "layers",
              className: "w-8 h-8 text-blue-600"
            })}
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            컴포넌트 라이브러리
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            HUA UI SDK에서 제공하는 모든 컴포넌트들을 확인하고 사용해보세요
          </p>
        </div>

        {/* 검색 및 북마크 토글 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Input
            placeholder="컴포넌트 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Action
            onClick={() => setShowBookmarks(!showBookmarks)}
            variant={showBookmarks ? 'secondary' : 'outline'}
            className="w-full sm:w-auto"
          >
            {showBookmarks ? '북마크 숨기기' : '북마크 보기'}
          </Action>
        </div>

        {/* 컴포넌트 카테고리 */}
        {showBookmarks ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              북마크된 컴포넌트 ({bookmarkedComponents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedComponents.map((component) => (
                <div key={component.name} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{component.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(component.status) as any}>
                          {getStatusText(component.status)}
                        </Badge>
                        <button
                          onClick={() => toggleBookmark(component.name)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <Icon name="star" className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {component.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {component.category}
                    </p>
                  </div>
                  <div>
                    <a href={component.href}>
                      <button className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        자세히 보기
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {componentCategories.map((category) => {
              const categoryComponents = displayComponents.filter(
                component => component.category === category.name
              )
              
              if (categoryComponents.length === 0) return null
              
              return (
                <div key={category.name} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                      {category.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.components.map((component) => (
                      <div key={component.name} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{component.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(component.status) as any}>
                                {getStatusText(component.status)}
                              </Badge>
                              <button
                                onClick={() => toggleBookmark(component.name)}
                                className={`transition-colors ${
                                  bookmarks.includes(component.name)
                                    ? 'text-yellow-500 hover:text-yellow-600'
                                    : 'text-slate-400 hover:text-yellow-500'
                                }`}
                              >
                                <Icon name="star" className={`w-4 h-4 ${bookmarks.includes(component.name) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {component.description}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <a href={component.href} className="flex-1">
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                              자세히 보기
                            </button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 통계 */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              컴포넌트 통계
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {componentCategories.reduce((acc, cat) => acc + cat.components.length, 0)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">총 컴포넌트</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {componentCategories.reduce((acc, cat) => 
                    acc + cat.components.filter(c => c.status === 'stable').length, 0
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">안정 버전</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {componentCategories.reduce((acc, cat) => 
                    acc + cat.components.filter(c => c.status === 'beta').length, 0
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">베타 버전</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 