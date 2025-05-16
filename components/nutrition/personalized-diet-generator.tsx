"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { useToast } from "@/components/ui/use-toast"
import { generatePersonalizedDiet } from "@/lib/diet-ai-service"
import {
  Utensils,
  Apple,
  Beef,
  Fish,
  Egg,
  Carrot,
  Wheat,
  Milk,
  Coffee,
  Sparkles,
  Brain,
  Check,
  X,
  ChevronRight,
  Info,
  Plus,
  Minus,
  Settings,
  Loader2,
  Zap
} from "lucide-react"

// Tipos de dieta
const DIET_TYPES = [
  { id: "standard", name: "Estándar", description: "Dieta equilibrada con todos los grupos alimenticios" },
  { id: "vegetarian", name: "Vegetariana", description: "Sin carne pero incluye huevos y lácteos" },
  { id: "vegan", name: "Vegana", description: "Sin productos de origen animal" },
  { id: "paleo", name: "Paleo", description: "Basada en alimentos que consumían nuestros ancestros" },
  { id: "keto", name: "Cetogénica", description: "Alta en grasas, moderada en proteínas y baja en carbohidratos" },
  { id: "mediterranean", name: "Mediterránea", description: "Basada en la cocina tradicional mediterránea" },
  { id: "low_carb", name: "Baja en carbohidratos", description: "Reducción de carbohidratos con énfasis en proteínas y grasas" },
  { id: "high_protein", name: "Alta en proteínas", description: "Énfasis en alimentos ricos en proteínas" }
]

// Objetivos nutricionales
const NUTRITION_GOALS = [
  { id: "weight_loss", name: "Pérdida de peso", description: "Déficit calórico para reducir peso" },
  { id: "maintenance", name: "Mantenimiento", description: "Equilibrio calórico para mantener el peso actual" },
  { id: "muscle_gain", name: "Ganancia muscular", description: "Superávit calórico para aumentar masa muscular" },
  { id: "performance", name: "Rendimiento deportivo", description: "Optimizado para mejorar el rendimiento físico" },
  { id: "health", name: "Salud general", description: "Enfocado en mejorar marcadores de salud" }
]

interface PersonalizedDietGeneratorProps {
  userId: string
}

