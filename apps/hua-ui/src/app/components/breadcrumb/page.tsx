"use client"

import React from "react"
import { Breadcrumb, Card, CardContent, Icon } from '@hua-labs/hua-ux'

export default function BreadcrumbPage() {
  const basicItems = [
    { label: "홈", href: "/" },
    { label: "상품", href: "/products" },
    { label: "전자제품", href: "/products/electronics" },
    { label: "스마트폰" }
  ]

  const iconItems = [
    { label: "홈", href: "/", icon: "home" as const },
    { label: "문서", href: "/docs", icon: "folder" as const },
    { label: "가이드", href: "/docs/guide", icon: "fileText" as const },
    { label: "시작하기", icon: "arrowRight" as const }
  ]

  const longItems = [
    { label: "홈", href: "/" },
    { label: "관리자", href: "/admin" },
    { label: "사용자 관리", href: "/admin/users" },
    { label: "사용자 목록", href: "/admin/users/list" },
    { label: "사용자 상세", href: "/admin/users/detail" },
    { label: "프로필 편집" }
  ]

  const customSeparatorItems = [
    { label: "홈", href: "/" },
    { label: "블로그", href: "/blog" },
    { label: "기술" }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Breadcrumb 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          브레드크럼 네비게이션 컴포넌트입니다. 
          사용자의 현재 위치를 표시하고 계층적 네비게이션을 제공합니다.
        </p>
      </div>

      {/* 기본 Breadcrumb */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Breadcrumb
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Breadcrumb items={basicItems} />
        </div>
      </div>

      {/* 아이콘이 있는 Breadcrumb */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          아이콘이 있는 Breadcrumb
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Breadcrumb items={iconItems} />
        </div>
      </div>

      {/* 긴 경로 Breadcrumb */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          긴 경로 Breadcrumb (최대 아이템 제한)
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                최대 4개 아이템 (기본)
              </h3>
              <Breadcrumb items={longItems} maxItems={4} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                최대 3개 아이템
              </h3>
              <Breadcrumb items={longItems} maxItems={3} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                모든 아이템 표시
              </h3>
              <Breadcrumb items={longItems} />
            </div>
          </div>
        </div>
      </div>

      {/* 커스텀 구분자 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          커스텀 구분자
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                슬래시 구분자
              </h3>
              <Breadcrumb 
                items={customSeparatorItems} 
                separator={<span className="text-gray-400 mx-2">/</span>}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                화살표 구분자
              </h3>
              <Breadcrumb 
                items={customSeparatorItems} 
                separator={<Icon name="arrowRight" className="text-gray-400 mx-2" />}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                점 구분자
              </h3>
              <Breadcrumb 
                items={customSeparatorItems} 
                separator={<span className="text-gray-400 mx-2">•</span>}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 홈 아이콘 설정 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          홈 아이콘 설정
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                홈 아이콘 표시 (기본)
              </h3>
              <Breadcrumb items={basicItems} showHomeIcon={true} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                홈 아이콘 숨김
              </h3>
              <Breadcrumb items={basicItems} showHomeIcon={false} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                커스텀 홈 라벨
              </h3>
              <Breadcrumb items={basicItems} homeLabel="메인" />
            </div>
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
                문서 사이트
              </h3>
              <div className="space-y-4">
                <Breadcrumb 
                  items={[
                    { label: "홈", href: "/", icon: "home" },
                    { label: "API", href: "/api", icon: "fileText" },
                    { label: "인증", href: "/api/auth", icon: "lock" },
                    { label: "JWT 토큰" }
                  ]}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  API 문서의 계층적 네비게이션
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                쇼핑몰
              </h3>
              <div className="space-y-4">
                <Breadcrumb 
                  items={[
                    { label: "홈", href: "/", icon: "home" },
                    { label: "의류", href: "/clothing", icon: "folder" },
                    { label: "남성복", href: "/clothing/men", icon: "user" },
                    { label: "셔츠" }
                  ]}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  상품 카테고리 네비게이션
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                관리자 대시보드
              </h3>
              <div className="space-y-4">
                <Breadcrumb 
                  items={[
                    { label: "대시보드", href: "/admin", icon: "barChart" },
                    { label: "사용자", href: "/admin/users", icon: "users" },
                    { label: "권한 관리", href: "/admin/users/permissions", icon: "shield" },
                    { label: "역할 편집" }
                  ]}
                  maxItems={4}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  관리자 페이지 네비게이션
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                블로그
              </h3>
              <div className="space-y-4">
                <Breadcrumb 
                  items={[
                    { label: "홈", href: "/", icon: "home" },
                    { label: "블로그", href: "/blog", icon: "bookOpen" },
                    { label: "기술", href: "/blog/tech", icon: "fileText" },
                    { label: "React" }
                  ]}
                  separator={<span className="text-gray-400 mx-2">/</span>}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  블로그 카테고리 네비게이션
                </p>
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
{`import { Breadcrumb } from '@hua-labs/hua-ux'

// 기본 브레드크럼
const items = [
  { label: "홈", href: "/" },
  { label: "상품", href: "/products" },
  { label: "전자제품", href: "/products/electronics" },
  { label: "스마트폰" }
]

<Breadcrumb items={items} />

// 아이콘이 있는 브레드크럼
const iconItems = [
  { label: "홈", href: "/", icon: "home" },
  { label: "문서", href: "/docs", icon: "file" },
  { label: "가이드", icon: "bookOpen" }
]

<Breadcrumb items={iconItems} />

// 최대 아이템 수 제한
<Breadcrumb items={longItems} maxItems={4} />

// 커스텀 구분자
<Breadcrumb 
  items={items} 
  separator={<span className="text-gray-400 mx-2">/</span>}
/>

// 홈 아이콘 설정
<Breadcrumb 
  items={items} 
  showHomeIcon={false}
  homeLabel="메인"
/>`}
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
                      <td className="p-2 font-mono text-sm">items</td>
                      <td className="p-2 font-mono text-sm">BreadcrumbItem[]</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">브레드크럼 아이템 배열 (필수)</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">separator</td>
                      <td className="p-2 font-mono text-sm">ReactNode</td>
                      <td className="p-2 font-mono text-sm">chevronRight 아이콘</td>
                      <td className="p-2 text-sm">아이템 간 구분자</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">maxItems</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">최대 표시 아이템 수</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">showHomeIcon</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">홈 아이콘 표시 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">homeLabel</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">&quot;홈&quot;</td>
                      <td className="p-2 text-sm">홈 라벨 텍스트</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">homeHref</td>
                      <td className="p-2 font-mono text-sm">string</td>
                      <td className="p-2 font-mono text-sm">&quot;/&quot;</td>
                      <td className="p-2 text-sm">홈 링크 주소</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                BreadcrumbItem 인터페이스
              </h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`interface BreadcrumbItem {
  label: string        // 표시될 텍스트
  href?: string        // 링크 주소 (선택사항)
  icon?: string        // 아이콘 이름 (선택사항)
  onClick?: () => void // 클릭 핸들러 (선택사항)
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 