"use client"

import React, { useState } from "react"
import { Popover, Button, ComponentLayout } from "@hua-labs/ui"

export default function PopoverPage() {
  // 각각의 팝오버 상태 관리
  const [open, setOpen] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [openTop, setOpenTop] = useState(false)
  const [openRight, setOpenRight] = useState(false)
  const [openBottom, setOpenBottom] = useState(false)
  const [openLeft, setOpenLeft] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [openSetting, setOpenSetting] = useState(false)
  const [openHelp, setOpenHelp] = useState(false)

  return (
    <ComponentLayout
      title="Popover"
      description="트리거 요소에 연결된 추가 정보나 메뉴를 표시하는 팝오버 컴포넌트입니다."
      prevPage={{ title: "Progress", href: "/components/progress" }}
      nextPage={{ title: "Skeleton", href: "/components/skeleton" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Popover" }
      ]}
    >
      <div className="space-y-8">

        {/* 기본 Popover */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">기본 Popover</h2>
          <div className="flex items-center gap-4">
            <Popover
              trigger={<Button variant="outline">클릭하세요</Button>}
              open={open}
              onOpenChange={setOpen}
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg">
                <h4 className="font-medium leading-none text-slate-900 dark:text-white mb-2">팝오버 제목</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  팝오버 내용이 여기에 표시됩니다.
                </p>
              </div>
            </Popover>
            <Popover
              trigger={<Button variant="outline">정보 보기</Button>}
              open={open2}
              onOpenChange={setOpen2}
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg">
                <h4 className="font-medium leading-none text-slate-900 dark:text-white mb-2">상세 정보</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  이 버튼에 대한 자세한 설명이 여기에 나타납니다.
                </p>
              </div>
            </Popover>
          </div>
        </div>

        {/* 위치별 Popover */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">위치별 Popover</h2>
          <div className="flex flex-wrap gap-4">
            <Popover
              trigger={<Button>위쪽</Button>}
              position="top"
              open={openTop}
              onOpenChange={setOpenTop}
            >
              <div className="p-4">상단에 표시</div>
            </Popover>
            <Popover
              trigger={<Button>오른쪽</Button>}
              position="right"
              open={openRight}
              onOpenChange={setOpenRight}
            >
              <div className="p-4">오른쪽에 표시</div>
            </Popover>
            <Popover
              trigger={<Button>하단</Button>}
              position="bottom"
              open={openBottom}
              onOpenChange={setOpenBottom}
            >
              <div className="p-4">하단에 표시</div>
            </Popover>
            <Popover
              trigger={<Button>왼쪽</Button>}
              position="left"
              open={openLeft}
              onOpenChange={setOpenLeft}
            >
              <div className="p-4">왼쪽에 표시</div>
            </Popover>
          </div>
        </div>

        {/* 실제 사용 예시 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">실제 사용 예시</h2>
          <div className="space-y-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">사용자 프로필</h3>
              <div className="flex items-center gap-4">
                <Popover
                  trigger={<Button variant="outline" className="w-32">김개발</Button>}
                  open={openProfile}
                  onOpenChange={setOpenProfile}
                >
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg w-80">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium leading-none text-slate-900 dark:text-white">김개발</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">프론트엔드 개발자</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">마지막 활동: 5분 전</p>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm font-medium text-slate-900 dark:text-white">이메일</label>
                          <span className="text-sm text-slate-600 dark:text-slate-400">kim@example.com</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm font-medium text-slate-900 dark:text-white">부서</label>
                          <span className="text-sm text-slate-600 dark:text-slate-400">개발팀</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popover>
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">설정 옵션</h3>
              <div className="flex items-center gap-4">
                <Popover
                  trigger={<Button variant="outline" size="sm">⚙️ 설정</Button>}
                  open={openSetting}
                  onOpenChange={setOpenSetting}
                >
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg w-80">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium leading-none text-slate-900 dark:text-white">알림 설정</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          알림을 받을 방법을 선택하세요.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="email" className="rounded" />
                          <label htmlFor="email" className="text-sm text-slate-900 dark:text-white">이메일 알림</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="push" className="rounded" />
                          <label htmlFor="push" className="text-sm text-slate-900 dark:text-white">푸시 알림</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="sms" className="rounded" />
                          <label htmlFor="sms" className="text-sm text-slate-900 dark:text-white">SMS 알림</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popover>
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium mb-3 text-slate-900 dark:text-white">도움말</h3>
              <div className="flex items-center gap-4">
                <Popover
                  trigger={<Button variant="outline" size="sm">❓ 도움말</Button>}
                  open={openHelp}
                  onOpenChange={setOpenHelp}
                >
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg w-80">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium leading-none text-slate-900 dark:text-white">사용법 가이드</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          이 기능을 사용하는 방법에 대한 안내입니다.
                        </p>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <p className="mb-2">1. 첫 번째 단계를 수행하세요</p>
                          <p className="mb-2">2. 두 번째 단계를 완료하세요</p>
                          <p>3. 마지막 단계를 확인하세요</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Props & 사용 가이드 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Props</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Popover</h3>
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
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">trigger</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">ReactNode</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">팝오버를 열기 위한 트리거 요소</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">open</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">boolean</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">false</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">팝오버 열림 상태</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">onOpenChange</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">(open: boolean) =&gt; void</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">열림 상태 변경 핸들러</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">position</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">"top" | "bottom" | "left" | "right"</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">"bottom"</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">팝오버 표시 위치</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">align</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">"start" | "center" | "end"</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">"center"</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">팝오버 정렬 방식</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">offset</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">number</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">8</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">트리거와 팝오버 간의 간격</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">disabled</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">boolean</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">false</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">팝오버 비활성화 여부</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">children</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">ReactNode</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-mono text-sm text-slate-900 dark:text-white">-</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white">팝오버 내용</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">사용 가이드</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">기본 사용법</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`import { Popover, Button } from "@hua-labs/ui"
import { useState } from "react"

// 기본 팝오버
const [open, setOpen] = useState(false)

<Popover
  trigger={<Button variant="outline">클릭하세요</Button>}
  open={open}
  onOpenChange={setOpen}
>
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg">
    <h4 className="font-medium leading-none text-slate-900 dark:text-white mb-2">팝오버 제목</h4>
    <p className="text-sm text-slate-600 dark:text-slate-400">
      팝오버 내용이 여기에 표시됩니다.
    </p>
  </div>
</Popover>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">위치 설정</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 위치별 팝오버
<Popover
  trigger={<Button>위쪽</Button>}
  position="top"
>
  <div>상단에 표시</div>
</Popover>

<Popover
  trigger={<Button>오른쪽</Button>}
  position="right"
>
  <div>오른쪽에 표시</div>
</Popover>

<Popover
  trigger={<Button>하단</Button>}
  position="bottom"
>
  <div>하단에 표시</div>
</Popover>

<Popover
  trigger={<Button>왼쪽</Button>}
  position="left"
>
  <div>왼쪽에 표시</div>
</Popover>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-slate-900 dark:text-white">실제 사용 예시</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700">
{`// 사용자 프로필 팝오버
<Popover
  trigger={<Button variant="outline">김개발</Button>}
  open={open}
  onOpenChange={setOpen}
>
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg w-80">
    <div className="space-y-3">
      <div>
        <h4 className="font-medium leading-none text-slate-900 dark:text-white">김개발</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">프론트엔드 개발자</p>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-sm font-medium">이메일</label>
          <span className="text-sm">kim@example.com</span>
        </div>
      </div>
    </div>
  </div>
</Popover>

// 설정 팝오버
<Popover
  trigger={<Button variant="outline" size="sm">⚙️ 설정</Button>}
  open={open}
  onOpenChange={setOpen}
>
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg w-80">
    <div className="space-y-3">
      <div>
        <h4 className="font-medium leading-none text-slate-900 dark:text-white">알림 설정</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          알림을 받을 방법을 선택하세요.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="email" />
          <label htmlFor="email" className="text-sm">이메일 알림</label>
        </div>
      </div>
    </div>
  </div>
</Popover>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
}