"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getWorkoutStats, searchWorkouts } from "@/lib/supabase-queries"
import { Loader2, Calendar, BarChart, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WorkoutStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await getWorkoutStats(user.id)

        if (error) {
          console.error("Error al cargar estadísticas:", error)
          return
        }

        if (data) {
          setStats(data)
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  // Manejar búsqueda
  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return

    try {
      setSearchLoading(true)
      const { data, error } = await searchWorkouts(user.id, {
        query: searchQuery,
        limit: 5,
      })

      if (error) {
        console.error("Error en la búsqueda:", error)
        return
      }

      if (data) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de entrenamientos</CardTitle>
          <CardDescription>Inicia sesión para ver tus estadísticas</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Estadísticas de entrenamientos</CardTitle>
            <CardDescription>Análisis y búsqueda de tus entrenamientos</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/workout-stats/analytics"}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Análisis avanzado
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">
              <BarChart className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Búsqueda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-muted-foreground text-sm">Total de entrenamientos</p>
                    <p className="text-3xl font-bold">{stats.totalWorkouts || 0}</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-muted-foreground text-sm">Último entrenamiento</p>
                    <p className="text-lg font-medium">
                      {stats.latestWorkout ? (
                        new Date(stats.latestWorkout.date).toLocaleDateString()
                      ) : (
                        "Sin datos"
                      )}
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Entrenamientos por tipo</h4>
                  <ul className="space-y-2">
                    {stats.statsByType && stats.statsByType.length > 0 ? (
                      stats.statsByType.map((item: any) => (
                        <li key={item.type} className="flex justify-between items-center">
                          <span>{item.type}</span>
                          <Badge variant="outline">{item.count}</Badge>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-muted-foreground">Sin datos</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay estadísticas disponibles</p>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Buscar entrenamientos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()}>
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
            </div>

            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Resultados de búsqueda</h4>
              {searchLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.map((workout) => (
                    <li key={workout.id} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-medium">{workout.name}</h5>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(workout.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{workout.type}</Badge>
                      </div>
                      {workout.notes && <p className="text-sm mt-1">{workout.notes}</p>}
                    </li>
                  ))}
                </ul>
              ) : searchQuery ? (
                <p className="text-center text-muted-foreground py-2">No se encontraron resultados</p>
              ) : (
                <p className="text-center text-muted-foreground py-2">Ingresa un término de búsqueda</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
