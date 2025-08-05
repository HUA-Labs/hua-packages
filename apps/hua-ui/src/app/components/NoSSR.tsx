'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

export default function NoSSR<T extends object>(Component: ComponentType<T>) {
  return dynamic(() => Promise.resolve(Component) as any, {
    ssr: false,
  })
} 