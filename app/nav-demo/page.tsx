"use client"

import React, { useState } from "react"
import { CircularNavBar } from "@/components/navigation/circular-nav-bar"

export default function NavDemoPage() {
  const [activeTab, setActiveTab] = useState("camping")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9] flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-[#573353] mb-8">Navigation Demo</h1>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 mb-20">
        <h2 className="text-xl font-semibold text-[#573353] mb-4">Active Tab: {activeTab}</h2>
        <p className="text-[#573353]/70">
          This is a demo of the circular navigation bar with a center action button.
          Click on the different icons to change the active tab.
        </p>
      </div>
      
      {/* Navigation Bar */}
      <CircularNavBar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}
