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

      {/* Navigation Bar */}
      <CircularNavBar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}
