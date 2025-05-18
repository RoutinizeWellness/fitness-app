"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export function HighContrastToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [highContrast, setHighContrast] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Check if high contrast mode is enabled in localStorage
    const savedHighContrast = localStorage.getItem('high-contrast-mode')
    if (savedHighContrast === 'true') {
      setHighContrast(true)
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    
    // Save preference to localStorage
    localStorage.setItem('high-contrast-mode', String(newValue))
    
    // Apply high contrast class to root element
    if (newValue) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleHighContrast}
      aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
      title={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] ${highContrast ? 'text-yellow-500' : ''}`} />
    </Button>
  )
}
