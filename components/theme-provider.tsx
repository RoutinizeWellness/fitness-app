'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  // Force the theme to be the default on initial render to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false)

  // After hydration, we can safely enable theme switching
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      enableSystem={mounted} // Only enable system theme after mounting
      attribute="class" // Cambiado a 'class' para funcionar con Tailwind CSS
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
