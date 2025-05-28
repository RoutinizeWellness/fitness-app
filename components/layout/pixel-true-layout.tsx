"use client"

import React, { useState } from "react"
import { CircularNavBar } from "@/components/navigation/circular-nav-bar"

interface PixelTrueLayoutProps {
  children: React.ReactNode
}

export function PixelTrueLayout({ children }: PixelTrueLayoutProps) {
  const [activeTab, setActiveTab] = useState("camping")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="w-full max-w-[414px] mx-auto min-h-screen bg-[#FFF3E9] relative overflow-hidden">
      {/* Main Content */}
      <div className="pb-20">
        {children}
      </div>

      {/* Navigation Bar - DEMO ONLY - This is not used in the main application */}
      <CircularNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Demo indicator */}
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1 z-50">
        DEMO MODE - This navigation is for demonstration purposes only
      </div>
    </div>
  )
}
