"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import RoutineEditor from "@/components/training/routine-editor"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditRoutinePage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const routineId = params.id as string

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
      <h1 className="text-2xl font-bold mb-6 text-[#573353]">Editar Rutina</h1>
      <RoutineEditor routineId={routineId} userId={user.uid} />
    </div>
  )
}
