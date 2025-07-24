'use client'

import React from 'react'
import { PageTransition } from '@hua-labs/ui'

interface PageTransitionWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageTransitionWrapper({ children, className }: PageTransitionWrapperProps) {
  return (
    <PageTransition
      variant="fade"
      duration={400}
      loadingVariant="butterfly"
      loadingText="Loading animation library..."
      className={className}
    >
      {children}
    </PageTransition>
  )
} 