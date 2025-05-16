"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useTheme } from "next-themes"

type OrganicThemeProviderProps = {
  children: ReactNode
  defaultTheme?: string
  storageKey?: string
}

type OrganicThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
  accentColor: "amber" | "purple" | "mixed"
  setAccentColor: (color: "amber" | "purple" | "mixed") => void
  borderRadius: "xs" | "sm" | "md" | "lg" | "xl" | "pill"
  setBorderRadius: (radius: "xs" | "sm" | "md" | "lg" | "xl" | "pill") => void
  animation: "none" | "subtle" | "playful"
  setAnimation: (animation: "none" | "subtle" | "playful") => void
  glassMorphism: boolean
  setGlassMorphism: (enabled: boolean) => void
  isDark: boolean
}

const initialState: OrganicThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "amber",
  setAccentColor: () => null,
  borderRadius: "md",
  setBorderRadius: () => null,
  animation: "subtle",
  setAnimation: () => null,
  glassMorphism: false,
  setGlassMorphism: () => null,
  isDark: false,
}

const OrganicThemeProviderContext = createContext<OrganicThemeProviderState>(initialState)

export function OrganicThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "routinize-organic-theme",
  ...props
}: OrganicThemeProviderProps) {
  const [accentColor, setAccentColor] = useState<"amber" | "purple" | "mixed">("amber")
  const [borderRadius, setBorderRadius] = useState<"xs" | "sm" | "md" | "lg" | "xl" | "pill">("md")
  const [animation, setAnimation] = useState<"none" | "subtle" | "playful">("subtle")
  const [glassMorphism, setGlassMorphism] = useState<boolean>(false)

  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Cargar preferencias del localStorage
  useEffect(() => {
    const storedAccentColor = localStorage.getItem(`${storageKey}-accent`)
    const storedBorderRadius = localStorage.getItem(`${storageKey}-border-radius`)
    const storedAnimation = localStorage.getItem(`${storageKey}-animation`)
    const storedGlassMorphism = localStorage.getItem(`${storageKey}-glass`)

    if (storedAccentColor) setAccentColor(storedAccentColor as "amber" | "purple" | "mixed")
    if (storedBorderRadius) setBorderRadius(storedBorderRadius as "xs" | "sm" | "md" | "lg" | "xl" | "pill")
    if (storedAnimation) setAnimation(storedAnimation as "none" | "subtle" | "playful")
    if (storedGlassMorphism) setGlassMorphism(storedGlassMorphism === "true")
  }, [storageKey])

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}-accent`, accentColor)
    localStorage.setItem(`${storageKey}-border-radius`, borderRadius)
    localStorage.setItem(`${storageKey}-animation`, animation)
    localStorage.setItem(`${storageKey}-glass`, String(glassMorphism))
  }, [storageKey, accentColor, borderRadius, animation, glassMorphism])

  // Aplicar clases CSS según las preferencias
  useEffect(() => {
    const root = document.documentElement

    // Aplicar color de acento
    const accentColors = ["amber", "purple", "mixed"]

    // Eliminar todas las clases de color
    accentColors.forEach(color => {
      root.classList.remove(`accent-organic-${color}`)
    })

    // Añadir la clase del color seleccionado
    root.classList.add(`accent-organic-${accentColor}`)

    // Aplicar radio de borde
    root.classList.remove(
      "radius-organic-xs",
      "radius-organic-sm",
      "radius-organic-md",
      "radius-organic-lg",
      "radius-organic-xl",
      "radius-organic-pill"
    )
    root.classList.add(`radius-organic-${borderRadius}`)

    // Aplicar nivel de animación
    root.classList.remove("animation-none", "animation-subtle", "animation-playful")
    root.classList.add(`animation-${animation}`)

    // Aplicar efecto de vidrio
    if (glassMorphism) {
      root.classList.add("glass-morphism-enabled")
    } else {
      root.classList.remove("glass-morphism-enabled")
    }

    // Aplicar variables CSS para el tema orgánico mejorado
    if (accentColor === "amber") {
      root.style.setProperty('--primary-gradient-start', '43 96% 56%')
      root.style.setProperty('--primary-gradient-end', '36 100% 50%')
      root.style.setProperty('--secondary-gradient-start', '142 71% 45%')
      root.style.setProperty('--secondary-gradient-end', '142 69% 58%')
      root.style.setProperty('--accent-gradient-start', '217 91% 60%')
      root.style.setProperty('--accent-gradient-end', '221 83% 53%')
    } else if (accentColor === "purple") {
      root.style.setProperty('--primary-gradient-start', '262 83% 58%')
      root.style.setProperty('--primary-gradient-end', '250 95% 64%')
      root.style.setProperty('--secondary-gradient-start', '142 71% 45%')
      root.style.setProperty('--secondary-gradient-end', '142 69% 58%')
      root.style.setProperty('--accent-gradient-start', '326 100% 74%')
      root.style.setProperty('--accent-gradient-end', '339 90% 51%')
    } else {
      root.style.setProperty('--primary-gradient-start', '221 83% 53%')
      root.style.setProperty('--primary-gradient-end', '217 91% 60%')
      root.style.setProperty('--secondary-gradient-start', '142 71% 45%')
      root.style.setProperty('--secondary-gradient-end', '142 69% 58%')
      root.style.setProperty('--accent-gradient-start', '339 90% 51%')
      root.style.setProperty('--accent-gradient-end', '326 85% 65%')
    }

    // Aplicar variables para categorías
    root.style.setProperty('--training-color', '221 83% 53%')
    root.style.setProperty('--nutrition-color', '142 71% 45%')
    root.style.setProperty('--sleep-color', '217 91% 60%')
    root.style.setProperty('--wellness-color', '339 90% 51%')
    root.style.setProperty('--productivity-color', '43 96% 56%')

    // Aplicar radios de borde según la preferencia
    let cardRadius, buttonRadius, inputRadius, badgeRadius

    switch (borderRadius) {
      case 'xs':
        cardRadius = '8px'
        buttonRadius = '4px'
        inputRadius = '4px'
        badgeRadius = '2px'
        break
      case 'sm':
        cardRadius = '12px'
        buttonRadius = '8px'
        inputRadius = '6px'
        badgeRadius = '4px'
        break
      case 'md':
        cardRadius = '16px'
        buttonRadius = '12px'
        inputRadius = '8px'
        badgeRadius = '6px'
        break
      case 'lg':
        cardRadius = '24px'
        buttonRadius = '16px'
        inputRadius = '12px'
        badgeRadius = '8px'
        break
      case 'xl':
        cardRadius = '32px'
        buttonRadius = '24px'
        inputRadius = '16px'
        badgeRadius = '12px'
        break
      case 'pill':
        cardRadius = '24px'
        buttonRadius = '9999px'
        inputRadius = '9999px'
        badgeRadius = '9999px'
        break
      default:
        cardRadius = '16px'
        buttonRadius = '12px'
        inputRadius = '8px'
        badgeRadius = '6px'
    }

    root.style.setProperty('--card-radius', cardRadius)
    root.style.setProperty('--button-radius', buttonRadius)
    root.style.setProperty('--input-radius', inputRadius)
    root.style.setProperty('--badge-radius', badgeRadius)

  }, [accentColor, borderRadius, animation, glassMorphism])

  const value = {
    theme: theme || defaultTheme,
    setTheme,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    animation,
    setAnimation,
    glassMorphism,
    setGlassMorphism,
    isDark,
  }

  return (
    <OrganicThemeProviderContext.Provider {...props} value={value}>
      {children}
    </OrganicThemeProviderContext.Provider>
  )
}

export const useOrganicTheme = () => {
  const context = useContext(OrganicThemeProviderContext)

  if (context === undefined) {
    throw new Error("useOrganicTheme must be used within a OrganicThemeProvider")
  }

  return context
}

// Componente para configurar el tema orgánico
export function OrganicThemeConfigurator() {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    animation,
    setAnimation,
    glassMorphism,
    setGlassMorphism,
    isDark
  } = useOrganicTheme()

  return (
    <div className="space-y-6 p-6 bg-card rounded-3xl shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Personalizar tema</h3>
        <div className="flex items-center space-x-2">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setTheme("light")}
            aria-label="Tema claro"
          >
            ☀️
          </button>
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setTheme("dark")}
            aria-label="Tema oscuro"
          >
            🌙
          </button>
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              theme === "system" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setTheme("system")}
            aria-label="Tema del sistema"
          >
            💻
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Color de acento</p>
          <p className="text-xs text-muted-foreground">Define el estilo visual de la app</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 ${
              accentColor === "amber" ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            onClick={() => setAccentColor("amber")}
            aria-label="Color ámbar"
          >
            <span className="sr-only">Ámbar</span>
          </button>
          <button
            className={`h-12 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 ${
              accentColor === "purple" ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            onClick={() => setAccentColor("purple")}
            aria-label="Color púrpura"
          >
            <span className="sr-only">Púrpura</span>
          </button>
          <button
            className={`h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 ${
              accentColor === "mixed" ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            onClick={() => setAccentColor("mixed")}
            aria-label="Color mixto"
          >
            <span className="sr-only">Mixto</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Radio de borde</p>
          <p className="text-xs text-muted-foreground">Personaliza la forma de los elementos</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["xs", "md", "pill"] as const).map((radius) => (
            <button
              key={radius}
              className={`px-3 py-2 text-sm border ${
                borderRadius === radius
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              } ${radius === "xs" ? "rounded-sm" : radius === "md" ? "rounded-xl" : "rounded-full"}`}
              onClick={() => setBorderRadius(radius)}
            >
              {radius === "xs" ? "Cuadrado" : radius === "md" ? "Redondeado" : "Píldora"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Animaciones</p>
          <p className="text-xs text-muted-foreground">Ajusta el nivel de movimiento</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["none", "subtle", "playful"] as const).map((anim) => (
            <button
              key={anim}
              className={`px-3 py-2 text-sm border ${
                animation === anim
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              } rounded-xl`}
              onClick={() => setAnimation(anim)}
            >
              {anim === "none" ? "Ninguna" : anim === "subtle" ? "Sutil" : "Juguetona"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
        <div>
          <p className="text-sm font-medium">Efecto de vidrio</p>
          <p className="text-xs text-muted-foreground">Añade transparencia a los elementos</p>
        </div>
        <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          data-state={glassMorphism ? "checked" : "unchecked"}
          onClick={() => setGlassMorphism(!glassMorphism)}
        >
          <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            data-state={glassMorphism ? "checked" : "unchecked"}
          />
        </div>
      </div>

      <div className="pt-2">
        <p className="text-xs text-center text-muted-foreground">
          Estos ajustes se guardarán automáticamente en tu dispositivo
        </p>
      </div>
    </div>
  )
}
