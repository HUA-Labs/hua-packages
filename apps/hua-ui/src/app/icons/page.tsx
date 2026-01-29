'use client'

import React from 'react'
import { MagnifyingGlass, Palette, Check } from '@phosphor-icons/react'

// SDK의 Icon 컴포넌트와 아이콘 카테고리 import
import { Icon, iconCategories } from '@hua-labs/hua-ux'

export default function IconsPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('all')
  const [iconSize, setIconSize] = React.useState(24)
  const [iconColor, setIconColor] = React.useState('default')
  const [copied, setCopied] = React.useState('')

  // SDK 아이콘 데이터 - 모든 아이콘 이름들
  const allSDKIcons: string[] = [
    'home', 'menu', 'close', 'search', 'settings', 'user', 'bell', 'heart', 'star', 'bookmark',
    'share', 'download', 'upload', 'edit', 'delete', 'add', 'remove', 'check', 'alertCircle', 'info',
    'warning', 'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight', 'arrowLeft', 'arrowRight', 'arrowUp', 'arrowDown',
    'message', 'phone', 'mail', 'send', 'reply', 'forward', 'copy', 'link', 'externalLink',
    'play', 'pause', 'skipBack', 'skipForward', 'volume', 'mute', 'music', 'video', 'image', 'camera',
    'mic', 'headphones', 'smile', 'frown', 'meh', 'laugh', 'angry', 'thumbsUp', 'thumbsDown',
    'chart', 'pieChart', 'trendingUp', 'trendingDown', 'activity', 'database', 'fileText', 'folder',
    'calendar', 'clock', 'timer', 'loader', 'refresh', 'success', 'error', 'helpCircle', 'eye', 'eyeOff',
    'lock', 'unlock', 'shield', 'zap', 'sun', 'moon', 'cloud', 'rain', 'creditCard', 'dollarSign',
    'euro', 'poundSterling', 'bitcoin', 'shoppingCart', 'shoppingBag', 'package', 'truck', 'store',
    'tag', 'percent', 'calculator', 'receipt', 'wallet', 'piggyBank', 'barChart', 'lineChart',
    'smartphone', 'tablet', 'monitor', 'laptop', 'wifi', 'wifiOff', 'bluetooth', 'signal',
    'battery', 'batteryCharging', 'volume1', 'volume2', 'vibrate', 'rotateCcw', 'rotateCw', 'maximize', 'minimize',
    'briefcase', 'building', 'building2', 'users', 'userPlus', 'userMinus', 'userCheck', 'userX', 'userCog',
    'file', 'fileImage', 'fileVideo', 'fileAudio', 'fileArchive', 'fileCode', 'fileSpreadsheet',
    'fileCheck', 'fileX', 'filePlus', 'fileMinus', 'fileEdit', 'fileSearch', 'shieldCheck', 'shieldAlert',
    'key', 'fingerprint', 'messageSquare', 'phoneCall', 'phoneIncoming', 'phoneOutgoing', 'phoneMissed',
    'phoneOff', 'mailOpen', 'mailCheck', 'mailX', 'mailPlus', 'mailMinus', 'mailSearch',
    'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'twitch', 'github', 'slack',
    'figma', 'chrome', 'codepen', 'codesandbox', 'navigation', 'navigation2', 'compass', 'globe',
    'globe2', 'flag', 'flagTriangleRight', 'save', 'saveAll', 'undo', 'redo', 'scissors', 'type',
    'bold', 'italic', 'underline', 'strikethrough', 'alignLeft', 'alignCenter', 'alignRight',
    'alignJustify', 'list', 'listOrdered', 'listChecks', 'heartOff', 'starOff', 'bookmarkPlus',
    'bookmarkMinus', 'circle', 'circleDot', 'circleSlash', 'cloudSnow', 'cloudLightning', 'cloudFog',
    'wind', 'thermometer', 'droplets', 'umbrella', 'calendarDays', 'calendarCheck', 'calendarX',
    'calendarPlus', 'calendarMinus', 'calendarClock', 'palette', 'bookOpen', 'layers', 'mousePointer',
    'toggleLeft', 'square', 'sidebar', 'gauge', 'sparkles'
  ]

  const copyToClipboard = (iconName: string) => {
    navigator.clipboard.writeText(iconName)
    setCopied(iconName)
    setTimeout(() => setCopied(''), 2000)
  }

  // 카테고리별 아이콘 필터링
  const getFilteredIcons = () => {
    if (activeTab === 'all') {
      return allSDKIcons.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    const categoryIcons = iconCategories[activeTab as keyof typeof iconCategories] || []
    return categoryIcons.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredIcons = getFilteredIcons()

  const colorVariants = {
    default: 'text-slate-900 dark:text-slate-100',
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-slate-600 dark:text-slate-300',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  }

  // 카테고리 탭 생성
  const tabCategories = [
    { value: 'all', label: '전체', count: allSDKIcons.length },
    ...Object.entries(iconCategories).map(([category, icons]) => ({
      value: category,
      label: getCategoryLabel(category),
      count: icons.length
    }))
  ]

  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      navigation: '네비게이션',
      actions: '액션',
      communication: '커뮤니케이션',
      media: '미디어',
      emotions: '감정',
      feedback: '피드백',
      data: '데이터',
      status: '상태',
      weather: '날씨',
      finance: '금융',
      business: '비즈니스',
      files: '파일',
      social: '소셜',
      mobile: '모바일',
      editing: '편집',
      time: '시간'
    }
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            아이콘 갤러리
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            HUA UI SDK에서 사용할 수 있는 모든 아이콘들을 확인하고 검색해보세요
          </p>
        </div>

        {/* 컨트롤 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            컨트롤
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            아이콘 크기, 색상, 검색, 카테고리 등을 조정할 수 있습니다
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                검색
              </label>
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="아이콘 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 크기 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                크기: {iconSize}px
              </label>
              <input
                type="range"
                min="16"
                max="48"
                value={iconSize}
                onChange={(e) => setIconSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 색상 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                색상
              </label>
              <select
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="default">기본</option>
                <option value="primary">주요</option>
                <option value="secondary">보조</option>
                <option value="success">성공</option>
                <option value="warning">경고</option>
                <option value="error">오류</option>
              </select>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                카테고리
              </label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {tabCategories.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label} ({tab.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabCategories.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* 아이콘 그리드 */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
          {filteredIcons.map((iconName) => (
            <div
              key={iconName}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group relative"
              onClick={() => copyToClipboard(iconName)}
            >
              <div className="flex items-center justify-center mb-2">
                {React.createElement(Icon as any, {
                  name: iconName,
                  size: iconSize, 
                  variant: iconColor
                })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {iconName}
              </div>
              {copied === iconName && (
                <div className="absolute inset-0 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 결과 없음 */}
        {filteredIcons.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlass className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
              검색 결과가 없습니다
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              다른 검색어를 시도해보세요
            </p>
          </div>
        )}

        {/* 통계 */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>SDK 아이콘 {filteredIcons.length}개 / 전체 {allSDKIcons.length}개</p>
          <p className="mt-2 text-xs">
            현재 카테고리: {tabCategories.find(tab => tab.value === activeTab)?.label}
          </p>
        </div>
      </div>
    </div>
  )
} 