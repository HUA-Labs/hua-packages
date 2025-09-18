"use client"

import React from "react"
import { Divider, Card, CardContent } from "@hua-labs/ui"

export default function DividerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Divider 컴포넌트
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          콘텐츠를 구분하는 구분선 컴포넌트입니다. 
          다양한 스타일과 방향을 지원하며, 레이아웃을 정리하는 데 유용합니다.
        </p>
      </div>

      {/* 기본 Divider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Divider
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <p className="text-slate-600 dark:text-slate-400">위쪽 콘텐츠</p>
              <Divider />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">더 많은 여백이 있는 구분선</p>
              <Divider spacing="lg" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
          </div>
        </div>
      </div>

      {/* 글래스모피즘 Divider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          글래스모피즘 Divider
        </h2>
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl p-6 dark:from-blue-500/10 dark:to-purple-500/10 dark:border-slate-700/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            특별한 배경에서 사용할 때 예쁘게 보이는 글래스모피즘 스타일입니다.
          </p>
          <div className="space-y-6">
            <div>
              <p className="text-white">위쪽 콘텐츠</p>
              <Divider variant="glass" />
              <p className="text-white">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-white">더 많은 여백이 있는 Glass 구분선</p>
              <Divider variant="glass" spacing="lg" />
              <p className="text-white">아래쪽 콘텐츠</p>
            </div>
          </div>
        </div>
      </div>

      {/* 스타일별 Divider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          스타일별 Divider
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <p className="text-slate-600 dark:text-slate-400">실선 구분선</p>
              <Divider variant="solid" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">점선 구분선</p>
              <Divider variant="dashed" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">점 구분선</p>
              <Divider variant="dotted" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">그라데이션 구분선</p>
              <Divider variant="gradient" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
          </div>
        </div>
      </div>

      {/* 색상별 Divider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          색상별 Divider
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <p className="text-slate-600 dark:text-slate-400">기본 색상</p>
              <Divider color="default" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">흐린 색상</p>
              <Divider color="muted" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">주요 색상</p>
              <Divider color="primary" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">보조 색상</p>
              <Divider color="secondary" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
          </div>
        </div>
      </div>

      {/* 크기별 Divider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 Divider
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <p className="text-slate-600 dark:text-slate-400">작은 크기</p>
              <Divider size="sm" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">기본 크기</p>
              <Divider size="md" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">큰 크기</p>
              <Divider size="lg" />
              <p className="text-slate-600 dark:text-slate-400">아래쪽 콘텐츠</p>
            </div>
          </div>
        </div>
      </div>

      {/* 세로 Divider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          세로 Divider
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-6 h-20">
            <div className="text-slate-600 dark:text-slate-400">왼쪽 콘텐츠</div>
            <Divider orientation="vertical" />
            <div className="text-slate-600 dark:text-slate-400">오른쪽 콘텐츠</div>
          </div>
          <div className="flex items-center gap-6 h-20 mt-6">
            <div className="text-slate-600 dark:text-slate-400">왼쪽 콘텐츠</div>
            <Divider orientation="vertical" variant="dashed" />
            <div className="text-slate-600 dark:text-slate-400">오른쪽 콘텐츠</div>
          </div>
          <div className="flex items-center gap-6 h-20 mt-6">
            <div className="text-slate-600 dark:text-slate-400">왼쪽 콘텐츠</div>
            <Divider orientation="vertical" variant="glass" />
            <div className="text-slate-600 dark:text-slate-400">오른쪽 콘텐츠</div>
          </div>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          실제 사용 예시
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">카드 제목</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  카드의 첫 번째 섹션입니다. 여기에 주요 내용이 들어갑니다.
                </p>
                <Divider />
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2 text-slate-900 dark:text-white">부제목</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    카드의 두 번째 섹션입니다. 구분선으로 내용을 나누어 가독성을 높였습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-between">
              <div className="text-slate-600 dark:text-slate-400">왼쪽 메뉴</div>
              <Divider orientation="vertical" />
              <div className="text-slate-600 dark:text-slate-400">중앙 메뉴</div>
              <Divider orientation="vertical" />
              <div className="text-slate-600 dark:text-slate-400">오른쪽 메뉴</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 