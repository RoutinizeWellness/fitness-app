"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Apple, Utensils, Coffee, Check, ChevronRight, HelpCircle, BookOpen, Play } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useUserExperience } from "@/contexts/user-experience-context"

// Contenido educativo para principiantes
const NUTRITION_BASICS = [
  {
    id: "macros",
    title: "Macronutrientes",
    icon: <Apple className="h-5 w-5" />,
    description: "Los bloques fundamentales de tu alimentación",
    content: `
      <h3>¿Qué son los macronutrientes?</h3>
      <p>Los macronutrientes son los tres componentes principales de cualquier dieta: proteínas, carbohidratos y grasas. Cada uno tiene funciones específicas en tu cuerpo:</p>
      
      <h4>Proteínas</h4>
      <p>Las proteínas son esenciales para construir y reparar tejidos, incluyendo los músculos. Cada gramo de proteína proporciona 4 calorías.</p>
      <p><strong>Fuentes:</strong> Carnes, pescados, huevos, lácteos, legumbres, tofu.</p>
      
      <h4>Carbohidratos</h4>
      <p>Los carbohidratos son la principal fuente de energía para tu cuerpo. Cada gramo de carbohidratos proporciona 4 calorías.</p>
      <p><strong>Fuentes:</strong> Arroz, pasta, pan, patatas, frutas, verduras.</p>
      
      <h4>Grasas</h4>
      <p>Las grasas son esenciales para la absorción de vitaminas, la producción de hormonas y la salud cerebral. Cada gramo de grasa proporciona 9 calorías.</p>
      <p><strong>Fuentes:</strong> Aceite de oliva, aguacates, frutos secos, pescados grasos.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/example1",
    completed: false
  },
  {
    id: "calories",
    title: "Calorías y Balance Energético",
    icon: <Utensils className="h-5 w-5" />,
    description: "Entendiendo el equilibrio entre consumo y gasto",
    content: `
      <h3>¿Qué son las calorías?</h3>
      <p>Las calorías son unidades de energía. Todo lo que comes y bebes contiene calorías, y tu cuerpo las utiliza como combustible para funcionar.</p>
      
      <h3>Balance energético</h3>
      <p>El balance energético es la relación entre las calorías que consumes y las que gastas:</p>
      <ul>
        <li><strong>Balance neutro:</strong> Consumes = Gastas → Mantienes tu peso</li>
        <li><strong>Balance positivo:</strong> Consumes > Gastas → Ganas peso</li>
        <li><strong>Balance negativo:</strong> Consumes < Gastas → Pierdes peso</li>
      </ul>
      
      <h3>¿Cuántas calorías necesito?</h3>
      <p>Depende de varios factores: edad, sexo, peso, altura, nivel de actividad y objetivos. Como punto de partida:</p>
      <ul>
        <li>Mujeres: 1800-2200 calorías/día</li>
        <li>Hombres: 2200-2800 calorías/día</li>
      </ul>
      <p>Estos son valores aproximados. Para un cálculo más preciso, utiliza la calculadora de calorías en la app.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/example2",
    completed: false
  },
  {
    id: "meal_timing",
    title: "Distribución de Comidas",
    icon: <Coffee className="h-5 w-5" />,
    description: "Cuándo y cómo distribuir tus comidas",
    content: `
      <h3>Frecuencia de comidas</h3>
      <p>No existe un número "mágico" de comidas al día. Lo importante es encontrar un patrón que funcione para ti y tus objetivos.</p>
      
      <h3>Opciones comunes</h3>
      <ul>
        <li><strong>3 comidas principales:</strong> Desayuno, comida y cena</li>
        <li><strong>5-6 comidas pequeñas:</strong> Comidas principales + snacks</li>
        <li><strong>Ayuno intermitente:</strong> Alternar períodos de alimentación y ayuno</li>
      </ul>
      
      <h3>Consejos para principiantes</h3>
      <ul>
        <li>Mantén un horario regular de comidas</li>
        <li>No te saltes el desayuno</li>
        <li>Come algo después de entrenar</li>
        <li>Evita cenas muy copiosas justo antes de dormir</li>
        <li>Mantente hidratado durante todo el día</li>
      </ul>
    `,
    videoUrl: "https://www.youtube.com/embed/example3",
    completed: false
  }
]

// Recetas sencillas para principiantes
const BEGINNER_RECIPES = [
  {
    id: "recipe1",
    title: "Bowl de proteínas post-entrenamiento",
    time: "15 min",
    difficulty: "Fácil",
    macros: {
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 15
    },
    ingredients: [
      "150g de pechuga de pollo",
      "100g de arroz integral",
      "1 aguacate pequeño",
      "Verduras variadas",
      "Salsa de yogur"
    ],
    steps: [
      "Cocina el arroz según las instrucciones",
      "Corta el pollo en tiras y cocínalo a la plancha",
      "Corta el aguacate y las verduras",
      "Monta el bowl con el arroz de base",
      "Añade el pollo, aguacate y verduras encima",
      "Aliña con la salsa de yogur"
    ],
    image: "/images/recipes/protein-bowl.jpg"
  },
  {
    id: "recipe2",
    title: "Batido de proteínas con frutas",
    time: "5 min",
    difficulty: "Muy fácil",
    macros: {
      calories: 300,
      protein: 25,
      carbs: 30,
      fat: 8
    },
    ingredients: [
      "1 scoop de proteína de suero",
      "1 plátano",
      "100g de fresas",
      "250ml de leche o bebida vegetal",
      "Hielo al gusto"
    ],
    steps: [
      "Añade todos los ingredientes a la batidora",
      "Bate hasta conseguir una textura homogénea",
      "Sirve inmediatamente"
    ],
    image: "/images/recipes/protein-shake.jpg"
  }
]

