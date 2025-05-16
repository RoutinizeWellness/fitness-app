"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function WorkoutRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  // Desenvolver params usando React.use()
  const resolvedParams = use(params)
  const workoutId = resolvedParams.id

  const router = useRouter()

  useEffect(() => {
    // Redirigir a la nueva ruta
    router.replace(`/training/workout-details/${workoutId}`)
  }, [router, workoutId])

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-center">Redirigiendo...</p>
    </div>
  )
}
