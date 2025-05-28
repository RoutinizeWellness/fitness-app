"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatedNavigation } from "@/components/animations/animated-navigation"
import { 
  AnimatedElement, 
  AnimatedStaggeredList 
} from "@/components/animations/animated-transitions"
import { Plus } from "lucide-react"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ 
  children, 
  className,
  delay = 0
}: AnimatedSectionProps) {
  return (
    <AnimatedElement
      className={cn("w-full", className)}
      delay={delay}
      duration={0.5}
    >
      {children}
    </AnimatedElement>
  )
}

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
}

export function AnimatedList({ 
  children, 
  className,
  delay = 0,
  staggerDelay = 0.05
}: AnimatedListProps) {
  return (
    <AnimatedStaggeredList
      className={cn("w-full space-y-4", className)}
      staggerDelay={staggerDelay}
      delay={delay}
    >
      {children}
    </AnimatedStaggeredList>
  )
}

interface AnimatedLayoutProps {
  children: React.ReactNode
  currentTab: string
  setCurrentTab: (tab: string) => void
  showBackButton?: boolean
  title?: string
  profile?: User | null
  showFloatingAction?: boolean
  floatingActionIcon?: React.ReactNode
  onFloatingActionClick?: () => void
  notifications?: number
}

export function AnimatedLayout({
  children,
  currentTab,
  setCurrentTab,
  showBackButton = false,
  title = "Routinize",
  profile = null,
  showFloatingAction = false,
  floatingActionIcon = <Plus className="h-6 w-6" />,
  onFloatingActionClick,
  notifications = 0
}: AnimatedLayoutProps) {
  const router = useRouter()
  const { isDark, toggleTheme } = useOrganicTheme()

  // Manejar cambio de tab
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Navegación */}
      <AnimatedNavigation
        activeTab={currentTab}
        setActiveTab={handleTabChange}
        showBackButton={showBackButton}
        title={title}
        profile={profile}
        showFloatingAction={showFloatingAction}
        floatingActionIcon={floatingActionIcon}
        onFloatingActionClick={onFloatingActionClick}
        notifications={notifications}
      />

      {/* Contenido principal */}
      <main className="pt-16 pb-16">
        {children}
      </main>
    </div>
  )
}
