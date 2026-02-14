'use client';

/**
 * Landing Page Example
 *
 * Usage: Rename this file to `app/landing/page.tsx` or use as `app/page.tsx`
 *
 * Prerequisites:
 *   pnpm add @hua-labs/ui
 *   # Optional: pnpm add @hua-labs/motion-core  (for stagger/scroll animations)
 *
 * CSS (already included in globals.css):
 *   @import "@hua-labs/ui/styles/landing.css";
 */

import { Landing } from '@hua-labs/ui/landing';

// ── Sample Data ─────────────────────────────────────

const features = [
  { icon: 'sparkle', title: 'Beautiful UI', description: 'Pre-built components with dark mode, motion, and accessibility baked in.' },
  { icon: 'cpu', title: 'AI-Ready', description: 'GEO optimization and agent-docs let AI build pages that rank.' },
  { icon: 'globe', title: 'i18n Built-in', description: 'Multi-language support with namespace-based translations out of the box.' },
  { icon: 'palette', title: 'Theme System', description: '5 landing presets — or create your own with createLandingTheme.' },
];

const stats = [
  { value: '72', label: 'Components', suffix: '+' },
  { value: '5', label: 'Theme Presets' },
  { value: '100', label: 'Test Coverage', suffix: '%' },
  { value: '10', label: 'Setup Time', suffix: 'min' },
];

const testimonials = [
  { quote: 'We shipped our marketing site in a single afternoon.', author: 'Alex Kim', role: 'CTO', company: 'Acme Corp' },
  { quote: 'The theme presets saved us weeks of design iteration.', author: 'Sarah Chen', role: 'Designer', company: 'StartupXYZ' },
  { quote: 'Best DX I have seen for landing pages. Just works.', author: 'Mike Park', role: 'Engineer', company: 'DevTools Inc' },
];

const logos = [
  { src: '/next.svg', alt: 'Next.js' },
  { src: '/logo.svg', alt: 'HUA Labs' },
  { src: '/next.svg', alt: 'Vercel' },
  { src: '/logo.svg', alt: 'Partner' },
];

const showcase = [
  { image: '/next.svg', title: 'Lightning Fast', description: 'Built on Next.js with zero-config optimizations. Every page is server-rendered and edge-cached.' },
  { image: '/logo.svg', title: 'Theme-Driven', description: 'Pick a preset — corporate, marketing, product, dashboard, or app — and every section adapts automatically.' },
  { image: '/next.svg', title: 'Production Ready', description: 'Fully tested, accessible, and responsive from 375px to 1440px. Ship with confidence.' },
];

// ── Page ──────────────────────────────────────────────

export default function LandingPage() {
  return (
    <Landing.Provider theme="marketing">
      <Landing.Hero
        title="Ship UX Faster"
        subtitle="UI + Motion + i18n, pre-wired"
        description="Build stunning landing pages in minutes with theme presets and composite components."
        primaryAction={
          <a href="/docs" className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors">
            Get Started
          </a>
        }
        secondaryAction={
          <a href="https://github.com/HUA-Labs" target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary/80 transition-colors">
            GitHub
          </a>
        }
        scrollIndicator
      />

      <Landing.Features
        title="Everything you need"
        subtitle="A complete toolkit for modern landing pages"
        items={features}
      />

      <Landing.Stats
        title="Built for scale"
        items={stats}
      />

      <Landing.Testimonials
        title="Loved by developers"
        items={testimonials}
      />

      <Landing.LogoCloud
        title="Trusted by"
        logos={logos}
      />

      <Landing.Showcase
        title="See it in action"
        subtitle="Real-world examples of what you can build"
        items={showcase}
      />

      <Landing.CTA
        title="Ready to ship?"
        subtitle="Get started in under 10 minutes"
        primaryAction={
          <a href="/docs" className="rounded-full bg-white text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors">
            Start Building
          </a>
        }
      />
    </Landing.Provider>
  );
}
