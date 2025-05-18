"use client"

import { ReactNode } from "react"
import { PerformanceProvider } from "@/contexts/performance-provider"
import { AppProvider } from "@/contexts/app-provider"
import { SupabaseProvider } from "@/contexts/supabase-context"
import { AuthProvider } from "@/contexts/auth-context"
import { TrainingProvider } from "@/contexts/training-context"
import { NutritionProvider } from "@/contexts/nutrition-context"

interface AppProvidersProps {
  children: ReactNode
  enablePerformanceMonitoring?: boolean
}

export function AppProviders({
  children,
  enablePerformanceMonitoring = process.env.NODE_ENV === "development",
}: AppProvidersProps) {
  // Envolver la aplicación en todos los proveedores necesarios
  return (
    <PerformanceProvider enabled={enablePerformanceMonitoring} developmentOnly={true}>
      <SupabaseProvider>
        <AuthProvider>
          <TrainingProvider>
            <NutritionProvider>
              <AppProvider>
                {children}
              </AppProvider>
            </NutritionProvider>
          </TrainingProvider>
        </AuthProvider>
      </SupabaseProvider>
    </PerformanceProvider>
  )
}

export default AppProviders
