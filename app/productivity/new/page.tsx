"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { useAuth } from "@/lib/auth/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ListTodo, Target } from "lucide-react"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

export default function NewProductivityPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/welcome")
    }
  }, [user, authLoading, router])

  // Navegar a la página de nueva tarea
  const goToNewTask = () => {
    router.push("/productivity/new-task")
  }

  // Navegar a la página de nuevo objetivo
  const goToNewGoal = () => {
    router.push("/productivity/new-goal")
  }

  if (authLoading) {
    return (
      <RoutinizeLayout activeTab="productivity" title="Nueva entrada">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout activeTab="productivity" title="Nueva entrada">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">¿Qué quieres crear?</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={goToNewTask}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <ListTodo className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Nueva Tarea</h2>
              <p className="text-gray-500">Crea una nueva tarea para organizar tus actividades diarias</p>
              <Button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={goToNewTask}
              >
                Crear tarea
              </Button>
            </div>
          </Card>

          <Card
            className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={goToNewGoal}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Nuevo Objetivo</h2>
              <p className="text-gray-500">Establece un nuevo objetivo a largo plazo para tu desarrollo personal</p>
              <Button
                className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                onClick={goToNewGoal}
              >
                Crear objetivo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
