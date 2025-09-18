'use client'

import React from 'react'
import { AdvancedPageTransition } from '@hua-labs/ui'
import HeroSection from './components/HeroSection'
import FeatureCards from './components/FeatureCards'
import CTASection from './components/CTASection'

export default function HomePage() {
  return (
    <AdvancedPageTransition 
      type="fade" 
      duration={800} 
      easing="smooth"
      showProgress={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <HeroSection />
        <FeatureCards />
        <CTASection />
      </div>
    </AdvancedPageTransition>
  )
} 