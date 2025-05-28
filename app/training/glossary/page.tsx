"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  Search, 
  BookOpen, 
  Dumbbell, 
  Heart, 
  Utensils, 
  Clock, 
  BarChart, 
  X 
} from "lucide-react"
import { AnimatedFade, AnimatedSlide } from "@/components/animations/animated-transitions"
import { cn } from "@/lib/utils"

// Fitness terminology data
const GLOSSARY_TERMS = [
  // Training terms
  {
    id: "1rm",
    term: "1RM (Una Repetición Máxima)",
    definition: "El peso máximo que puedes levantar para una repetición completa de un ejercicio con técnica correcta.",
    category: "training"
  },
  {
    id: "amrap",
    term: "AMRAP (As Many Reps As Possible)",
    definition: "Realizar tantas repeticiones como sea posible de un ejercicio en un tiempo determinado o hasta el fallo muscular.",
    category: "training"
  },
  {
    id: "compound",
    term: "Ejercicio Compuesto",
    definition: "Ejercicio que involucra múltiples articulaciones y grupos musculares, como sentadillas, peso muerto o press de banca.",
    category: "training"
  },
  {
    id: "isolation",
    term: "Ejercicio de Aislamiento",
    definition: "Ejercicio que se centra en un solo grupo muscular y generalmente involucra una sola articulación, como curl de bíceps o extensiones de tríceps.",
    category: "training"
  },
  {
    id: "progressive-overload",
    term: "Sobrecarga Progresiva",
    definition: "Principio de aumentar gradualmente el estrés colocado sobre el cuerpo durante el entrenamiento para continuar produciendo adaptaciones.",
    category: "training"
  },
  {
    id: "rpe",
    term: "RPE (Rating of Perceived Exertion)",
    definition: "Escala subjetiva de 1-10 que mide la intensidad del esfuerzo percibido durante un ejercicio, donde 10 es el máximo esfuerzo posible.",
    category: "training"
  },
  {
    id: "rir",
    term: "RIR (Repeticiones en Reserva)",
    definition: "Número de repeticiones que podrías hacer antes de llegar al fallo muscular. RIR 2 significa que podrías hacer 2 repeticiones más.",
    category: "training"
  },
  {
    id: "tempo",
    term: "Tempo",
    definition: "Control del ritmo de un ejercicio, generalmente expresado en cuatro números que representan segundos (excéntrico, pausa inferior, concéntrico, pausa superior).",
    category: "training"
  },
  {
    id: "superset",
    term: "Superserie",
    definition: "Técnica de entrenamiento donde se realizan dos ejercicios consecutivos sin descanso entre ellos.",
    category: "training"
  },
  {
    id: "drop-set",
    term: "Serie Descendente",
    definition: "Técnica donde se realiza un ejercicio hasta el fallo, se reduce inmediatamente el peso y se continúa sin descanso.",
    category: "training"
  },
  {
    id: "failure",
    term: "Fallo Muscular",
    definition: "Punto en el que no puedes completar otra repetición con técnica correcta debido a la fatiga muscular.",
    category: "training"
  },
  {
    id: "periodization",
    term: "Periodización",
    definition: "Organización sistemática del entrenamiento en períodos o ciclos para optimizar las adaptaciones y prevenir el sobreentrenamiento.",
    category: "training"
  },
  {
    id: "deload",
    term: "Descarga",
    definition: "Período planificado de reducción en volumen o intensidad para permitir la recuperación y prevenir el sobreentrenamiento.",
    category: "training"
  },
  
  // Nutrition terms
  {
    id: "macros",
    term: "Macronutrientes",
    definition: "Los tres principales nutrientes que proporcionan energía: proteínas, carbohidratos y grasas.",
    category: "nutrition"
  },
  {
    id: "protein",
    term: "Proteína",
    definition: "Macronutriente esencial para la construcción y reparación muscular, compuesto por aminoácidos.",
    category: "nutrition"
  },
  {
    id: "carbs",
    term: "Carbohidratos",
    definition: "Macronutriente que proporciona la principal fuente de energía para el cuerpo, especialmente durante el ejercicio de alta intensidad.",
    category: "nutrition"
  },
  {
    id: "fats",
    term: "Grasas",
    definition: "Macronutriente esencial para la absorción de vitaminas, producción hormonal y como fuente de energía.",
    category: "nutrition"
  },
  {
    id: "caloric-deficit",
    term: "Déficit Calórico",
    definition: "Consumir menos calorías de las que gastas, lo que resulta en pérdida de peso.",
    category: "nutrition"
  },
  {
    id: "caloric-surplus",
    term: "Superávit Calórico",
    definition: "Consumir más calorías de las que gastas, lo que resulta en ganancia de peso.",
    category: "nutrition"
  },
  {
    id: "bmr",
    term: "TMB (Tasa Metabólica Basal)",
    definition: "Cantidad de energía que tu cuerpo necesita para mantener funciones vitales en reposo.",
    category: "nutrition"
  },
  {
    id: "tdee",
    term: "TDEE (Gasto Energético Total Diario)",
    definition: "Total de calorías que quemas en un día, incluyendo actividad física y metabolismo basal.",
    category: "nutrition"
  },
  
  // Physiology terms
  {
    id: "hypertrophy",
    term: "Hipertrofia",
    definition: "Aumento del tamaño de las células musculares como resultado del entrenamiento de fuerza.",
    category: "physiology"
  },
  {
    id: "doms",
    term: "DOMS (Dolor Muscular de Aparición Tardía)",
    definition: "Dolor muscular que aparece 24-72 horas después del ejercicio, especialmente después de ejercicios nuevos o intensos.",
    category: "physiology"
  },
  {
    id: "concentric",
    term: "Fase Concéntrica",
    definition: "Fase de un ejercicio donde el músculo se acorta bajo tensión (por ejemplo, subir en una flexión).",
    category: "physiology"
  },
  {
    id: "eccentric",
    term: "Fase Excéntrica",
    definition: "Fase de un ejercicio donde el músculo se alarga bajo tensión (por ejemplo, bajar en una flexión).",
    category: "physiology"
  },
  {
    id: "isometric",
    term: "Contracción Isométrica",
    definition: "Contracción muscular donde la longitud del músculo no cambia, como mantener una posición estática.",
    category: "physiology"
  },
  {
    id: "vo2max",
    term: "VO2 Max",
    definition: "Medida de la capacidad máxima del cuerpo para transportar y utilizar oxígeno durante el ejercicio incremental.",
    category: "physiology"
  },
  {
    id: "hr-zones",
    term: "Zonas de Frecuencia Cardíaca",
    definition: "Rangos de frecuencia cardíaca utilizados para guiar la intensidad del entrenamiento cardiovascular.",
    category: "physiology"
  }
];

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const router = useRouter()
  
  // Filter terms based on search and category
  const filteredTerms = GLOSSARY_TERMS.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || term.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group terms alphabetically
  const groupedTerms = filteredTerms.reduce((acc: Record<string, typeof GLOSSARY_TERMS>, term) => {
    const firstLetter = term.term.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {});
  
  // Sort letters
  const sortedLetters = Object.keys(groupedTerms).sort();
  
  // Handle back button
  const handleBack = () => {
    router.push("/training/beginner")
  }
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Glosario de Fitness</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Terminología de Fitness</CardTitle>
          <CardDescription>
            Encuentra definiciones de términos comunes utilizados en fitness y entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar términos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="training">Entrenamiento</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
                <TabsTrigger value="physiology">Fisiología</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <AnimatedFade>
        <div className="space-y-8">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron términos</h3>
              <p className="text-muted-foreground">
                No hay términos que coincidan con tu búsqueda. Intenta con otra palabra clave o categoría.
              </p>
            </div>
          ) : (
            sortedLetters.map(letter => (
              <div key={letter} className="space-y-4">
                <div className="sticky top-16 z-10 bg-background pt-2 pb-1">
                  <h2 className="text-2xl font-bold text-primary">{letter}</h2>
                  <Separator className="mt-2" />
                </div>
                
                <div className="space-y-4">
                  {groupedTerms[letter].map(term => (
                    <Card key={term.id} className="overflow-hidden">
                      <div className="flex">
                        <div className={cn(
                          "w-2 flex-shrink-0",
                          term.category === "training" && "bg-blue-500",
                          term.category === "nutrition" && "bg-green-500",
                          term.category === "physiology" && "bg-purple-500"
                        )} />
                        <div className="p-4 w-full">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{term.term}</h3>
                            <Badge variant="outline" className={cn(
                              term.category === "training" && "border-blue-200 bg-blue-50 text-blue-700",
                              term.category === "nutrition" && "border-green-200 bg-green-50 text-green-700",
                              term.category === "physiology" && "border-purple-200 bg-purple-50 text-purple-700"
                            )}>
                              <div className="flex items-center">
                                {term.category === "training" && <Dumbbell className="h-3 w-3 mr-1" />}
                                {term.category === "nutrition" && <Utensils className="h-3 w-3 mr-1" />}
                                {term.category === "physiology" && <Heart className="h-3 w-3 mr-1" />}
                                {term.category === "training" && "Entrenamiento"}
                                {term.category === "nutrition" && "Nutrición"}
                                {term.category === "physiology" && "Fisiología"}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{term.definition}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </AnimatedFade>
    </div>
  )
}
