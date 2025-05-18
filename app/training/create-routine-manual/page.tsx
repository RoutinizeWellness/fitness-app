"use client"

import { useAuth } from "@/contexts/auth-context"
import RoutineEditor from "@/components/training/routine-editor"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateRoutineManualPage() {
  const { user, isLoading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
        <p>Debes iniciar sesión para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#573353]">Crear Nueva Rutina Manualmente</h1>
      <RoutineEditor userId={user.uid} />
    </div>
  )
}
