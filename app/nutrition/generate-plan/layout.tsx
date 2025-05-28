"use client"

import { AuthProvider } from "@/lib/auth/auth-context"
import { NutritionProvider } from "@/contexts/nutrition-context"

export default function GeneratePlanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <NutritionProvider>
        {children}
      </NutritionProvider>
    </AuthProvider>
  )
}
