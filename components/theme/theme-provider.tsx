"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

type ThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
  accentColor: string
  setAccentColor: (color: string) => void
  fontSize: "small" | "default" | "large"
  setFontSize: (size: "small" | "default" | "large") => void
  reducedMotion: boolean
  setReducedMotion: (reduced: boolean) => void
  borderRadius: "none" | "small" | "default" | "large" | "full"
  setBorderRadius: (radius: "none" | "small" | "default" | "large" | "full") => void
  isDark: boolean
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "blue",
  setAccentColor: () => null,
  fontSize: "default",
  setFontSize: () => null,
  reducedMotion: false,
  setReducedMotion: () => null,
  borderRadius: "default",
  setBorderRadius: () => null,
  isDark: false,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function EnhancedThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "routinize-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [accentColor, setAccentColor] = useState<string>("blue")
  const [fontSize, setFontSize] = useState<"small" | "default" | "large">("default")
  const [reducedMotion, setReducedMotion] = useState<boolean>(false)
  const [borderRadius, setBorderRadius] = useState<"none" | "small" | "default" | "large" | "full">("default")
  
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // Cargar preferencias del localStorage
  useEffect(() => {
    const storedAccentColor = localStorage.getItem(`${storageKey}-accent`)
    const storedFontSize = localStorage.getItem(`${storageKey}-font-size`)
    const storedReducedMotion = localStorage.getItem(`${storageKey}-reduced-motion`)
    const storedBorderRadius = localStorage.getItem(`${storageKey}-border-radius`)
    
    if (storedAccentColor) setAccentColor(storedAccentColor)
    if (storedFontSize) setFontSize(storedFontSize as "small" | "default" | "large")
    if (storedReducedMotion) setReducedMotion(storedReducedMotion === "true")
    if (storedBorderRadius) setBorderRadius(storedBorderRadius as "none" | "small" | "default" | "large" | "full")
  }, [storageKey])
  
  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}-accent`, accentColor)
    localStorage.setItem(`${storageKey}-font-size`, fontSize)
    localStorage.setItem(`${storageKey}-reduced-motion`, reducedMotion.toString())
    localStorage.setItem(`${storageKey}-border-radius`, borderRadius)
  }, [accentColor, fontSize, reducedMotion, borderRadius, storageKey])
  
  // Aplicar clases CSS según las preferencias
  useEffect(() => {
    const root = document.documentElement
    
    // Aplicar color de acento
    const colors = [
      "slate", "gray", "zinc", "neutral", "stone", 
      "red", "orange", "amber", "yellow", "lime", 
      "green", "emerald", "teal", "cyan", "sky", 
      "blue", "indigo", "violet", "purple", "fuchsia", 
      "pink", "rose"
    ]
    
    // Eliminar todas las clases de color
    colors.forEach(color => {
      root.classList.remove(`accent-${color}`)
    })
    
    // Añadir la clase del color seleccionado
    root.classList.add(`accent-${accentColor}`)
    
    // Aplicar tamaño de fuente
    root.classList.remove("text-sm", "text-base", "text-lg")
    switch (fontSize) {
      case "small":
        root.classList.add("text-sm")
        break
      case "default":
        root.classList.add("text-base")
        break
      case "large":
        root.classList.add("text-lg")
        break
    }
    
    // Aplicar preferencia de movimiento
    if (reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }
    
    // Aplicar radio de borde
    root.classList.remove("radius-none", "radius-small", "radius-default", "radius-large", "radius-full")
    root.classList.add(`radius-${borderRadius}`)
    
  }, [accentColor, fontSize, reducedMotion, borderRadius])
  
  const value = {
    theme: theme || defaultTheme,
    setTheme,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
    borderRadius,
    setBorderRadius,
    isDark,
  }
  
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useEnhancedTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined) {
    throw new Error("useEnhancedTheme must be used within a EnhancedThemeProvider")
  }
  
  return context
}

// Componente para seleccionar el tema
export function ThemeSelector() {
  const { theme, setTheme, isDark } = useEnhancedTheme()
  
  return (
    <div className="flex items-center space-x-2">
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          theme === "light" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800"
        }`}
        onClick={() => setTheme("light")}
        aria-label="Tema claro"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
      
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          theme === "dark" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800"
        }`}
        onClick={() => setTheme("dark")}
        aria-label="Tema oscuro"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
      
      <button
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          theme === "system" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800"
        }`}
        onClick={() => setTheme("system")}
        aria-label="Tema del sistema"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </button>
    </div>
  )
}

// Componente para seleccionar el color de acento
export function AccentColorSelector() {
  const { accentColor, setAccentColor } = useEnhancedTheme()
  
  const colors = [
    { name: "blue", color: "#3b82f6" },
    { name: "green", color: "#10b981" },
    { name: "purple", color: "#8b5cf6" },
    { name: "pink", color: "#ec4899" },
    { name: "orange", color: "#f97316" },
    { name: "red", color: "#ef4444" },
    { name: "indigo", color: "#6366f1" },
    { name: "teal", color: "#14b8a6" },
  ]
  
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.name}
          className={`w-8 h-8 rounded-full transition-all ${
            accentColor === color.name ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : ""
          }`}
          style={{ backgroundColor: color.color }}
          onClick={() => setAccentColor(color.name)}
          aria-label={`Color de acento ${color.name}`}
        />
      ))}
    </div>
  )
}
