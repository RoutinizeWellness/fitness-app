"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChevronDown, ChevronUp, TrendingUp, Plus, Save, Trash2 } from "lucide-react"
import { AnimatedFade } from "@/components/animations/animated-transitions"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { processSupabaseResponse } from "@/lib/supabase-utils"
import { useAuth } from "@/lib/contexts/auth-context"
import { v4 as uuidv4 } from "uuid"

// Common exercises for the dropdown
const COMMON_EXERCISES = [
  { value: "bench_press", label: "Press de Banca" },
  { value: "squat", label: "Sentadilla" },
  { value: "deadlift", label: "Peso Muerto" },
  { value: "overhead_press", label: "Press Militar" },
  { value: "barbell_row", label: "Remo con Barra" },
  { value: "pull_up", label: "Dominadas" },
  { value: "dip", label: "Fondos" },
  { value: "leg_press", label: "Prensa de Piernas" },
  { value: "lat_pulldown", label: "Jalón al Pecho" },
  { value: "bicep_curl", label: "Curl de Bíceps" }
]

// Types for progressive overload tracking
interface ProgressEntry {
  id: string
  exerciseId: string
  date: string
  weight: number
  reps: number
  sets: number
  rpe: number
  notes: string
}

interface ProgressiveOverloadTrackerProps {
  className?: string
  isExpanded?: boolean
}

