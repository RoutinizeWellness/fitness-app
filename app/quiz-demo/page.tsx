"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { QuizFunnel, QuizResponses } from "@/components/quiz/QuizFunnel"
import { Button3D } from "@/components/ui/button-3d"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function QuizDemoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResponses, setQuizResponses] = useState<QuizResponses | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  
  // Handle quiz completion
  const handleQuizComplete = (responses: QuizResponses) => {
    setQuizResponses(responses)
    setQuizCompleted(true)
    
    toast({
      title: "¡Cuestionario completado!",
      description: "Tus respuestas han sido registradas con éxito.",
    })
  }
  
  // Handle quiz cancellation
  const handleCancel = () => {
    router.back()
  }
  
  // Reset quiz
  const resetQuiz = () => {
    setQuizCompleted(false)
    setQuizResponses(null)
    setSelectedIndustry(null)
  }
  
  // Industry selection
  const industries = [
    { id: "fitness", name: "Fitness", description: "Entrenamiento, ejercicio y forma física" },
    { id: "nutrition", name: "Nutrición", description: "Alimentación, dietas y hábitos alimenticios" },
    { id: "productivity", name: "Productividad", description: "Gestión del tiempo, enfoque y organización" },
    { id: "wellness", name: "Bienestar", description: "Salud mental, estrés y equilibrio" }
  ]
  
  return (
    <RoutinizeLayout activeTab="home" title="Quiz Demo">
      <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button3D
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold">Quiz Funnel Demo</h1>
        </div>
        
        {!selectedIndustry && !quizCompleted ? (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Selecciona una industria para comenzar el cuestionario de demostración.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industries.map((industry) => (
                <motion.div
                  key={industry.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedIndustry(industry.id)}
                >
                  <h3 className="text-lg font-bold mb-2">{industry.name}</h3>
                  <p className="text-sm text-muted-foreground">{industry.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : selectedIndustry && !quizCompleted ? (
          <QuizFunnel
            onComplete={handleQuizComplete}
            onCancel={handleCancel}
            industry={selectedIndustry as any}
            title={`Cuestionario de ${industries.find(i => i.id === selectedIndustry)?.name}`}
            subtitle={`Descubre tu plan personalizado de ${industries.find(i => i.id === selectedIndustry)?.name.toLowerCase()}`}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-bold text-green-800">¡Cuestionario completado!</h2>
              </div>
              
              <p className="text-green-700 mb-4">
                Has completado con éxito el cuestionario de demostración. Aquí están tus respuestas:
              </p>
              
              <div className="bg-white rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Objetivos seleccionados:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {quizResponses?.goals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Situación actual:</h3>
                  <p className="text-sm text-gray-600 mt-1">{quizResponses?.currentSituation}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Puntos de dolor:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {quizResponses?.painPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Resultados deseados:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {quizResponses?.desiredOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Plazo de tiempo:</h3>
                  <p className="text-sm text-gray-600 mt-1">{quizResponses?.timeline}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">¿Por qué es importante para ti?</h3>
                  <p className="text-sm text-gray-600 mt-1">{quizResponses?.importanceReason}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Impacto en tu vida:</h3>
                  <p className="text-sm text-gray-600 mt-1">{quizResponses?.lifeChangeImpact}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button3D onClick={resetQuiz}>
                Reiniciar demostración
              </Button3D>
            </div>
          </div>
        )}
      </div>
    </RoutinizeLayout>
  )
}
