'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Icon } from '@hua-labs/ui'

export default function PlaygroundPage() {
  const [code, setCode] = useState(`<Button>
  <Icon name="heart" size={20} className="mr-2" />
  좋아요
</Button>`)

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="code" size={32} className="text-primary" />
              <h1 className="text-xl font-bold">HUA UI - 플레이그라운드</h1>
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
              플레이그라운드
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              HUA UI 컴포넌트를 실시간으로 체험하고 코드를 실험해보세요.
            </p>
          </div>

          {/* 플레이그라운드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 코드 에디터 */}
            <Card>
              <CardHeader>
                <CardTitle>코드</CardTitle>
                <CardDescription>
                  컴포넌트 코드를 편집해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md resize-none"
                  placeholder="컴포넌트 코드를 입력하세요..."
                />
              </CardContent>
            </Card>

            {/* 프리뷰 */}
            <Card>
              <CardHeader>
                <CardTitle>프리뷰</CardTitle>
                <CardDescription>
                  코드 실행 결과를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-md p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <Icon name="play" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      코드를 입력하면 여기에 결과가 표시됩니다
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 예제 컴포넌트들 */}
          <Card>
            <CardHeader>
              <CardTitle>예제 컴포넌트</CardTitle>
              <CardDescription>
                사용 가능한 컴포넌트들의 예제입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 버튼 예제 */}
              <div>
                <h4 className="font-medium mb-3">Button 컴포넌트</h4>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* 아이콘 예제 */}
              <div>
                <h4 className="font-medium mb-3">Icon 컴포넌트</h4>
                <div className="flex flex-wrap gap-4">
                  <Icon name="heart" size={24} className="text-red-500" />
                  <Icon name="star" size={24} className="text-yellow-500" />
                  <Icon name="check" size={24} className="text-green-500" />
                  <Icon name="alert-circle" size={24} className="text-blue-500" />
                  <Icon name="settings" size={24} className="text-gray-500" />
                </div>
              </div>

              {/* 카드 예제 */}
              <div>
                <h4 className="font-medium mb-3">Card 컴포넌트</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>카드 제목</CardTitle>
                      <CardDescription>카드 설명</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>카드 내용입니다.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Icon name="sparkles" size={32} className="mx-auto mb-2 text-primary" />
                        <h3 className="font-medium">간단한 카드</h3>
                        <p className="text-sm text-muted-foreground">내용이 있는 카드입니다.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 