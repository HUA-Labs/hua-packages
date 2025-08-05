'use client'

import React from 'react'
import HeroSection from './components/HeroSection'
import FeatureCards from './components/FeatureCards'
import CTASection from './components/CTASection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <HeroSection />
        <FeatureCards />
        <CTASection />
      </div>
    </div>
  )
} 