"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type ContrastMode = "default" | "high" | "dark" | "light"

interface ContrastModeContextType {
  mode: ContrastMode
  setMode: (mode: ContrastMode) => void
}

const ContrastModeContext = createContext<ContrastModeContextType | undefined>(undefined)

export function useContrastMode() {
  const context = useContext(ContrastModeContext)
  if (!context) {
    throw new Error("useContrastMode must be used within a ContrastModeProvider")
  }
  return context
}

interface ContrastModeProviderProps {
  children: React.ReactNode
}

export function ContrastModeProvider({ children }: ContrastModeProviderProps) {
  const [mode, setMode] = useState<ContrastMode>("default")

  // Load saved mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("contrastMode") as ContrastMode | null
    if (savedMode) {
      setMode(savedMode)
    } else if (window.matchMedia("(prefers-contrast: more)").matches) {
      // Check if user has high contrast mode enabled in their OS
      setMode("high")
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Check if user has dark mode enabled in their OS
      setMode("dark")
    }
  }, [])

  // Apply contrast mode to the document
  useEffect(() => {
    document.documentElement.classList.remove(
      "contrast-default", 
      "contrast-high", 
      "contrast-dark", 
      "contrast-light"
    )
    document.documentElement.classList.add(`contrast-${mode}`)
    localStorage.setItem("contrastMode", mode)
  }, [mode])

  return (
    <ContrastModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ContrastModeContext.Provider>
  )
}
