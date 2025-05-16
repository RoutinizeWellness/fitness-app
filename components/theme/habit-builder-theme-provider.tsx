"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useTheme } from "next-themes"

type HabitBuilderThemeProviderProps = {
  children: ReactNode
  defaultTheme?: string
  storageKey?: string
}

type HabitBuilderThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
  accentColor: "primary" | "secondary" | "tertiary" | "success"
  setAccentColor: (color: "primary" | "secondary" | "tertiary" | "success") => void
  borderRadius: "sm" | "md" | "lg" | "full"
  setBorderRadius: (radius: "sm" | "md" | "lg" | "full") => void
  animation: "none" | "subtle" | "playful"
  setAnimation: (animation: "none" | "subtle" | "playful") => void
  isDark: boolean
}

const HabitBuilderThemeProviderContext = createContext<HabitBuilderThemeProviderState | undefined>(undefined)

export function HabitBuilderThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "habit-builder-theme",
  ...props
}: HabitBuilderThemeProviderProps) {
  const [accentColor, setAccentColor] = useState<"primary" | "secondary" | "tertiary" | "success">("primary")
  const [borderRadius, setBorderRadius] = useState<"sm" | "md" | "lg" | "full">("md")
  const [animation, setAnimation] = useState<"none" | "subtle" | "playful">("subtle")

  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // Load preferences from localStorage
  useEffect(() => {
    const storedAccentColor = localStorage.getItem(`${storageKey}-accent`)
    const storedBorderRadius = localStorage.getItem(`${storageKey}-border-radius`)
    const storedAnimation = localStorage.getItem(`${storageKey}-animation`)
    
    if (storedAccentColor) setAccentColor(storedAccentColor as "primary" | "secondary" | "tertiary" | "success")
    if (storedBorderRadius) setBorderRadius(storedBorderRadius as "sm" | "md" | "lg" | "full")
    if (storedAnimation) setAnimation(storedAnimation as "none" | "subtle" | "playful")
  }, [storageKey])
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}-accent`, accentColor)
    localStorage.setItem(`${storageKey}-border-radius`, borderRadius)
    localStorage.setItem(`${storageKey}-animation`, animation)
  }, [accentColor, borderRadius, animation, storageKey])
  
  // Apply CSS variables based on preferences
  useEffect(() => {
    const root = document.documentElement
    
    // Set border radius variables
    let buttonRadius = "8px"
    let cardRadius = "16px"
    let inputRadius = "8px"
    let badgeRadius = "8px"
    
    switch (borderRadius) {
      case "sm":
        buttonRadius = "8px"
        cardRadius = "12px"
        inputRadius = "6px"
        badgeRadius = "4px"
        break
      case "md":
        buttonRadius = "16px"
        cardRadius = "16px"
        inputRadius = "8px"
        badgeRadius = "8px"
        break
      case "lg":
        buttonRadius = "24px"
        cardRadius = "24px"
        inputRadius = "12px"
        badgeRadius = "12px"
        break
      case "full":
        buttonRadius = "9999px"
        cardRadius = "24px"
        inputRadius = "9999px"
        badgeRadius = "9999px"
        break
    }
    
    root.style.setProperty('--habit-button-radius', buttonRadius)
    root.style.setProperty('--habit-card-radius', cardRadius)
    root.style.setProperty('--habit-input-radius', inputRadius)
    root.style.setProperty('--habit-badge-radius', badgeRadius)
    
    // Set animation variables
    let animationDuration = "0.3s"
    let animationEasing = "ease"
    
    switch (animation) {
      case "none":
        animationDuration = "0s"
        break
      case "subtle":
        animationDuration = "0.3s"
        animationEasing = "ease"
        break
      case "playful":
        animationDuration = "0.5s"
        animationEasing = "cubic-bezier(0.34, 1.56, 0.64, 1)"
        break
    }
    
    root.style.setProperty('--habit-animation-duration', animationDuration)
    root.style.setProperty('--habit-animation-easing', animationEasing)
    
  }, [accentColor, borderRadius, animation])
  
  const value = {
    theme: theme || defaultTheme,
    setTheme,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    animation,
    setAnimation,
    isDark,
  }
  
  return (
    <HabitBuilderThemeProviderContext.Provider {...props} value={value}>
      {children}
    </HabitBuilderThemeProviderContext.Provider>
  )
}

export const useHabitBuilderTheme = () => {
  const context = useContext(HabitBuilderThemeProviderContext)
  
  if (context === undefined) {
    throw new Error("useHabitBuilderTheme must be used within a HabitBuilderThemeProvider")
  }
  
  return context
}

// Component to configure the Habit Builder theme
export function HabitBuilderThemeConfigurator() {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    animation,
    setAnimation,
    isDark
  } = useHabitBuilderTheme()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Theme</h3>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${theme === 'light' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setTheme('light')}
          >
            Light
          </button>
          <button
            className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setTheme('dark')}
          >
            Dark
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Accent Color</h3>
        <div className="flex space-x-2">
          <button
            className={`w-8 h-8 rounded-full ${accentColor === 'primary' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
            style={{ background: 'var(--habit-gradient-primary)' }}
            onClick={() => setAccentColor('primary')}
            aria-label="Primary accent color"
          />
          <button
            className={`w-8 h-8 rounded-full ${accentColor === 'secondary' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
            style={{ background: 'var(--habit-gradient-secondary)' }}
            onClick={() => setAccentColor('secondary')}
            aria-label="Secondary accent color"
          />
          <button
            className={`w-8 h-8 rounded-full ${accentColor === 'tertiary' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
            style={{ background: 'var(--habit-gradient-tertiary)' }}
            onClick={() => setAccentColor('tertiary')}
            aria-label="Tertiary accent color"
          />
          <button
            className={`w-8 h-8 rounded-full ${accentColor === 'success' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
            style={{ background: 'var(--habit-gradient-success)' }}
            onClick={() => setAccentColor('success')}
            aria-label="Success accent color"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Border Radius</h3>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${borderRadius === 'sm' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setBorderRadius('sm')}
          >
            Small
          </button>
          <button
            className={`px-4 py-2 rounded-md ${borderRadius === 'md' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setBorderRadius('md')}
          >
            Medium
          </button>
          <button
            className={`px-4 py-2 rounded-md ${borderRadius === 'lg' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setBorderRadius('lg')}
          >
            Large
          </button>
          <button
            className={`px-4 py-2 rounded-md ${borderRadius === 'full' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setBorderRadius('full')}
          >
            Full
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Animation</h3>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${animation === 'none' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setAnimation('none')}
          >
            None
          </button>
          <button
            className={`px-4 py-2 rounded-md ${animation === 'subtle' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setAnimation('subtle')}
          >
            Subtle
          </button>
          <button
            className={`px-4 py-2 rounded-md ${animation === 'playful' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setAnimation('playful')}
          >
            Playful
          </button>
        </div>
      </div>
    </div>
  )
}
