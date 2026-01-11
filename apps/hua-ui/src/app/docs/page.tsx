'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Gear, Palette, FileText, DownloadSimple, Copy, Sparkle } from '@phosphor-icons/react'

export default function DocsPage() {
  const [activeTab, setActiveTab] = React.useState('getting-started')
  const [copied, setCopied] = React.useState('')

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const tabs = [
    { id: 'getting-started', name: '시작하기', icon: Play },
    { id: 'components', name: '컴포넌트', icon: Gear },
    { id: 'styling', name: '스타일링', icon: Palette },
    { id: 'examples', name: '예제', icon: FileText }
  ]

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* 문서 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            문서
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            @hua-labs/hua-ux SDK의 완전한 사용법 가이드
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center justify-center mb-8 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'getting-started' && (
            <div className="space-y-8">
              {/* 빠른 시작 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  빠른 시작
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  @hua-labs/hua-ux를 프로젝트에 추가하고 첫 번째 컴포넌트를 만들어보세요
                </p>
              </section>

              {/* 설치하기 */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <DownloadSimple className="w-5 h-5" />
                  설치하기
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  터미널에서 다음 명령어를 실행하세요:
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @hua-labs/hua-ux</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard('npm install @hua-labs/hua-ux', 'install')}
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied === 'install' ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </section>

              {/* 기본 사용법 */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                  기본 사용법
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  컴포넌트를 import하고 바로 사용할 수 있습니다:
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`import { Button, Card } from '@hua-labs/hua-ux'

function App() {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">안녕하세요!</h1>
      <Button variant="default">클릭하세요</Button>
    </Card>
  )
}`}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`import { Button, Card } from '@hua-labs/hua-ux'

function App() {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">안녕하세요!</h1>
      <Button variant="default">클릭하세요</Button>
    </Card>
  )
}`, 'usage')}
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied === 'usage' ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </section>

              {/* 빠른 시작 예제 */}
              <section>
                <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkle className="w-5 h-5" />
                  빠른 시작 예제
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 간단한 카드 */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                      간단한 카드
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      기본적인 카드 컴포넌트 사용법
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <span>❤️</span>
                          좋아요
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 아이콘 버튼 */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700 p-6">
                    <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                      아이콘 버튼
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      아이콘이 포함된 버튼 예제
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <DownloadSimple className="w-4 h-4" />
                          다운로드
                        </button>
                        <button className="p-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                          <DownloadSimple className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="text-center py-12">
              <Gear className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                컴포넌트 문서
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                각 컴포넌트의 상세한 사용법과 API 문서를 준비 중입니다.
              </p>
            </div>
          )}

          {activeTab === 'styling' && (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                스타일링 가이드
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                테마 커스터마이징과 스타일링 가이드를 준비 중입니다.
              </p>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                예제 모음
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                다양한 사용 사례와 예제를 준비 중입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
