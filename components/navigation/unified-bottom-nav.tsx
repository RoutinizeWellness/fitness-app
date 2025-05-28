"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  Plus,
  Brain
} from "lucide-react"
import { motion } from "framer-motion"

interface UnifiedBottomNavProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  className?: string
}

export function UnifiedBottomNav({
  activeTab = "dashboard",
  onTabChange,
  className
}: UnifiedBottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Navigation items with routes and icons (5 modules as specified)
  const navItems = [
    {
      id: "training",
      label: "Entreno",
      icon: Dumbbell,
      route: "/training"
    },
    {
      id: "nutrition",
      label: "Nutrición",
      icon: Utensils,
      route: "/nutrition"
    },
    {
      id: "sleep",
      label: "Sueño",
      icon: Moon,
      route: "/sleep"
    },
    {
      id: "productivity",
      label: "Productividad",
      icon: Brain,
      route: "/productivity"
    },
    {
      id: "wellness",
      label: "Bienestar",
      icon: Heart,
      route: "/wellness"
    }
  ]

  // Handle navigation
  const handleNavigation = (item: typeof navItems[0]) => {
    if (onTabChange) {
      onTabChange(item.id)
    }

    if (pathname !== item.route) {
      router.push(item.route)
    }
  }

  // Handle add button click
  const handleAddClick = () => {
    // Determine which "add" page to navigate to based on active tab
    switch (activeTab) {
      case "training":
        router.push("/training/new")
        break
      case "nutrition":
        router.push("/nutrition/add-meal")
        break
      case "sleep":
        router.push("/sleep/new-log")
        break
      case "productivity":
        router.push("/productivity/new-task")
        break
      case "wellness":
        router.push("/wellness/new-activity")
        break
      default:
        // Default to training if no specific tab is active
        router.push("/training/new")
        break
    }
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DDDCFE] shadow-lg safe-bottom",
      className
    )}>
      <div className="relative max-w-md mx-auto">
        {/* Main navigation bar */}
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id

            // Add spacing for center button (between items 2 and 3)
            const isBeforeCenter = index === 1
            const isAfterCenter = index === 2

            return (
              <button
                key={item.id}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200",
                  isBeforeCenter ? "mr-6" : isAfterCenter ? "ml-6" : "",
                  isActive
                    ? "bg-[#1B237E]/10 scale-105"
                    : "hover:bg-[#DDDCFE]/50 active:scale-95"
                )}
                onClick={() => handleNavigation(item)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <item.icon
                    className={cn(
                      "h-5 w-5 mb-1 transition-all duration-200",
                      isActive ? "text-[#1B237E]" : "text-[#573353]/70"
                    )}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-[#FEA800] rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium font-manrope transition-colors duration-200",
                    isActive ? "text-[#1B237E] font-semibold" : "text-[#573353]/70"
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Center add button */}
        <button
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-[#FEA800] to-[#FEA800]/90 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEA800] hover:scale-110 active:scale-95"
          onClick={handleAddClick}
          aria-label="Añadir nuevo"
        >
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  )
}
