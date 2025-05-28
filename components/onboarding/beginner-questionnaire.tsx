"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  QuestionnaireData, 
  BeginnerMotivation, 
  AvailableTime, 
  PhysicalLimitation, 
  ExerciseLocation, 
  BasicEquipment, 
  InitialFeeling 
} from "@/lib/types/beginner-onboarding"
import { ChevronRight, ChevronLeft, HelpCircle, Check } from "lucide-react"

interface BeginnerQuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void
  onBack: () => void
}

export function BeginnerQuestionnaire({ onComplete, onBack }: BeginnerQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>({})
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  
  // Definir las preguntas del cuestionario
  const questions = [
    {
      id: "motivation",
      question: "¿Cuál es tu principal motivación para comenzar?",
      explanation: "Esto nos ayuda a personalizar tu experiencia y recordarte tu 'porqué' cuando necesites motivación extra. Podrás cambiar esto en cualquier momento.",
      type: "single" as const,
      options: [
        { value: "energy", label: "Para sentirme con más energía en mi día a día" },
        { value: "health", label: "Para mejorar mi salud general" },
        { value: "appearance", label: "Para verme mejor físicamente" },
        { value: "new_experience", label: "Para probar algo nuevo y diferente" },
        { value: "stress_reduction", label: "Para reducir el estrés" }
      ]
    },
    {
      id: "availableTime",
      question: "¿Cuánto tiempo puedes dedicar al ejercicio cada día?",
      explanation: "No necesitas horas para ver resultados. Adaptaremos todo a tu disponibilidad real para que puedas ser consistente. Incluso 10 minutos diarios pueden marcar una gran diferencia.",
      type: "single" as const,
      options: [
        { value: "10-15", label: "10-15 minutos" },
        { value: "20-30", label: "20-30 minutos" },
        { value: "30-45", label: "30-45 minutos" },
        { value: "variable", label: "Varía según el día" }
      ]
    },
    {
      id: "physicalLimitations",
      question: "¿Tienes alguna limitación física o de salud?",
      explanation: "Tu seguridad es nuestra prioridad. Esta información nos ayuda a recomendarte ejercicios adecuados para ti. Siempre consulta con un profesional de la salud antes de comenzar cualquier programa de ejercicios.",
      type: "multiple" as const,
      options: [
        { value: "none", label: "No, ninguna que conozca" },
        { value: "knees", label: "Molestias ocasionales en rodillas" },
        { value: "lower_back", label: "Molestias ocasionales en espalda baja" },
        { value: "upper_back", label: "Molestias ocasionales en espalda alta" },
        { value: "shoulders", label: "Molestias ocasionales en hombros" },
        { value: "wrists", label: "Molestias ocasionales en muñecas" },
        { value: "ankles", label: "Molestias ocasionales en tobillos" },
        { value: "medical_condition", label: "Condición médica diagnosticada" },
        { value: "unsure", label: "No estoy seguro/prefiero no decirlo" }
      ]
    },
    {
      id: "exerciseLocation",
      question: "¿Dónde planeas hacer ejercicio principalmente?",
      explanation: "Adaptaremos tus rutinas al espacio y recursos que tengas disponibles. No necesitas equipamiento costoso para comenzar.",
      type: "multiple" as const,
      options: [
        { value: "home_no_equipment", label: "En casa sin equipamiento" },
        { 
          value: "home_basic_equipment", 
          label: "En casa con equipamiento básico",
          subOptions: [
            { value: "dumbbells", label: "Mancuernas" },
            { value: "resistance_bands", label: "Bandas elásticas" },
            { value: "mat", label: "Esterilla" },
            { value: "bench", label: "Banco" },
            { value: "pull_up_bar", label: "Barra de dominadas" },
            { value: "kettlebell", label: "Pesa rusa" },
            { value: "jump_rope", label: "Cuerda para saltar" }
          ]
        },
        { value: "gym", label: "En un gimnasio" },
        { value: "outdoors", label: "Al aire libre" },
        { value: "mixed", label: "Combinación de lugares" }
      ]
    },
    {
      id: "initialFeeling",
      question: "¿Cómo te sientes respecto a comenzar?",
      explanation: "Ser honesto nos ayuda a darte el apoyo que realmente necesitas en cada momento. Todos comenzamos en algún punto, y cada sentimiento es válido.",
      type: "single" as const,
      options: [
        { value: "excited_nervous", label: "Emocionado pero un poco nervioso" },
        { value: "motivated_ready", label: "Motivado y listo para empezar" },
        { value: "skeptical_willing", label: "Escéptico pero dispuesto a intentarlo" },
        { value: "overwhelmed", label: "Abrumado, necesito que sea muy simple" }
      ]
    }
  ]
  
  // Obtener la pregunta actual
  const currentQuestionData = questions[currentQuestion]
  
  // Manejar la selección de opciones
  const handleOptionSelect = (questionId: string, value: string, multiple: boolean) => {
    if (multiple) {
      // Para preguntas de selección múltiple
      const currentValues = formData[questionId as keyof QuestionnaireData] as string[] || []
      
      // Si ya está seleccionado, quitarlo; si no, añadirlo
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      setFormData({
        ...formData,
        [questionId]: newValues
      })
    } else {
      // Para preguntas de selección única
      setFormData({
        ...formData,
        [questionId]: value
      })
    }
  }
  
  // Manejar la selección de subopción
  const handleSubOptionSelect = (questionId: string, optionValue: string, subOptionValue: string) => {
    // Asegurarse de que el equipamiento básico esté inicializado
    const basicEquipment = formData.basicEquipment || []
    
    // Si ya está seleccionado, quitarlo; si no, añadirlo
    const newEquipment = basicEquipment.includes(subOptionValue)
      ? basicEquipment.filter(v => v !== subOptionValue)
      : [...basicEquipment, subOptionValue]
    
    setFormData({
      ...formData,
      basicEquipment: newEquipment
    })
    
    // Asegurarse de que la opción principal esté seleccionada
    if (newEquipment.length > 0 && questionId === "exerciseLocation") {
      const currentLocations = formData.exerciseLocation || []
      if (!currentLocations.includes(optionValue)) {
        setFormData({
          ...formData,
          exerciseLocation: [...currentLocations, optionValue],
          basicEquipment: newEquipment
        })
      }
    }
  }
  
  // Verificar si la opción está seleccionada
  const isOptionSelected = (questionId: string, value: string): boolean => {
    const selectedValues = formData[questionId as keyof QuestionnaireData]
    
    if (Array.isArray(selectedValues)) {
      return selectedValues.includes(value)
    } else {
      return selectedValues === value
    }
  }
  
  // Verificar si la subopción está seleccionada
  const isSubOptionSelected = (subOptionValue: string): boolean => {
    const basicEquipment = formData.basicEquipment || []
    return basicEquipment.includes(subOptionValue)
  }
  
  // Verificar si se puede avanzar a la siguiente pregunta
  const canProceed = (): boolean => {
    const questionId = currentQuestionData.id
    const selectedValues = formData[questionId as keyof QuestionnaireData]
    
    if (currentQuestionData.type === "multiple") {
      return Array.isArray(selectedValues) && selectedValues.length > 0
    } else {
      return !!selectedValues
    }
  }
  
  // Avanzar a la siguiente pregunta o finalizar
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    } else {
      // Completar el cuestionario
      onComplete(formData as QuestionnaireData)
    }
  }
  
  // Retroceder a la pregunta anterior
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowExplanation(false)
    } else {
      onBack()
    }
  }
  
  // Alternar la visualización de la explicación
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation)
  }
  
  return (
    <div className="flex flex-col h-full py-8 px-6">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-[#573353]">
          Configuración inicial
        </h2>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-[#573353] opacity-70">
            Pregunta {currentQuestion + 1} de {questions.length}
          </p>
          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestion ? "bg-[#FDA758]" : "bg-[#EBDCCF]"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Contenido de la pregunta */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Pregunta */}
            <div className="flex items-start gap-2">
              <h3 className="text-lg font-medium text-[#573353] flex-1">
                {currentQuestionData.question}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 rounded-full"
                onClick={toggleExplanation}
              >
                <HelpCircle className="h-5 w-5 text-[#573353] opacity-70" />
              </Button>
            </div>
            
            {/* Explicación */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800"
              >
                {currentQuestionData.explanation}
              </motion.div>
            )}
            
            {/* Opciones */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option) => (
                <div key={option.value}>
                  <div
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all
                      ${isOptionSelected(currentQuestionData.id, option.value)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                      }
                    `}
                    onClick={() => handleOptionSelect(
                      currentQuestionData.id, 
                      option.value, 
                      currentQuestionData.type === "multiple"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Indicador de selección */}
                      <div className={`
                        w-5 h-5 rounded-${currentQuestionData.type === "multiple" ? "sm" : "full"} 
                        flex items-center justify-center
                        ${isOptionSelected(currentQuestionData.id, option.value)
                          ? "bg-blue-600 text-white"
                          : "border-2 border-gray-300"
                        }
                      `}>
                        {isOptionSelected(currentQuestionData.id, option.value) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      
                      {/* Texto de la opción */}
                      <span className="text-[#573353]">{option.label}</span>
                    </div>
                  </div>
                  
                  {/* Subopciones (para equipamiento) */}
                  {option.subOptions && isOptionSelected(currentQuestionData.id, option.value) && (
                    <div className="ml-8 mt-2 space-y-2">
                      <p className="text-sm text-[#573353] opacity-70 mb-1">
                        Selecciona el equipamiento disponible:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {option.subOptions.map((subOption) => (
                          <div
                            key={subOption.value}
                            className={`
                              p-2 rounded-lg border cursor-pointer transition-all
                              ${isSubOptionSelected(subOption.value)
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-gray-200 hover:border-gray-300"
                              }
                            `}
                            onClick={() => handleSubOptionSelect(
                              currentQuestionData.id,
                              option.value,
                              subOption.value
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`
                                w-4 h-4 rounded-sm flex items-center justify-center
                                ${isSubOptionSelected(subOption.value)
                                  ? "bg-green-600 text-white"
                                  : "border-2 border-gray-300"
                                }
                              `}>
                                {isSubOptionSelected(subOption.value) && (
                                  <Check className="h-2 w-2" />
                                )}
                              </div>
                              <span className="text-sm text-[#573353]">{subOption.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Botones de navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6 flex justify-between"
      >
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`
            flex items-center gap-1
            ${canProceed()
              ? "bg-[#FDA758] hover:bg-[#FD9A40] text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            "Completar"
          )}
        </Button>
      </motion.div>
    </div>
  )
}
