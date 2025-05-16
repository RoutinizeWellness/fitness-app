"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Workout } from "@/lib/supabase-client"
import { RealtimeSubscription } from "@/lib/supabase-realtime"
import { subscribeToWorkouts } from "@/lib/supabase"
import { getWorkouts } from "@/lib/supabase-queries"

export default function RealtimeWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [subscription, setSubscription] = useState<RealtimeSubscription | null>(null)
  const [lastEvent, setLastEvent] = useState<string | null>(null)

  // Cargar entrenamientos iniciales
  useEffect(() => {
    const loadWorkouts = async () => {
      if (!user) return

      try {
        const { data, error } = await getWorkouts(user.id)
        if (error) {
          console.error("Error al cargar entrenamientos:", error)
          return
        }

        if (data) {
          setWorkouts(data)
        }
      } catch (error) {
        console.error("Error al cargar entrenamientos:", error)
      }
    }

    loadWorkouts()
  }, [user])

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user) return

    // Crear suscripción
    const sub = subscribeToWorkouts(user.id, (payload) => {
      setLastEvent(`${payload.eventType} - ${new Date().toLocaleTimeString()}`)

      // Actualizar la lista de entrenamientos según el evento
      if (payload.eventType === "INSERT") {
        setWorkouts((prev) => [payload.new as Workout, ...prev])
      } else if (payload.eventType === "UPDATE") {
        setWorkouts((prev) =>
          prev.map((workout) => (workout.id === payload.new.id ? (payload.new as Workout) : workout))
        )
      } else if (payload.eventType === "DELETE") {
        setWorkouts((prev) => prev.filter((workout) => workout.id !== payload.old.id))
      }
    })

    setSubscription(sub)

    // Limpiar suscripción al desmontar
    return () => {
      if (sub) {
        sub.unsubscribe()
      }
    }
  }, [user])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos en tiempo real</CardTitle>
          <CardDescription>Inicia sesión para ver tus entrenamientos</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Entrenamientos en tiempo real
          {lastEvent && (
            <Badge variant="outline" className="ml-2">
              Último evento: {lastEvent}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Los cambios en tus entrenamientos se mostrarán automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No hay entrenamientos registrados</p>
        ) : (
          <ul className="space-y-2">
            {workouts.slice(0, 5).map((workout) => (
              <li key={workout.id} className="border rounded-md p-3">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{workout.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {workout.type} - {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{workout.type}</Badge>
                </div>
                {workout.notes && <p className="text-sm mt-2">{workout.notes}</p>}
              </li>
            ))}
            {workouts.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                Mostrando 5 de {workouts.length} entrenamientos
              </p>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
