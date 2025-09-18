"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback, Card, CardContent, ComponentLayout } from "@hua-labs/ui"

export default function AvatarPage() {
  return (
    <ComponentLayout
      title="Avatar"
      description="사용자 프로필 이미지를 표시하는 아바타 컴포넌트입니다."
      prevPage={{ title: "Badge", href: "/components/badge" }}
      nextPage={{ title: "Progress", href: "/components/progress" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Avatar" }
      ]}
    >
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Avatar</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            사용자 프로필 이미지를 표시하는 아바타 컴포넌트입니다.
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">기본 Avatar</h2>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자" />
                <AvatarFallback>사용자</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>김</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>이</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>박</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">크기별 Avatar</h2>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Small</span>
                <Avatar size="sm">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자" />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Medium</span>
                <Avatar size="md">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자" />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Large</span>
                <Avatar size="lg">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자" />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">변형별 Avatar</h2>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Default</span>
                <Avatar variant="default">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자" />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Glass</span>
                <Avatar variant="glass">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자" />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Fallback 예시</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">이미지 로드 실패</h3>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/invalid-image.jpg" alt="사용자" />
                    <AvatarFallback>사용자</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="/another-invalid.jpg" alt="김개발" />
                    <AvatarFallback>김</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="/yet-another-invalid.jpg" alt="이디자이너" />
                    <AvatarFallback>이</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">이름 이니셜</h3>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>김</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>이</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>박</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>최</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>정</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">아이콘 Fallback</h3>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>👨‍💻</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>👩‍🎨</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>🤖</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">실제 사용 예시</h2>
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">사용자 프로필</h3>
                <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="김개발" />
                    <AvatarFallback>김</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">김개발</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">프론트엔드 개발자</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">마지막 활동: 5분 전</p>
                  </div>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">팀 멤버 목록</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" alt="이디자이너" />
                      <AvatarFallback>이</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">이디자이너</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">UI/UX 디자이너</p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">온라인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="박백엔드" />
                      <AvatarFallback>박</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">박백엔드</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">백엔드 개발자</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">오프라인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>최</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">최테스터</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">QA 엔지니어</p>
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">자리 비움</span>
                  </div>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-3 text-slate-900 dark:text-white">댓글 시스템</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar size="sm">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="사용자1" />
                      <AvatarFallback>사용자1</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">김개발</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">2시간 전</span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-white">정말 유용한 정보네요! 감사합니다.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>사용자2</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">이디자이너</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">1시간 전</span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-white">디자인도 정말 예쁘네요!</p>
                    </div>
                  </div>
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
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Avatar</h3>
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
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">size</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;md&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">아바타 크기</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">variant</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;default&quot; | &quot;glass&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">&quot;default&quot;</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">아바타 스타일 변형</td>
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
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">AvatarImage</h3>
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
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">src</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">이미지 URL</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">alt</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">이미지 대체 텍스트</td>
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
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">AvatarFallback</h3>
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
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">className</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">string</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">추가 CSS 클래스</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">children</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">ReactNode</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                        <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">폴백 내용</td>
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
{`import { Avatar, AvatarImage, AvatarFallback } from "@hua-labs/ui"

// 기본 아바타
<Avatar>
  <AvatarImage src="/user.jpg" alt="사용자" />
  <AvatarFallback>사용자</AvatarFallback>
</Avatar>

// 이미지 없이 폴백만
<Avatar>
  <AvatarFallback>김</AvatarFallback>
</Avatar>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">크기 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 크기별 아바타
<Avatar size="sm">
  <AvatarImage src="/user.jpg" alt="사용자" />
  <AvatarFallback>사용자</AvatarFallback>
</Avatar>

<Avatar size="md">
  <AvatarImage src="/user.jpg" alt="사용자" />
  <AvatarFallback>사용자</AvatarFallback>
</Avatar>

<Avatar size="lg">
  <AvatarImage src="/user.jpg" alt="사용자" />
  <AvatarFallback>사용자</AvatarFallback>
</Avatar>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">변형 설정</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 기본 스타일
<Avatar variant="default">
  <AvatarImage src="/user.jpg" alt="사용자" />
  <AvatarFallback>사용자</AvatarFallback>
</Avatar>

// 글래스 스타일
<Avatar variant="glass">
  <AvatarImage src="/user.jpg" alt="사용자" />
  <AvatarFallback>사용자</AvatarFallback>
</Avatar>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">폴백 옵션</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 이름 이니셜
<Avatar>
  <AvatarFallback>김</AvatarFallback>
</Avatar>

// 이모지
<Avatar>
  <AvatarFallback>👤</AvatarFallback>
</Avatar>

// 아이콘
<Avatar>
  <AvatarFallback>
    <UserIcon className="w-4 h-4" />
  </AvatarFallback>
</Avatar>`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 사용자 프로필
<div className="flex items-center gap-4">
  <Avatar size="lg">
    <AvatarImage src="/user.jpg" alt="김개발" />
    <AvatarFallback>김</AvatarFallback>
  </Avatar>
  <div>
    <h4 className="font-medium">김개발</h4>
    <p className="text-sm text-gray-600">프론트엔드 개발자</p>
  </div>
</div>

// 댓글 시스템
<div className="flex gap-3">
  <Avatar size="sm">
    <AvatarImage src="/user.jpg" alt="사용자" />
    <AvatarFallback>사용자</AvatarFallback>
  </Avatar>
  <div>
    <p className="text-sm">댓글 내용...</p>
  </div>
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