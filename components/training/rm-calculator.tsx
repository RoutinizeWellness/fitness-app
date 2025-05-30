"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dumbbell, Calculator, RotateCcw, Save, ChevronDown, ChevronUp } from "lucide-react"
import { AnimatedFade } from "@/components/animations/animated-transitions"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { processSupabaseResponse } from "@/lib/supabase-utils"
import { useAuth } from "@/lib/auth/auth-context"

// RM calculation formulas
const RM_FORMULAS = {
  brzycki: (weight: number, reps: number) => weight * (36 / (37 - reps)),
  epley: (weight: number, reps: number) => weight * (1 + 0.0333 * reps),
  lander: (weight: number, reps: number) => (100 * weight) / (101.3 - 2.67123 * reps),
  lombardi: (weight: number, reps: number) => weight * Math.pow(reps, 0.1),
  oconner: (weight: number, reps: number) => weight * (1 + 0.025 * reps),
  wathan: (weight: number, reps: number) => 100 * weight / (48.8 + 53.8 * Math.exp(-0.075 * reps))
}

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

interface RMCalculatorProps {
  onSave?: (data: any) => void
  className?: string
  isExpanded?: boolean
}

export function RMCalculator({ onSave, className, isExpanded: initialExpanded = false }: RMCalculatorProps) {
  const [activeTab, setActiveTab] = useState("calculate")
  const [weight, setWeight] = useState<number | "">("")
  const [reps, setReps] = useState<number | "">(1)
  const [formula, setFormula] = useState("brzycki")
  const [exercise, setExercise] = useState("bench_press")
  const [customExercise, setCustomExercise] = useState("")
  const [results, setResults] = useState<Record<number, number>>({})
  const [savedRMs, setSavedRMs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  const { toast } = useToast()
  const { user } = useAuth()

  // Load saved RMs when component mounts
  useEffect(() => {
    if (user) {
      loadSavedRMs()
    }
  }, [user])

  // Load saved RMs from Supabase
  const loadSavedRMs = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('strength_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        null,
        "Carga de registros de fuerza"
      )

      if (error) {
        console.error("Error loading saved RMs:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros de fuerza guardados",
          variant: "destructive"
        })
        return
      }

      if (data) {
        setSavedRMs(data)
      }
    } catch (error) {
      console.error("Error in loadSavedRMs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate RM based on selected formula
  const calculateRM = () => {
    if (weight === "" || reps === "") {
      toast({
        title: "Datos incompletos",
        description: "Por favor, introduce el peso y las repeticiones",
        variant: "destructive"
      })
      return
    }

    const weightNum = typeof weight === "string" ? parseFloat(weight) : weight
    const repsNum = typeof reps === "string" ? parseInt(reps.toString()) : reps

    if (isNaN(weightNum) || isNaN(repsNum)) {
      toast({
        title: "Datos inválidos",
        description: "Por favor, introduce valores numéricos válidos",
        variant: "destructive"
      })
      return
    }

    const calculationFormula = RM_FORMULAS[formula as keyof typeof RM_FORMULAS]
    const oneRM = calculationFormula(weightNum, repsNum)

    // Calculate RM for 1-12 reps
    const newResults: Record<number, number> = {}
    for (let i = 1; i <= 12; i++) {
      if (i === repsNum) {
        newResults[i] = weightNum
      } else {
        // Calculate weight for i reps based on 1RM
        const percentage = getPercentageForReps(i)
        newResults[i] = Math.round(oneRM * percentage / 100)
      }
    }

    setResults(newResults)
  }

  // Get percentage of 1RM for a given number of reps
  const getPercentageForReps = (reps: number): number => {
    const percentages: Record<number, number> = {
      1: 100,
      2: 95,
      3: 90,
      4: 88,
      5: 85,
      6: 83,
      7: 80,
      8: 78,
      9: 76,
      10: 75,
      11: 72,
      12: 70
    }

    return percentages[reps] || 100
  }

  // Save RM to Supabase
  const saveRM = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar tus registros",
        variant: "destructive"
      })
      return
    }

    if (Object.keys(results).length === 0) {
      toast({
        title: "Sin resultados",
        description: "Primero debes calcular tu RM",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const exerciseName = exercise === "custom" ? customExercise : exercise

      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('strength_logs')
          .insert({
            user_id: user.id,
            exercise: exerciseName,
            weight: typeof weight === "string" ? parseFloat(weight) : weight,
            reps: typeof reps === "string" ? parseInt(reps.toString()) : reps,
            one_rm: results[1],
            formula: formula,
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select(),
        null,
        "Guardado de registro de fuerza"
      )

      if (error) {
        console.error("Error saving RM:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el registro de fuerza",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Registro guardado",
        description: "Tu registro de fuerza ha sido guardado correctamente"
      })

      // Reload saved RMs
      loadSavedRMs()

      // Call onSave callback if provided
      if (onSave && data) {
        onSave(data[0])
      }
    } catch (error) {
      console.error("Error in saveRM:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el registro",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setWeight("")
    setReps(1)
    setFormula("brzycki")
    setExercise("bench_press")
    setCustomExercise("")
    setResults({})
  }

  // Format exercise name for display
  const formatExerciseName = (exerciseValue: string): string => {
    const exercise = COMMON_EXERCISES.find(e => e.value === exerciseValue)
    return exercise ? exercise.label : exerciseValue
  }

  return (
    <AnimatedFade className={className}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Calculadora de RM</CardTitle>
                <CardDescription>Calcula tu repetición máxima (RM) y pesos de entrenamiento</CardDescription>
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
                  <TabsTrigger value="calculate">Calcular</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="calculate" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exercise">Ejercicio</Label>
                      <Select value={exercise} onValueChange={setExercise}>
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

                      {exercise === "custom" && (
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

                    <div className="space-y-2">
                      <Label htmlFor="formula">Fórmula</Label>
                      <Select value={formula} onValueChange={setFormula}>
                        <SelectTrigger id="formula">
                          <SelectValue placeholder="Selecciona una fórmula" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brzycki">Brzycki</SelectItem>
                          <SelectItem value="epley">Epley</SelectItem>
                          <SelectItem value="lander">Lander</SelectItem>
                          <SelectItem value="lombardi">Lombardi</SelectItem>
                          <SelectItem value="oconner">O'Conner</SelectItem>
                          <SelectItem value="wathan">Wathan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="reps"
                          min={1}
                          max={12}
                          step={1}
                          value={[typeof reps === "number" ? reps : 1]}
                          onValueChange={(value) => setReps(value[0])}
                        />
                        <span className="w-8 text-center">{reps}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={calculateRM} className="flex-1">
                      <Calculator className="mr-2 h-4 w-4" />
                      Calcular
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reiniciar
                    </Button>
                  </div>

                  {Object.keys(results).length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Resultados:</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Repeticiones</TableHead>
                            <TableHead>Peso (kg)</TableHead>
                            <TableHead>% de 1RM</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(results).map(([rep, weight]) => (
                            <TableRow key={rep}>
                              <TableCell>{rep}</TableCell>
                              <TableCell>{weight}</TableCell>
                              <TableCell>{getPercentageForReps(parseInt(rep))}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Button onClick={saveRM} className="mt-4 w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar registro
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="pt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : savedRMs.length === 0 ? (
                    <div className="text-center py-8">
                      <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay registros guardados</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Ejercicio</TableHead>
                          <TableHead>Peso x Reps</TableHead>
                          <TableHead>1RM</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedRMs.map((rm) => (
                          <TableRow key={rm.id}>
                            <TableCell>{new Date(rm.date).toLocaleDateString()}</TableCell>
                            <TableCell>{formatExerciseName(rm.exercise)}</TableCell>
                            <TableCell>{rm.weight} kg x {rm.reps}</TableCell>
                            <TableCell>{rm.one_rm} kg</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