export function ProgressiveOverloadTracker({ className, isExpanded: initialExpanded = false }: ProgressiveOverloadTrackerProps) {
  const [activeTab, setActiveTab] = useState("track")
  const [selectedExercise, setSelectedExercise] = useState("bench_press")
  const [customExercise, setCustomExercise] = useState("")
  const [weight, setWeight] = useState<number | "">("")
  const [reps, setReps] = useState<number | "">(8)
  const [sets, setSets] = useState<number | "">(3)
  const [rpe, setRpe] = useState<number | "">(7)
  const [notes, setNotes] = useState("")
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  const { toast } = useToast()
  const { user } = useAuth()

  // Load progress entries when component mounts or exercise changes
  useEffect(() => {
    if (user && selectedExercise) {
      loadProgressEntries()
    }
  }, [user, selectedExercise])

  // Load progress entries from Supabase
  const loadProgressEntries = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const exerciseId = selectedExercise === "custom" ? customExercise : selectedExercise

      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('progressive_overload')
          .select('*')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .order('date', { ascending: false })
          .limit(20),
        null,
        "Carga de registros de progresión"
      )

      if (error) {
        console.error("Error loading progress entries:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros de progresión",
          variant: "destructive"
        })
        return
      }

      if (data) {
        const formattedEntries: ProgressEntry[] = data.map(entry => ({
          id: entry.id,
          exerciseId: entry.exercise_id,
          date: entry.date,
          weight: entry.weight,
          reps: entry.reps,
          sets: entry.sets,
          rpe: entry.rpe,
          notes: entry.notes
        }))

        setProgressEntries(formattedEntries)
      }
    } catch (error) {
      console.error("Error in loadProgressEntries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save progress entry to Supabase
  const saveProgressEntry = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar tu progreso",
        variant: "destructive"
      })
      return
    }

    if (weight === "" || reps === "" || sets === "") {
      toast({
        title: "Datos incompletos",
        description: "Por favor, introduce el peso, repeticiones y series",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const exerciseId = selectedExercise === "custom" ? customExercise : selectedExercise

      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('progressive_overload')
          .insert({
            id: uuidv4(),
            user_id: user.id,
            exercise_id: exerciseId,
            date: new Date().toISOString(),
            weight: typeof weight === "string" ? parseFloat(weight) : weight,
            reps: typeof reps === "string" ? parseInt(reps.toString()) : reps,
            sets: typeof sets === "string" ? parseInt(sets.toString()) : sets,
            rpe: typeof rpe === "string" ? parseInt(rpe.toString()) : rpe,
            notes: notes,
            created_at: new Date().toISOString()
          })
          .select(),
        null,
        "Guardado de registro de progresión"
      )

      if (error) {
        console.error("Error saving progress entry:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el registro de progresión",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Registro guardado",
        description: "Tu registro de progresión ha sido guardado correctamente"
      })

      // Reset form
      setWeight("")
      setReps(8)
      setSets(3)
      setRpe(7)
      setNotes("")

      // Reload progress entries
      loadProgressEntries()
    } catch (error) {
      console.error("Error in saveProgressEntry:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el registro",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete progress entry
  const deleteProgressEntry = async (id: string) => {
    if (!user) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('progressive_overload')
        .delete()
        .eq('id', id)

      if (error) {
        console.error("Error deleting progress entry:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el registro",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado correctamente"
      })

      // Reload progress entries
      loadProgressEntries()
    } catch (error) {
      console.error("Error in deleteProgressEntry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format exercise name for display
  const formatExerciseName = (exerciseValue: string): string => {
    const exercise = COMMON_EXERCISES.find(e => e.value === exerciseValue)
    return exercise ? exercise.label : exerciseValue
  }

  // Prepare data for chart
  const chartData = [...progressEntries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weight,
      volume: entry.weight * entry.reps * entry.sets
    }))

  return (
    <AnimatedFade className={className}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Seguimiento de Progresión</CardTitle>
                <CardDescription>Registra y visualiza tu progresión de sobrecarga progresiva</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Contraer" : "Expandir"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="track">Registrar</TabsTrigger>
                  <TabsTrigger value="analyze">Analizar</TabsTrigger>
                </TabsList>

                <TabsContent value="track" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="exercise">Ejercicio</Label>
                      <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                        <SelectTrigger id="exercise">
                          <SelectValue placeholder="Selecciona un ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_EXERCISES.map(exercise => (
                            <SelectItem key={exercise.value} value={exercise.value}>
                              {exercise.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>

                      {selectedExercise === "custom" && (
                        <div className="mt-2">
                          <Label htmlFor="customExercise">Nombre del ejercicio</Label>
                          <Input
                            id="customExercise"
                            value={customExercise}
                            onChange={(e) => setCustomExercise(e.target.value)}
                            placeholder="Ej: Curl de bíceps"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          placeholder="Ej: 100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reps">Repeticiones</Label>
                        <Input
                          id="reps"
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value === "" ? "" : parseInt(e.target.value))}
                          placeholder="Ej: 8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sets">Series</Label>
                        <Input
                          id="sets"
                          type="number"
                          value={sets}
                          onChange={(e) => setSets(e.target.value === "" ? "" : parseInt(e.target.value))}
                          placeholder="Ej: 3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rpe">RPE (1-10)</Label>
                        <Input
                          id="rpe"
                          type="number"
                          value={rpe}
                          onChange={(e) => setRpe(e.target.value === "" ? "" : parseInt(e.target.value))}
                          placeholder="Ej: 7"
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: Buena técnica, aumentar peso la próxima vez"
                      />
                    </div>

                    <Button onClick={saveProgressEntry} className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Registro
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="analyze" className="space-y-4 pt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : progressEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay registros para este ejercicio</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("track")}
                      >
                        Añadir Registro
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="weight"
                              name="Peso (kg)"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="volume"
                              name="Volumen (kg)"
                              stroke="#82ca9d"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Peso (kg)</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Series</TableHead>
                            <TableHead>RPE</TableHead>
                            <TableHead>Volumen</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {progressEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                              <TableCell>{entry.weight}</TableCell>
                              <TableCell>{entry.reps}</TableCell>
                              <TableCell>{entry.sets}</TableCell>
                              <TableCell>{entry.rpe}</TableCell>
                              <TableCell>{entry.weight * entry.reps * entry.sets}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteProgressEntry(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        )}
      </Card>
    </AnimatedFade>
  )
}
