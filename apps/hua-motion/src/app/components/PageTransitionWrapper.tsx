'use client'

import React from 'react'
import type { ReactElement } from 'react'
import { PageTransition } from '@hua-labs/ui'

interface PageTransitionWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageTransitionWrapper({ children, className }: PageTransitionWrapperProps): ReactElement {
  const PageTransitionComponent = PageTransition as any
  
  return (
    <PageTransitionComponent
      variant="fade"
      duration={400}
      loadingVariant="ripple"
      loadingText="Loading animation library..."
      className={className}
    >
      {children}
    </PageTransitionComponent>
  )
} 