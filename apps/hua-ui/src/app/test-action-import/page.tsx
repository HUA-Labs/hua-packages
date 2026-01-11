"use client"

import React from "react"

// 직접 import 테스트
import { Action } from '@hua-labs/hua-ux'

export default function TestActionImportPage() {
  console.log("Action component:", Action)
  console.log("Action type:", typeof Action)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Action Import Test</h1>
      <Action>Test Action</Action>
    </div>
  )
} 