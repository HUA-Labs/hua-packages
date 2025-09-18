"use client"

import React from "react"
import { Tooltip, Button, Card, CardContent, Icon } from "@hua-labs/ui"

export default function TooltipPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Tooltip 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          마우스 호버 시 추가 정보를 표시하는 툴팁 컴포넌트입니다. 
          사용자에게 컨텍스트 정보를 제공할 때 사용합니다.
        </p>
      </div>

      {/* 기본 Tooltip */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Tooltip
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="이것은 기본 툴팁입니다">
              <Button>기본 툴팁</Button>
            </Tooltip>
            
            <Tooltip content="이것은 긴 설명이 있는 툴팁입니다. 여러 줄로 표시될 수 있습니다.">
              <Button variant="outline">긴 툴팁</Button>
            </Tooltip>
            
            <Tooltip content="HTML이 포함된 툴팁입니다">
              <Button variant="ghost">HTML 툴팁</Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 위치별 Tooltip */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          위치별 Tooltip
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-center">
            <Tooltip content="위쪽 툴팁" position="top">
              <Button>Top</Button>
            </Tooltip>
            
            <Tooltip content="아래쪽 툴팁" position="bottom">
              <Button>Bottom</Button>
            </Tooltip>
            
            <Tooltip content="왼쪽 툴팁" position="left">
              <Button>Left</Button>
            </Tooltip>
            
            <Tooltip content="오른쪽 툴팁" position="right">
              <Button>Right</Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 스타일 변형 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          스타일 변형
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="기본 스타일 툴팁" variant="default">
              <Button>Default</Button>
            </Tooltip>
            
            <Tooltip content="라이트 스타일 툴팁" variant="light">
              <Button variant="outline">Light</Button>
            </Tooltip>
            
            <Tooltip content="다크 스타일 툴팁" variant="dark">
              <Button variant="ghost">Dark</Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 아이콘과 함께 사용 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          아이콘과 함께 사용
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-6">
            <Tooltip content="설정 메뉴">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Icon name="settings" className="w-6 h-6" />
              </button>
            </Tooltip>
            
            <Tooltip content="도움말 보기">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Icon name="helpCircle" className="w-6 h-6" />
              </button>
            </Tooltip>
            
            <Tooltip content="알림 확인">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Icon name="bell" className="w-6 h-6" />
              </button>
            </Tooltip>
            
            <Tooltip content="사용자 프로필">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Icon name="user" className="w-6 h-6" />
              </button>
            </Tooltip>
            
            <Tooltip content="검색하기">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Icon name="search" className="w-6 h-6" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          실제 사용 예시
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                폼 필드 도움말
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">이메일</label>
                  <Tooltip content="회원가입에 사용되는 이메일 주소를 입력해주세요">
                    <Icon name="helpCircle" className="w-4 h-4 text-slate-400" />
                  </Tooltip>
                </div>
                <input 
                  type="email" 
                  placeholder="이메일 입력"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">비밀번호</label>
                  <Tooltip content="8자 이상, 영문/숫자/특수문자 조합">
                    <Icon name="helpCircle" className="w-4 h-4 text-slate-400" />
                  </Tooltip>
                </div>
                <input 
                  type="password" 
                  placeholder="비밀번호 입력"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                액션 버튼
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tooltip content="파일을 업로드합니다">
                    <Button size="sm">
                      <Icon name="upload" className="w-4 h-4 mr-2" />
                      업로드
                    </Button>
                  </Tooltip>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip content="변경사항을 저장합니다">
                    <Button size="sm" variant="outline">
                      <Icon name="save" className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                  </Tooltip>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip content="작업을 되돌립니다">
                    <Button size="sm" variant="ghost">
                      <Icon name="undo" className="w-4 h-4 mr-2" />
                      되돌리기
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 사용법 가이드 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          사용법 가이드
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                기본 사용법
              </h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { Tooltip, Button } from '@hua-labs/ui'

// 기본 툴팁
<Tooltip content="툴팁 내용">
  <Button>호버해보세요</Button>
</Tooltip>

// 위치 지정
<Tooltip content="위쪽 툴팁" position="top">
  <Button>Top</Button>
</Tooltip>

// 스타일 변형
<Tooltip content="라이트 스타일" variant="light">
  <Button>Light</Button>
</Tooltip>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Props
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-2 font-semibold">Prop</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Default</th>
                      <th className="text-left p-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">content</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">툴팁에 표시할 내용 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">children</td>
                      <td className="p-2 font-mono text-sm">ReactNode</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">툴팁을 트리거할 요소 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">position</td>
                      <td className="p-2 font-mono text-sm">&apos;top&apos; | &apos;bottom&apos; | &apos;left&apos; | &apos;right&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;top&apos;</td>
                      <td className="p-2 text-sm">툴팁이 표시될 위치</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">variant</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos; | &apos;light&apos; | &apos;dark&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos;</td>
                      <td className="p-2 text-sm">툴팁 스타일 변형</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">delay</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">300</td>
                      <td className="p-2 text-sm">툴팁이 나타나기까지의 지연 시간 (ms)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">disabled</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">false</td>
                      <td className="p-2 text-sm">툴팁 비활성화 여부</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 