export function PersonalizedDietGenerator({ userId }: PersonalizedDietGeneratorProps) {
  const [dietType, setDietType] = useState<string>("standard")
  const [goal, setGoal] = useState<string>("maintenance")
  const [mealsPerDay, setMealsPerDay] = useState<number>(3)
  const [durationDays, setDurationDays] = useState<string>("7")
  const [includeSnacks, setIncludeSnacks] = useState<boolean>(true)
  const [calorieAdjustment, setCalorieAdjustment] = useState<number>(0)
  const [proteinAdjustment, setProteinAdjustment] = useState<number>(0)
  const [carbsAdjustment, setCarbsAdjustment] = useState<number>(0)
  const [fatAdjustment, setFatAdjustment] = useState<number>(0)
  const [customName, setCustomName] = useState<string>("")
  const [customDescription, setCustomDescription] = useState<string>("")
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const { toast } = useToast()

  // Generar dieta personalizada
  const handleGenerateDiet = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para generar una dieta",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    toast({
      title: "Generando dieta",
      description: "Estamos creando tu plan de alimentación personalizado..."
    })

    try {
      // Preparar opciones para la generación de la dieta
      const options = {
        name: customName || `Plan ${DIET_TYPES.find(d => d.id === dietType)?.name} - ${NUTRITION_GOALS.find(g => g.id === goal)?.name}`,
        description: customDescription || `Plan de alimentación personalizado con enfoque en ${NUTRITION_GOALS.find(g => g.id === goal)?.name.toLowerCase()}.`,
        dietType: dietType,
        durationDays: parseInt(durationDays),
        mealsPerDay: mealsPerDay,
        includeSnacks: includeSnacks,
        calorieAdjustment: calorieAdjustment,
        proteinAdjustment: proteinAdjustment,
        carbsAdjustment: carbsAdjustment,
        fatAdjustment: fatAdjustment,
        goal: goal
      }

      // Llamar al servicio de generación de dietas
      const { data, error } = await generatePersonalizedDiet(userId, options)

      if (error) {
        console.error("Error al generar dieta:", error)
        toast({
          title: "Error",
          description: "No se pudo generar la dieta personalizada",
          variant: "destructive"
        })
        return
      }

      if (data) {
        toast({
          title: "Dieta generada",
          description: "Tu plan de alimentación personalizado ha sido creado correctamente"
        })
        setShowSuccess(true)
      }
    } catch (error) {
      console.error("Error al generar dieta:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al generar la dieta",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {showSuccess ? (
        <OrganicElement type="fade">
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">¡Dieta generada con éxito!</h3>
              <p className="text-gray-500 mb-6">
                Tu plan de alimentación personalizado ha sido creado correctamente.
                Puedes verlo en la sección de "Mis dietas".
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSuccess(false)}
                  className="rounded-full"
                >
                  Crear otra dieta
                </Button>
                <Button className="rounded-full">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Ver mis dietas
                </Button>
              </div>
            </div>
          </Card>
        </OrganicElement>
      ) : (
        <div className="space-y-6">
          <OrganicElement type="fade">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Generador de dietas personalizadas</h3>
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-gray-500 mb-6">
                Crea un plan de alimentación personalizado basado en tus preferencias y objetivos.
                Nuestro algoritmo de IA generará un plan detallado con recetas y cantidades específicas.
              </p>

              <div className="space-y-6">
                {/* Tipo de dieta */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Tipo de dieta</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DIET_TYPES.map(diet => (
                      <div
                        key={diet.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          dietType === diet.id ? "border-primary bg-primary/5" : "hover:border-gray-300"
                        }`}
                        onClick={() => setDietType(diet.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{diet.name}</span>
                          {dietType === diet.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{diet.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objetivo nutricional */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Objetivo nutricional</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {NUTRITION_GOALS.map(goal => (
                      <div
                        key={goal.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          goal.id === goal ? "border-primary bg-primary/5" : "hover:border-gray-300"
                        }`}
                        onClick={() => setGoal(goal.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{goal.name}</span>
                          {goal.id === goal && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-gray-500">{goal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comidas por día */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Comidas por día: {mealsPerDay}</h4>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMealsPerDay(Math.max(2, mealsPerDay - 1))}
                      disabled={mealsPerDay <= 2}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[mealsPerDay]}
                      min={2}
                      max={6}
                      step={1}
                      onValueChange={(value) => setMealsPerDay(value[0])}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMealsPerDay(Math.min(6, mealsPerDay + 1))}
                      disabled={mealsPerDay >= 6}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Duración del plan */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Duración del plan</h4>
                  <Select value={durationDays} onValueChange={setDurationDays}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="14">14 días</SelectItem>
                      <SelectItem value="28">28 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Incluir snacks */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-snacks"
                    checked={includeSnacks}
                    onCheckedChange={setIncludeSnacks}
                  />
                  <Label htmlFor="include-snacks">Incluir snacks entre comidas</Label>
                </div>

                {/* Opciones avanzadas */}
                <div>
                  <Button
                    variant="ghost"
                    className="flex items-center p-0"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvancedOptions ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
                  </Button>

                  {showAdvancedOptions && (
                    <OrganicElement type="fade">
                      <div className="mt-4 space-y-4 border rounded-lg p-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Ajuste de calorías: {calorieAdjustment > 0 ? `+${calorieAdjustment}%` : `${calorieAdjustment}%`}</h4>
                          </div>
                          <Slider
                            value={[calorieAdjustment]}
                            min={-20}
                            max={20}
                            step={5}
                            onValueChange={(value) => setCalorieAdjustment(value[0])}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Ajuste de proteínas: {proteinAdjustment > 0 ? `+${proteinAdjustment}%` : `${proteinAdjustment}%`}</h4>
                          </div>
                          <Slider
                            value={[proteinAdjustment]}
                            min={-20}
                            max={20}
                            step={5}
                            onValueChange={(value) => setProteinAdjustment(value[0])}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Ajuste de carbohidratos: {carbsAdjustment > 0 ? `+${carbsAdjustment}%` : `${carbsAdjustment}%`}</h4>
                          </div>
                          <Slider
                            value={[carbsAdjustment]}
                            min={-20}
                            max={20}
                            step={5}
                            onValueChange={(value) => setCarbsAdjustment(value[0])}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Ajuste de grasas: {fatAdjustment > 0 ? `+${fatAdjustment}%` : `${fatAdjustment}%`}</h4>
                          </div>
                          <Slider
                            value={[fatAdjustment]}
                            min={-20}
                            max={20}
                            step={5}
                            onValueChange={(value) => setFatAdjustment(value[0])}
                          />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Nombre personalizado (opcional)</h4>
                          <Input
                            placeholder="Ej: Mi dieta de verano"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                          />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Descripción personalizada (opcional)</h4>
                          <Textarea
                            placeholder="Describe tu dieta personalizada..."
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </OrganicElement>
                  )}
                </div>

                <Button
                  className="w-full rounded-full"
                  onClick={handleGenerateDiet}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando dieta...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generar dieta personalizada
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </OrganicElement>
        </div>
      )}
    </div>
  )
}
