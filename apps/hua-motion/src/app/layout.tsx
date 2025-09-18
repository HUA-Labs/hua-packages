import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { ThemeProvider, ScrollToTop } from '@hua-labs/ui'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HUA Motion',
  description: 'Motion hooks and utilities for HUA Labs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200`}>
        <ThemeProvider defaultTheme="dark" storageKey="hua-motion-theme">
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ScrollToTop 
              threshold={300}
              variant="primary"
              size="md"
              style={{ bottom: "2rem", right: "2rem" }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 