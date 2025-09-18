"use client"

import React, { useState } from "react"
import { Menu, MenuItem, MenuSeparator, MenuLabel, Button, Card, CardContent, Icon } from "@hua-labs/ui"
import { ComponentLayout } from "@hua-labs/ui"

export default function MenuPage() {
  const [activeItem, setActiveItem] = useState<string>("")

  return (
    <ComponentLayout
      title="Menu"
      description="메뉴 컴포넌트입니다. 드롭다운 메뉴와 컨텍스트 메뉴를 지원합니다."
      prevPage={{ title: "Accordion", href: "/components/accordion" }}
      nextPage={{ title: "Popover", href: "/components/popover" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Menu" }
      ]}
    >
      {/* 기본 Menu */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Menu
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">세로 메뉴</h3>
              <Menu>
                <MenuItem>프로필 보기</MenuItem>
                <MenuItem>설정</MenuItem>
                <MenuItem>도움말</MenuItem>
                <MenuSeparator />
                <MenuItem>로그아웃</MenuItem>
              </Menu>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">가로 메뉴</h3>
              <Menu variant="horizontal">
                <MenuItem>홈</MenuItem>
                <MenuItem>상품</MenuItem>
                <MenuItem>서비스</MenuItem>
                <MenuItem>문의</MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      {/* 아이콘이 있는 Menu */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          아이콘이 있는 Menu
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-wrap gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">세로 메뉴</h3>
              <Menu>
                <MenuItem icon={<Icon name="user" className="w-4 h-4" />}>
                  프로필 보기
                </MenuItem>
                <MenuItem icon={<Icon name="settings" className="w-4 h-4" />}>
                  설정
                </MenuItem>
                <MenuItem icon={<Icon name="helpCircle" className="w-4 h-4" />}>
                  도움말
                </MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Icon name="add" className="w-4 h-4" />}>
                  새 파일
                </MenuItem>
                <MenuItem icon={<Icon name="delete" className="w-4 h-4" />}>
                  휴지통
                </MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Icon name="close" className="w-4 h-4" />}>
                  로그아웃
                </MenuItem>
              </Menu>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">가로 메뉴</h3>
              <Menu variant="horizontal">
                <MenuItem icon={<Icon name="home" className="w-4 h-4" />}>
                  홈
                </MenuItem>
                <MenuItem icon={<Icon name="star" className="w-4 h-4" />}>
                  상품
                </MenuItem>
                <MenuItem icon={<Icon name="settings" className="w-4 h-4" />}>
                  서비스
                </MenuItem>
                <MenuItem icon={<Icon name="mail" className="w-4 h-4" />}>
                  문의
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      {/* 크기별 Menu */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 Menu
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">작은 크기</h3>
              <Menu size="sm">
                <MenuItem>작은 메뉴 1</MenuItem>
                <MenuItem>작은 메뉴 2</MenuItem>
                <MenuItem>작은 메뉴 3</MenuItem>
              </Menu>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">기본 크기</h3>
              <Menu size="md">
                <MenuItem>기본 메뉴 1</MenuItem>
                <MenuItem>기본 메뉴 2</MenuItem>
                <MenuItem>기본 메뉴 3</MenuItem>
              </Menu>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">큰 크기</h3>
              <Menu size="lg">
                <MenuItem>큰 메뉴 1</MenuItem>
                <MenuItem>큰 메뉴 2</MenuItem>
                <MenuItem>큰 메뉴 3</MenuItem>
              </Menu>
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
                사이드바 네비게이션
              </h3>
              <div className="space-y-4">
                <Menu>
                  <MenuLabel>메인 메뉴</MenuLabel>
                  <MenuItem icon={<Icon name="home" className="w-4 h-4" />}>
                    대시보드
                  </MenuItem>
                  <MenuItem icon={<Icon name="users" className="w-4 h-4" />}>
                    사용자 관리
                  </MenuItem>
                  <MenuItem icon={<Icon name="settings" className="w-4 h-4" />}>
                    시스템 설정
                  </MenuItem>
                  <MenuSeparator />
                  <MenuLabel>도구</MenuLabel>
                  <MenuItem icon={<Icon name="barChart" className="w-4 h-4" />}>
                    분석
                  </MenuItem>
                  <MenuItem icon={<Icon name="download" className="w-4 h-4" />}>
                    내보내기
                  </MenuItem>
                </Menu>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                헤더 네비게이션
              </h3>
              <div className="space-y-4">
                <Menu variant="horizontal">
                  <MenuItem icon={<Icon name="home" className="w-4 h-4" />}>
                    홈
                  </MenuItem>
                  <MenuItem icon={<Icon name="star" className="w-4 h-4" />}>
                    상품
                  </MenuItem>
                  <MenuItem icon={<Icon name="heart" className="w-4 h-4" />}>
                    찜
                  </MenuItem>
                  <MenuItem icon={<Icon name="user" className="w-4 h-4" />}>
                    마이페이지
                  </MenuItem>
                </Menu>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                설정 메뉴
              </h3>
              <div className="space-y-4">
                <Menu>
                  <MenuLabel>계정 설정</MenuLabel>
                  <MenuItem icon={<Icon name="user" className="w-4 h-4" />}>
                    프로필 편집
                  </MenuItem>
                  <MenuItem icon={<Icon name="lock" className="w-4 h-4" />}>
                    비밀번호 변경
                  </MenuItem>
                  <MenuItem icon={<Icon name="mail" className="w-4 h-4" />}>
                    이메일 설정
                  </MenuItem>
                  <MenuSeparator />
                  <MenuLabel>알림 설정</MenuLabel>
                  <MenuItem icon={<Icon name="bell" className="w-4 h-4" />}>
                    푸시 알림
                  </MenuItem>
                  <MenuItem icon={<Icon name="mail" className="w-4 h-4" />}>
                    이메일 알림
                  </MenuItem>
                </Menu>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                파일 메뉴
              </h3>
              <div className="space-y-4">
                <Menu>
                  <MenuItem icon={<Icon name="add" className="w-4 h-4" />}>
                    새 파일
                  </MenuItem>
                  <MenuItem icon={<Icon name="upload" className="w-4 h-4" />}>
                    파일 업로드
                  </MenuItem>
                  <MenuItem icon={<Icon name="download" className="w-4 h-4" />}>
                    파일 다운로드
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem icon={<Icon name="delete" className="w-4 h-4" />}>
                    휴지통
                  </MenuItem>
                </Menu>
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
{`import { Menu, MenuItem, MenuSeparator, MenuLabel, Icon } from '@hua-labs/ui'

// 기본 세로 메뉴
<Menu>
  <MenuItem>메뉴 아이템 1</MenuItem>
  <MenuItem>메뉴 아이템 2</MenuItem>
  <MenuSeparator />
  <MenuItem>메뉴 아이템 3</MenuItem>
</Menu>

// 가로 메뉴
<Menu variant="horizontal">
  <MenuItem>홈</MenuItem>
  <MenuItem>상품</MenuItem>
  <MenuItem>문의</MenuItem>
</Menu>

// 아이콘이 있는 메뉴
<Menu>
  <MenuItem icon={<Icon name="user" className="w-4 h-4" />}>
    프로필
  </MenuItem>
  <MenuItem icon={<Icon name="settings" className="w-4 h-4" />}>
    설정
  </MenuItem>
</Menu>

// 라벨이 있는 메뉴
<Menu>
  <MenuLabel>메인 메뉴</MenuLabel>
  <MenuItem>아이템 1</MenuItem>
  <MenuItem>아이템 2</MenuItem>
  <MenuSeparator />
  <MenuLabel>서브 메뉴</MenuLabel>
  <MenuItem>아이템 3</MenuItem>
</Menu>`}
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
                      <th className="text-left p-2 font-semibold">Component</th>
                      <th className="text-left p-2 font-semibold">Prop</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Default</th>
                      <th className="text-left p-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">Menu</td>
                      <td className="p-2 font-mono text-sm">variant</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos; | &apos;horizontal&apos; | &apos;vertical&apos; | &apos;compact&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;default&apos;</td>
                      <td className="p-2 text-sm">메뉴의 방향</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">Menu</td>
                      <td className="p-2 font-mono text-sm">size</td>
                      <td className="p-2 font-mono text-sm">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;md&apos;</td>
                      <td className="p-2 text-sm">메뉴의 크기</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">MenuItem</td>
                      <td className="p-2 font-mono text-sm">icon</td>
                      <td className="p-2 font-mono text-sm">ReactNode</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">메뉴 아이템의 아이콘</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">MenuItem</td>
                      <td className="p-2 font-mono text-sm">active</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">false</td>
                      <td className="p-2 text-sm">활성 상태 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">MenuItem</td>
                      <td className="p-2 font-mono text-sm">disabled</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">false</td>
                      <td className="p-2 text-sm">비활성화 여부</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 