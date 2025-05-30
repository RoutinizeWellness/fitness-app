"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth/auth-context"
import Image from "next/image"
import { 
  Calculator, 
  Apple, 
  Beef, 
  Wheat, 
  Droplets,
  Info,
  ChevronRight,
  Clock,
  Check,
  Utensils,
  Scale,
  Heart
} from "lucide-react"

export function AmateurZeroNutritionBasics() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basics")
  
  // Estado para la calculadora
  const [calculatorValues, setCalculatorValues] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activityLevel: "sedentary"
  })
  const [calculatorResults, setCalculatorResults] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null)

  // Manejar cambios en la calculadora
  const handleCalculatorChange = (field: string, value: string) => {
    setCalculatorValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calcular necesidades nutricionales
  const calculateNutrition = () => {
    const { weight, height, age, gender, activityLevel } = calculatorValues
    
    // Validar entradas
    if (!weight || !height || !age) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive"
      })
      return
    }
    
    // Convertir a números
    const weightNum = parseFloat(weight)
    const heightNum = parseFloat(height)
    const ageNum = parseInt(age)
    
    // Validar valores
    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
      toast({
        title: "Valores inválidos",
        description: "Por favor, ingresa valores positivos para peso, altura y edad.",
        variant: "destructive"
      })
      return
    }
    
    // Calcular TMB (Tasa Metabólica Basal) usando fórmula de Mifflin-St Jeor
    let bmr = 0
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161
    }
    
    // Aplicar factor de actividad
    let calories = 0
    switch (activityLevel) {
      case "sedentary":
        calories = bmr * 1.2
        break
      case "light":
        calories = bmr * 1.375
        break
      case "moderate":
        calories = bmr * 1.55
        break
      case "active":
        calories = bmr * 1.725
        break
      case "very_active":
        calories = bmr * 1.9
        break
      default:
        calories = bmr * 1.2
    }
    
    // Redondear calorías
    calories = Math.round(calories)
    
    // Calcular macronutrientes (distribución básica para principiantes)
    // Proteína: 1.6g por kg de peso corporal
    const protein = Math.round(weightNum * 1.6)
    
    // Grasas: 25% de las calorías totales
    const fats = Math.round((calories * 0.25) / 9)
    
    // Carbohidratos: calorías restantes
    const carbCalories = calories - (protein * 4) - (fats * 9)
    const carbs = Math.round(carbCalories / 4)
    
    // Establecer resultados
    setCalculatorResults({
      calories,
      protein,
      carbs,
      fats
    })
    
    // Mostrar toast de éxito
    toast({
      title: "Cálculo completado",
      description: "Hemos calculado tus necesidades nutricionales básicas.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Apple className="h-5 w-5 mr-2 text-primary" />
          Nutrición para Principiantes
        </CardTitle>
        <CardDescription>
          Conceptos básicos y consejos prácticos para comenzar con una alimentación saludable
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basics" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Conceptos</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              <span>Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Consejos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Calorías</h3>
                  <p className="text-muted-foreground">
                    Las calorías son la energía que tu cuerpo obtiene de los alimentos, como la gasolina para un coche. 
                    Necesitas suficientes para funcionar, pero un exceso se almacena como reserva (grasa corporal).
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="font-medium">Ejemplo:</span>
                    <span className="ml-2">Una manzana = ~80 calorías, una hamburguesa = ~500 calorías</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center">
                    <Beef className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="font-medium">Proteínas</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Los bloques de construcción de tus músculos. Están en alimentos como el pollo, huevos, yogur, legumbres y tofu.
                  </p>
                  <div className="bg-red-50 p-2 rounded text-xs">
                    <span className="font-medium">Función:</span> Reparar y construir tejidos
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center">
                    <Wheat className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Carbohidratos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu fuente rápida de energía, como el arroz, pan, pasta y frutas. Son el combustible inmediato para actividades.
                  </p>
                  <div className="bg-amber-50 p-2 rounded text-xs">
                    <span className="font-medium">Función:</span> Proporcionar energía inmediata
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">Grasas</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Esenciales para tu cerebro y hormonas. En aguacate, frutos secos, aceite de oliva y pescados grasos.
                  </p>
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <span className="font-medium">Función:</span> Salud hormonal y absorción de vitaminas
                  </div>
                </div>
              </div>
              
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image
                  src="/images/nutrition-basics.jpg"
                  alt="Conceptos básicos de nutrición"
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="bg-blue-50 rounded-md p-4 text-sm">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">¿Por qué es importante?</p>
                    <p className="text-blue-700 mt-1">
                      Una nutrición adecuada es fundamental para tus resultados fitness. Proporciona la energía para entrenar, 
                      los materiales para construir músculo y los nutrientes para recuperarte. Incluso el mejor plan de entrenamiento 
                      no funcionará sin una alimentación apropiada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("calculator")}>
                Calculadora de Calorías
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="calculator" className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-md p-4 text-sm">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Calculadora Simplificada</p>
                    <p className="text-blue-700 mt-1">
                      Esta calculadora te dará una estimación de tus necesidades calóricas diarias y una distribución 
                      básica de macronutrientes. Recuerda que estos son valores aproximados para comenzar.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ej: 70"
                      value={calculatorValues.weight}
                      onChange={(e) => handleCalculatorChange("weight", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Ej: 170"
                      value={calculatorValues.height}
                      onChange={(e) => handleCalculatorChange("height", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Ej: 30"
                      value={calculatorValues.age}
                      onChange={(e) => handleCalculatorChange("age", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Género</Label>
                    <RadioGroup
                      value={calculatorValues.gender}
                      onValueChange={(value) => handleCalculatorChange("gender", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Femenino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nivel de Actividad</Label>
                    <RadioGroup
                      value={calculatorValues.activityLevel}
                      onValueChange={(value) => handleCalculatorChange("activityLevel", value)}
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-2 mb-2">
                        <RadioGroupItem value="sedentary" id="sedentary" />
                        <Label htmlFor="sedentary" className="flex-1">Sedentario (poco o nada de ejercicio)</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-2 mb-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="flex-1">Ligeramente activo (1-3 días/semana)</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-2 mb-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate" className="flex-1">Moderadamente activo (3-5 días/semana)</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-2 mb-2">
                        <RadioGroupItem value="active" id="active" />
                        <Label htmlFor="active" className="flex-1">Muy activo (6-7 días/semana)</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-2">
                        <RadioGroupItem value="very_active" id="very_active" />
                        <Label htmlFor="very_active" className="flex-1">Extremadamente activo (atletas, trabajo físico)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={calculateNutrition}
              >
                Calcular Mis Necesidades
              </Button>
              
              {calculatorResults && (
                <div className="mt-6 border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 text-center">Tus Resultados</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold">{calculatorResults.calories}</div>
                      <div className="text-sm text-muted-foreground">Calorías/día</div>
                    </div>
                    
                    <div className="text-center p-3 bg-red-100 rounded-lg">
                      <div className="text-2xl font-bold">{calculatorResults.protein}g</div>
                      <div className="text-sm text-muted-foreground">Proteínas</div>
                    </div>
                    
                    <div className="text-center p-3 bg-amber-100 rounded-lg">
                      <div className="text-2xl font-bold">{calculatorResults.carbs}g</div>
                      <div className="text-sm text-muted-foreground">Carbohidratos</div>
                    </div>
                    
                    <div className="text-center p-3 bg-blue-100 rounded-lg">
                      <div className="text-2xl font-bold">{calculatorResults.fats}g</div>
                      <div className="text-sm text-muted-foreground">Grasas</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-md p-4 text-sm">
                    <p className="font-medium text-green-800">¿Qué significa esto?</p>
                    <p className="text-green-700 mt-1">
                      Estas son tus necesidades estimadas para mantener tu peso actual. Para perder peso, reduce ligeramente 
                      las calorías (300-500 menos). Para ganar músculo, aumenta ligeramente (300-500 más).
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("tips")}>
                Consejos Prácticos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">7 Consejos Accionables</h3>
              
              <div className="space-y-3">
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Proteína en cada comida</h4>
                    <p className="text-sm text-muted-foreground">
                      Incluye una porción de proteína del tamaño de tu palma en cada comida principal.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Beef className="h-3 w-3 mr-1 text-red-500" />
                      <span>Ejemplos: pollo, pescado, huevos, yogur griego, tofu, legumbres</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Colorea tu plato</h4>
                    <p className="text-sm text-muted-foreground">
                      Intenta incluir al menos 2-3 colores diferentes de frutas o verduras en tus comidas principales.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Apple className="h-3 w-3 mr-1 text-green-500" />
                      <span>Más colores = más variedad de nutrientes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Hidratación primero</h4>
                    <p className="text-sm text-muted-foreground">
                      Cuando sientas hambre entre comidas, bebe un vaso de agua primero y espera 15 minutos.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                      <span>A menudo confundimos sed con hambre</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Regla 80/20</h4>
                    <p className="text-sm text-muted-foreground">
                      Aliméntate bien el 80% del tiempo, disfruta sin culpa el 20% restante.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Heart className="h-3 w-3 mr-1 text-red-500" />
                      <span>La consistencia importa más que la perfección</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">5</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Comidas preparadas</h4>
                    <p className="text-sm text-muted-foreground">
                      Dedica 1 hora semanal a preparar opciones saludables fáciles de agarrar.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1 text-amber-500" />
                      <span>La preparación evita decisiones impulsivas cuando tienes hambre</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">6</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Proteína post-entrenamiento</h4>
                    <p className="text-sm text-muted-foreground">
                      Consume algo con proteína dentro de los 30-60 minutos después de entrenar.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Utensils className="h-3 w-3 mr-1 text-purple-500" />
                      <span>Ayuda a la recuperación y construcción muscular</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 border rounded-lg">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium">7</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Señales de hambre</h4>
                    <p className="text-sm text-muted-foreground">
                      Aprende a distinguir entre hambre real y hambre emocional o por aburrimiento.
                    </p>
                    <div className="mt-2 flex items-center text-xs">
                      <Scale className="h-3 w-3 mr-1 text-gray-500" />
                      <span>Come cuando tengas hambre, no por hábito o emociones</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-md p-4 text-sm mt-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Porciones con tus manos</p>
                    <p className="text-blue-700 mt-1">
                      Usa tus manos como guía para porciones:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                      <li>Proteínas: Palma de la mano (sin dedos)</li>
                      <li>Carbohidratos: Puño cerrado</li>
                      <li>Grasas saludables: Pulgar (frutos secos) o cucharada (aceites)</li>
                      <li>Verduras: Dos manos abiertas juntas</li>
                      <li>Frutas: Puño cerrado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("basics")}>
                Volver a Conceptos Básicos
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          Descargar Guía PDF
        </Button>
        <Button>
          Crear Mi Plan Nutricional
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
