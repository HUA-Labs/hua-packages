"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb"

/**
 * ComponentLayout 컴포넌트의 props / ComponentLayout component props
 * @typedef {Object} ComponentLayoutProps
 * @property {string} title - 페이지 제목 / Page title
 * @property {string} description - 페이지 설명 / Page description
 * @property {React.ReactNode} children - 페이지 내용 / Page content
 * @property {Object} [prevPage] - 이전 페이지 정보 / Previous page information
 * @property {string} prevPage.title - 이전 페이지 제목 / Previous page title
 * @property {string} prevPage.href - 이전 페이지 링크 / Previous page link
 * @property {Object} [nextPage] - 다음 페이지 정보 / Next page information
 * @property {string} nextPage.title - 다음 페이지 제목 / Next page title
 * @property {string} nextPage.href - 다음 페이지 링크 / Next page link
 * @property {Array<Object>} [breadcrumbItems] - Breadcrumb 항목들 / Breadcrumb items
 * @property {string} breadcrumbItems[].label - Breadcrumb 라벨 / Breadcrumb label
 * @property {string} [breadcrumbItems[].href] - Breadcrumb 링크 / Breadcrumb link
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface ComponentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  children: React.ReactNode
  prevPage?: {
    title: string
    href: string
  }
  nextPage?: {
    title: string
    href: string
  }
  breadcrumbItems?: Array<{
    label: string
    href?: string
  }>
}

/**
 * ComponentLayout 컴포넌트 / ComponentLayout component
 * 
 * 컴포넌트 문서 페이지 레이아웃을 제공하는 컴포넌트입니다.
 * 제목, 설명, Breadcrumb, 이전/다음 페이지 네비게이션을 포함합니다.
 * 
 * Component that provides layout for component documentation pages.
 * Includes title, description, Breadcrumb, and previous/next page navigation.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ComponentLayout
 *   title="Button 컴포넌트"
 *   description="버튼 컴포넌트 사용법"
 * >
 *   <Button>예제</Button>
 * </ComponentLayout>
 * 
 * @example
 * // 이전/다음 페이지 네비게이션 포함 / With previous/next page navigation
 * <ComponentLayout
 *   title="Input 컴포넌트"
 *   description="입력 컴포넌트 사용법"
 *   prevPage={{ title: "Button", href: "/components/button" }}
 *   nextPage={{ title: "Select", href: "/components/select" }}
 * >
 *   <Input placeholder="입력하세요" />
 * </ComponentLayout>
 * 
 * @param {ComponentLayoutProps} props - ComponentLayout 컴포넌트의 props / ComponentLayout component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ComponentLayout 컴포넌트 / ComponentLayout component
 */
const ComponentLayout = React.forwardRef<HTMLDivElement, ComponentLayoutProps>(
  ({ 
    className, 
    title, 
    description, 
    children, 
    prevPage, 
    nextPage,
    breadcrumbItems = [
      { label: "Components", href: "/components" }
    ],
    ...props 
  }, ref) => {
    return (
      <div className="relative min-h-screen">
        {/* 고정된 페이지 네비게이션 - 위쪽 */}
        <div className="fixed right-4 top-4 z-50 hidden lg:block">
          <div className="flex flex-col space-y-4">
            {prevPage && (
                              <a
                  href={prevPage.href}
                  className="group p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg hover:shadow-2xl hover:bg-white/90 active:scale-95 transition-all duration-200"
                  title={`이전: ${prevPage.title}`}
                >
                  <svg 
                    className="w-5 h-5 text-slate-600 group-hover:text-blue-600 group-active:text-blue-800 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </a>
            )}
          </div>
        </div>

        {/* 고정된 페이지 네비게이션 - 아래쪽 */}
        <div className="fixed right-4 bottom-4 z-50 hidden lg:block">
          <div className="flex flex-col space-y-4">
            {nextPage && (
                              <a
                  href={nextPage.href}
                  className="group p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg hover:shadow-2xl hover:bg-white/90 active:scale-95 transition-all duration-200"
                  title={`다음: ${nextPage.title}`}
                >
                  <svg 
                    className="w-5 h-5 text-slate-600 group-hover:text-blue-600 group-active:text-blue-800 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div
          ref={ref}
          className={merge("container mx-auto px-4 py-8", className)}
          {...props}
        >
          <div className="max-w-4xl mx-auto">
            {/* 브레드크럼 */}
            <Breadcrumb className="mb-6">
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem 
                  key={index}
                  href={item.href}
                  isCurrent={index === breadcrumbItems.length - 1}
                >
                  {item.label}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>

            {/* 페이지 헤더 */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </div>

            {/* 페이지 콘텐츠 */}
            <div className="space-y-8">
              {children}
            </div>

            {/* 모바일 페이지 네비게이션 */}
            <div className="mt-12 lg:hidden">
              <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-700">
                {prevPage && (
                  <a
                    href={prevPage.href}
                    className="flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {prevPage.title}
                  </a>
                )}
                {nextPage && (
                  <a
                    href={nextPage.href}
                    className="flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  >
                    {nextPage.title}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
ComponentLayout.displayName = "ComponentLayout"

export { ComponentLayout } 