export function NutritionBasics() {
  const { experienceLevel } = useUserExperience()
  const [activeTab, setActiveTab] = useState("learn")
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [showRecipeDetails, setShowRecipeDetails] = useState<string | null>(null)
  
  // Marcar una lección como completada
  const markLessonAsCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      const newCompletedLessons = [...completedLessons, lessonId]
      setCompletedLessons(newCompletedLessons)
      
      // Si todas las lecciones están completadas, mostrar mensaje
      if (newCompletedLessons.length === NUTRITION_BASICS.length) {
        toast({
          title: "¡Felicidades!",
          description: "Has completado todas las lecciones básicas de nutrición.",
        })
      } else {
        toast({
          title: "Lección completada",
          description: `Has completado la lección sobre ${NUTRITION_BASICS.find(l => l.id === lessonId)?.title.toLowerCase()}.`,
        })
      }
    }
  }
  
  // Calcular progreso
  const calculateProgress = () => {
    return (completedLessons.length / NUTRITION_BASICS.length) * 100
  }
  
  // Renderizar el componente
  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <Card3DTitle>Fundamentos de Nutrición</Card3DTitle>
      </Card3DHeader>
      <Card3DContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="learn">Aprender</TabsTrigger>
            <TabsTrigger value="recipes">Recetas Sencillas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="learn" className="space-y-4">
            {selectedLesson ? (
              <LessonContent 
                lesson={NUTRITION_BASICS.find(l => l.id === selectedLesson)!}
                onBack={() => setSelectedLesson(null)}
                onComplete={() => markLessonAsCompleted(selectedLesson)}
                isCompleted={completedLessons.includes(selectedLesson)}
              />
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Tu progreso</h3>
                    <span className="text-sm text-muted-foreground">
                      {completedLessons.length}/{NUTRITION_BASICS.length} lecciones
                    </span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  {NUTRITION_BASICS.map(lesson => (
                    <div 
                      key={lesson.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLesson(lesson.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            {lesson.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          </div>
                        </div>
                        {completedLessons.includes(lesson.id) ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="recipes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BEGINNER_RECIPES.map(recipe => (
                <div 
                  key={recipe.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setShowRecipeDetails(recipe.id)}
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Utensils className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{recipe.title}</h3>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <span className="mr-3">{recipe.time}</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span>{recipe.macros.calories} kcal</span>
                      <span>P: {recipe.macros.protein}g</span>
                      <span>C: {recipe.macros.carbs}g</span>
                      <span>G: {recipe.macros.fat}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Dialog open={!!showRecipeDetails} onOpenChange={(open) => !open && setShowRecipeDetails(null)}>
              <DialogContent className="max-w-md">
                {showRecipeDetails && (
                  <RecipeDetails 
                    recipe={BEGINNER_RECIPES.find(r => r.id === showRecipeDetails)!}
                    onClose={() => setShowRecipeDetails(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}

// Componente para mostrar el contenido de una lección
function LessonContent({ 
  lesson, 
  onBack, 
  onComplete,
  isCompleted
}: { 
  lesson: typeof NUTRITION_BASICS[0], 
  onBack: () => void,
  onComplete: () => void,
  isCompleted: boolean
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
        Volver
      </Button>
      
      <div className="flex items-center">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          {lesson.icon}
        </div>
        <h2 className="text-xl font-medium">{lesson.title}</h2>
      </div>
      
      <Separator />
      
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      
      {lesson.videoUrl && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Video explicativo</h3>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Ver video
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onComplete}
          disabled={isCompleted}
        >
          {isCompleted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Completado
            </>
          ) : (
            "Marcar como completado"
          )}
        </Button>
      </div>
    </div>
  )
}

// Componente para mostrar los detalles de una receta
function RecipeDetails({ 
  recipe, 
  onClose 
}: { 
  recipe: typeof BEGINNER_RECIPES[0], 
  onClose: () => void 
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{recipe.title}</DialogTitle>
        <DialogDescription>
          {recipe.time} · {recipe.difficulty}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {recipe.image ? (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Utensils className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Calorías</p>
            <p className="font-medium">{recipe.macros.calories}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Proteína</p>
            <p className="font-medium">{recipe.macros.protein}g</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Carbos</p>
            <p className="font-medium">{recipe.macros.carbs}g</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Grasas</p>
            <p className="font-medium">{recipe.macros.fat}g</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Ingredientes</h3>
          <ul className="space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Preparación</h3>
          <ol className="space-y-1">
            {recipe.steps.map((step, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-primary/10 text-xs flex items-center justify-center mr-2">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </>
  )
}
