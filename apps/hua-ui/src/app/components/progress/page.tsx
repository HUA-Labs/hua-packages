"use client"

import React, { useState, useEffect } from "react"
import { 
  Progress, 
  ProgressSuccess, 
  ProgressWarning, 
  ProgressError, 
  ProgressInfo,
  ProgressCard,
  ProgressGroup,
  Card, 
  CardContent,
  Button,
  ComponentLayout
} from "@hua-labs/ui"

export default function ProgressPage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <ComponentLayout
      title="Progress"
      description="작업 진행률을 표시하는 프로그레스 바 컴포넌트입니다."
      prevPage={{ title: "Avatar", href: "/components/avatar" }}
      nextPage={{ title: "Popover", href: "/components/popover" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Progress" }
      ]}
    >
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Progress</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            작업 진행률을 표시하는 프로그레스 바 컴포넌트입니다.
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 Progress</h2>
            <div className="space-y-4">
              <Progress value={progress} showValue />
              <Progress value={60} label="업로드 진행률" showValue />
              <Progress value={85} description="파일 업로드 중..." />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">크기별 Progress</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Small</h3>
                <Progress value={75} size="sm" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Medium (기본)</h3>
                <Progress value={75} size="md" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Large</h3>
                <Progress value={75} size="lg" showValue />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">변형별 Progress</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Default</h3>
                <Progress value={75} variant="default" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Success</h3>
                <Progress value={75} variant="success" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Warning</h3>
                <Progress value={75} variant="warning" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Error</h3>
                <Progress value={75} variant="error" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Info</h3>
                <Progress value={75} variant="info" showValue />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Glass</h3>
                <Progress value={75} variant="glass" showValue />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">파일 업로드</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">document.pdf</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">75%</span>
                  </div>
                  <Progress value={75} variant="success" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">업로드 중...</p>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">시스템 상태</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">CPU 사용률</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">45%</span>
                  </div>
                  <Progress value={45} variant="info" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">메모리 사용률</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">80%</span>
                  </div>
                  <Progress value={80} variant="warning" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">디스크 사용률</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">95%</span>
                  </div>
                  <Progress value={95} variant="error" />
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">설치 진행률</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">패키지 다운로드</span>
                    <span className="text-sm text-green-600 dark:text-green-400">완료</span>
                  </div>
                  <Progress value={100} variant="success" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">설치 중</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">60%</span>
                  </div>
                  <Progress value={60} variant="default" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900 dark:text-white">검증</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">대기 중</span>
                  </div>
                  <Progress value={0} variant="default" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Props</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Progress</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900">
                        <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Prop</th>
                        <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Type</th>
                        <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Default</th>
                        <th className="border border-slate-200 dark:border-slate-700 p-2 text-left text-slate-900 dark:text-white">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">value</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">number</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">0</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">진행률 값 (0-100)</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">size</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;md&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">프로그레스 바 크기</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">variant</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;default&quot; | &quot;success&quot; | &quot;warning&quot; | &quot;error&quot; | &quot;info&quot; | &quot;glass&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;default&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">프로그레스 바 스타일</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">showValue</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">boolean</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">false</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">진행률 값 표시 여부</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">label</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">프로그레스 바 라벨</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">description</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">프로그레스 바 설명</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">className</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">추가 CSS 클래스</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">사용 가이드</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">기본 사용법</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`import { Progress } from "@hua-labs/ui"

// 기본 프로그레스 바
<Progress value={50} />

// 값 표시
<Progress value={75} showValue />

// 라벨과 설명
<Progress 
  value={60} 
  label="업로드 진행률" 
  description="파일 업로드 중..." 
/>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">크기 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 크기별 프로그레스 바
<Progress value={75} size="sm" showValue />
<Progress value={75} size="md" showValue />
<Progress value={75} size="lg" showValue />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">변형 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 상태별 프로그레스 바
<Progress value={75} variant="default" showValue />
<Progress value={75} variant="success" showValue />
<Progress value={75} variant="warning" showValue />
<Progress value={75} variant="error" showValue />
<Progress value={75} variant="info" showValue />
<Progress value={75} variant="glass" showValue />`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 파일 업로드
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm">document.pdf</span>
    <span className="text-sm">75%</span>
  </div>
  <Progress value={75} variant="success" />
  <p className="text-xs text-gray-600">업로드 중...</p>
</div>

// 시스템 상태
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm">CPU 사용률</span>
    <span className="text-sm">45%</span>
  </div>
  <Progress value={45} variant="info" />
</div>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ComponentLayout>
  )
} 