"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb"

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
          className={cn("container mx-auto px-4 py-8", className)}
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