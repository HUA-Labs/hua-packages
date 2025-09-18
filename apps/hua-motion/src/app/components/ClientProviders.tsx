'use client'

import { ThemeProvider } from '@hua-labs/ui'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="hua-motion-theme">
      {children}
    </ThemeProvider>
  )
} 