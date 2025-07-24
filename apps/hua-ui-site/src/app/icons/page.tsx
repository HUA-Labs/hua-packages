'use client'

import { useState } from 'react'
import { Icon, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hua-labs/ui'
import { iconCategories } from '@hua-labs/ui'

export default function IconsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [iconSize, setIconSize] = useState(24)
  const [iconColor, setIconColor] = useState('default')

  // 탭 변경 시 검색어 초기화
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchTerm('') // 검색어 초기화
  }

  const allIcons = Object.entries(iconCategories).flatMap(([category, icons]) => icons.map(icon => ({ name: icon, category })))
  const filteredIcons = allIcons.filter(({ name, category }) => {
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeTab === 'all' || category === activeTab
    return matchesSearch && matchesCategory
  })

  const colorVariants = {
    default: 'text-gray-900 dark:text-gray-100',
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-300',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400'
  }

  // 탭 카테고리 정의
  const tabCategories = [
    { value: 'all', label: '전체', count: allIcons.length },
    ...Object.entries(iconCategories).map(([category, icons]) => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      count: icons.length
    }))
  ]

  const renderIconGrid = (icons: Array<{ name: string, category?: string }>) => (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-8 gap-3 md:gap-4">
      {icons.map((icon) => (
        <Card key={icon.name} className="aspect-square p-2 md:p-4 text-center hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardContent className="p-0 h-full flex flex-col items-center justify-between">
            <div className="flex-1 flex items-center justify-center">
              <Icon 
                name={icon.name} 
                size={iconSize} 
                className={colorVariants[iconColor as keyof typeof colorVariants]}
              />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {icon.name}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="sparkles" size={32} className="text-primary" />
              <h1 className="text-xl font-bold">HUA UI - 아이콘</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 제목 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              아이콘 갤러리
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              HUA UI에서 사용할 수 있는 모든 아이콘들을 확인하고 검색해보세요.
            </p>
          </div>

          {/* 컨트롤 */}
          <Card>
            <CardHeader>
              <CardTitle>컨트롤</CardTitle>
              <CardDescription>
                아이콘 크기, 색상, 검색 등을 조정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 검색 */}
              <div>
                <label className="text-sm font-medium mb-2 block">검색</label>
                <input
                  type="text"
                  placeholder="아이콘 이름을 입력하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background"
                />
              </div>

              {/* 컨트롤 버튼들 */}
              <div className="flex flex-wrap gap-4">
                {/* 크기 조절 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">크기</label>
                  <div className="flex gap-2">
                    {[16, 20, 24, 32].map((size) => (
                      <Button
                        key={size}
                        variant={iconSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIconSize(size)}
                      >
                        {size}px
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 색상 선택 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">색상</label>
                  <div className="flex gap-2">
                    {Object.keys(colorVariants).map((color) => (
                      <Button
                        key={color}
                        variant={iconColor === color ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIconColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 탭 네비게이션 */}
          <div className="flex justify-center">
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
              {tabCategories.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* 아이콘 그리드 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? '전체 아이콘' : tabCategories.find(t => t.value === activeTab)?.label}
                <span className="text-sm text-muted-foreground ml-2">
                  ({filteredIcons.length}개)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredIcons.length > 0 ? (
                renderIconGrid(filteredIcons)
              ) : (
                <div className="text-center py-12">
                  <Icon name="search" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    검색 결과가 없습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 