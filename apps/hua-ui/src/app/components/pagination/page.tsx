"use client"

import React, { useState } from "react"
import { Pagination, Card, CardContent, Button } from "@hua-labs/ui"

export default function PaginationPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPage2, setCurrentPage2] = useState(1)
  const [currentPage3, setCurrentPage3] = useState(1)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Pagination 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          페이지네이션 컴포넌트입니다. 
          많은 데이터를 여러 페이지로 나누어 표시할 때 사용합니다.
        </p>
      </div>

      {/* 기본 Pagination */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Pagination
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={setCurrentPage}
            />
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              현재 페이지: {currentPage}
            </p>
          </div>
        </div>
      </div>

      {/* 크기별 Pagination */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 Pagination
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">작은 크기</p>
              <Pagination
                currentPage={currentPage2}
                totalPages={10}
                onPageChange={setCurrentPage2}
                size="sm"
              />
            </div>
            
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">기본 크기</p>
              <Pagination
                currentPage={currentPage2}
                totalPages={10}
                onPageChange={setCurrentPage2}
                size="md"
              />
            </div>
            
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">큰 크기</p>
              <Pagination
                currentPage={currentPage2}
                totalPages={10}
                onPageChange={setCurrentPage2}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모양별 Pagination */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          모양별 Pagination
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">정사각형 (기본)</h3>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
                shape="square"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">원형</h3>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
                shape="circle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 다양한 페이지 수 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          다양한 페이지 수
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">적은 페이지 (5페이지)</p>
              <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={() => {}}
              />
            </div>
            
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">중간 페이지 (10페이지)</p>
              <Pagination
                currentPage={5}
                totalPages={10}
                onPageChange={() => {}}
              />
            </div>
            
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">많은 페이지 (50페이지)</p>
              <Pagination
                currentPage={25}
                totalPages={50}
                onPageChange={() => {}}
              />
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
                게시판 목록
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="p-3 border rounded">게시글 1</div>
                  <div className="p-3 border rounded">게시글 2</div>
                  <div className="p-3 border rounded">게시글 3</div>
                  <div className="p-3 border rounded">게시글 4</div>
                  <div className="p-3 border rounded">게시글 5</div>
                </div>
                <Pagination
                  currentPage={currentPage3}
                  totalPages={20}
                  onPageChange={setCurrentPage3}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  게시판에서 페이지별로 게시글을 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                상품 목록
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border rounded text-center">상품 1</div>
                  <div className="p-2 border rounded text-center">상품 2</div>
                  <div className="p-2 border rounded text-center">상품 3</div>
                  <div className="p-2 border rounded text-center">상품 4</div>
                </div>
                <Pagination
                  currentPage={1}
                  totalPages={15}
                  onPageChange={() => {}}
                  size="sm"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  쇼핑몰에서 상품을 페이지별로 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                검색 결과
              </h3>
              <div className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  &quot;React&quot; 검색 결과: 총 1,234개
                </div>
                <div className="space-y-2">
                  <div className="p-2 border rounded">검색 결과 1</div>
                  <div className="p-2 border rounded">검색 결과 2</div>
                  <div className="p-2 border rounded">검색 결과 3</div>
                </div>
                <Pagination
                  currentPage={1}
                  totalPages={123}
                  onPageChange={() => {}}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  검색 결과를 페이지별로 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                관리자 목록
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="p-2 border rounded flex justify-between">
                    <span>사용자 1</span>
                    <Button size="sm" variant="outline">관리</Button>
                  </div>
                  <div className="p-2 border rounded flex justify-between">
                    <span>사용자 2</span>
                    <Button size="sm" variant="outline">관리</Button>
                  </div>
                  <div className="p-2 border rounded flex justify-between">
                    <span>사용자 3</span>
                    <Button size="sm" variant="outline">관리</Button>
                  </div>
                </div>
                <Pagination
                  currentPage={1}
                  totalPages={50}
                  onPageChange={() => {}}
                  size="sm"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  관리자 패널에서 사용자 목록을 표시할 때 사용합니다.
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
{`import { Pagination } from '@hua-labs/ui'
import { useState } from 'react'

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={10}
      onPageChange={setCurrentPage}
    />
  )
}

// 크기 지정
<Pagination
  currentPage={currentPage}
  totalPages={10}
  onPageChange={setCurrentPage}
  size="lg"
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
                      <td className="p-2 font-mono text-sm">currentPage</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">현재 페이지 번호</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">totalPages</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">전체 페이지 수</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">onPageChange</td>
                      <td className="p-2 font-mono text-sm">(page: number) =&gt; void</td>
                      <td className="p-2 font-mono text-sm">-</td>
                      <td className="p-2 text-sm">페이지 변경 시 호출되는 함수</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">size</td>
                      <td className="p-2 font-mono text-sm">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                      <td className="p-2 font-mono text-sm">&apos;md&apos;</td>
                      <td className="p-2 text-sm">페이지네이션의 크기</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">showFirstLast</td>
                      <td className="p-2 font-mono text-sm">boolean</td>
                      <td className="p-2 font-mono text-sm">true</td>
                      <td className="p-2 text-sm">첫/마지막 페이지 버튼 표시 여부</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono text-sm">maxVisiblePages</td>
                      <td className="p-2 font-mono text-sm">number</td>
                      <td className="p-2 font-mono text-sm">5</td>
                      <td className="p-2 text-sm">한 번에 표시할 최대 페이지 수</td>
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