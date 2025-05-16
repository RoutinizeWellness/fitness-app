"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Dumbbell,
  Utensils,
  Moon,
  Heart,
  Brain,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EnhancedWelcomeScreenProps {
  onComplete?: () => void
  skipIntro?: boolean
}

export function EnhancedWelcomeScreen({
  onComplete,
  skipIntro = false
}: EnhancedWelcomeScreenProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(skipIntro ? 1 : 0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Características de la aplicación
  const features = [
    {
      id: "training",
      title: "Entrenamiento Personalizado",
      description: "Programas adaptados a tus objetivos con seguimiento de progreso en tiempo real",
      icon: Dumbbell,
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: "nutrition",
      title: "Nutrición Inteligente",
      description: "Planes nutricionales basados en tus necesidades y preferencias alimentarias",
      icon: Utensils,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "sleep",
      title: "Optimización del Sueño",
      description: "Mejora tu descanso con análisis de patrones de sueño y rutinas relajantes",
      icon: Moon,
      color: "from-teal-500 to-cyan-600"
    },
    {
      id: "wellness",
      title: "Bienestar Integral",
      description: "Técnicas de meditación, respiración y gestión del estrés para tu equilibrio mental",
      icon: Heart,
      color: "from-cyan-500 to-teal-600"
    },
    {
      id: "ai",
      title: "IA Adaptativa",
      description: "Algoritmos que aprenden de tus patrones para ofrecerte recomendaciones personalizadas",
      icon: Brain,
      color: "from-teal-500 to-emerald-600"
    }
  ]

  // Efecto para mostrar las características después de la animación inicial
  useEffect(() => {
    if (currentStep === 1 && !showFeatures) {
      const timer = setTimeout(() => {
        setShowFeatures(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, showFeatures])

  // Efecto para cambiar automáticamente la característica activa
  useEffect(() => {
    if (showFeatures) {
      const interval = setInterval(() => {
        setActiveFeature(prev => (prev + 1) % features.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [showFeatures, features.length])

  // Efecto para hacer scroll a la característica activa
  useEffect(() => {
    if (featuresRef.current && showFeatures) {
      const featureElements = featuresRef.current.querySelectorAll('.feature-card')
      if (featureElements[activeFeature]) {
        featureElements[activeFeature].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [activeFeature, showFeatures])

  // Manejar la finalización de la animación inicial
  const handleAnimationComplete = () => {
    setAnimationComplete(true)
    if (skipIntro) {
      setCurrentStep(1)
    }
  }

  // Manejar el avance al siguiente paso
  const handleNextStep = () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else if (currentStep === 1) {
      if (onComplete) {
        onComplete()
      }
    }
  }

  // Renderizar la pantalla de splash inicial
  const renderSplashScreen = () => (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600"
      initial={{ opacity: 1 }}
      animate={{
        opacity: currentStep === 0 ? 1 : 0,
        y: currentStep === 0 ? 0 : -50
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.3
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        <div className="w-64 h-64 mb-8 relative">
          {/* Efecto de luz ambiental */}
          <motion.div
            className="absolute -inset-10 bg-gradient-to-br from-emerald-300/20 via-teal-300/10 to-cyan-300/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
              rotate: [0, 15, 0]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          <motion.div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Círculos decorativos */}
              <motion.div
                className="absolute w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-white/20"
                    style={{
                      width: `${(i+1) * 25}%`,
                      height: `${(i+1) * 25}%`,
                      left: `${50 - ((i+1) * 25) / 2}%`,
                      top: `${50 - ((i+1) * 25) / 2}%`,
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      rotate: { duration: 20 + i * 5, ease: "linear", repeat: Infinity },
                      scale: { duration: 3 + i, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: i * 0.5 }
                    }}
                  />
                ))}
              </motion.div>

              {/* Logo principal */}
              <motion.div
                className="relative z-10 w-48 h-48"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Image
                  src="/images/routinize-logo-enhanced.svg"
                  alt="Routinize Logo"
                  width={200}
                  height={200}
                  className="drop-shadow-2xl"
                  priority
                />

                {/* Partículas flotantes */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.4, 0.8, 0.4],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Image
            src="/images/routinize-logo-text.svg"
            alt="Routinize"
            width={280}
            height={80}
            className="drop-shadow-xl"
            priority
          />

          {/* Efecto de brillo que se mueve sobre el texto */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: [-280, 280],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3
            }}
            style={{ width: "280px", height: "80px" }}
          />
        </motion.div>

        <motion.div
          className="space-y-4 text-center max-w-sm px-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="welcome-gradient-border p-4 rounded-xl">
            <p className="text-white/90 text-xl font-medium relative z-10">
              <span className="welcome-gradient-text font-semibold">Transforma tu rutina, transforma tu vida</span>
            </p>
          </div>

          <p className="text-white/80 text-base px-2">
            Tu compañero holístico para el bienestar integral y fitness personalizado
          </p>
        </motion.div>

        {animationComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Efecto de luz pulsante detrás del botón */}
            <motion.div
              className="absolute -inset-3 bg-white/20 rounded-full blur-md"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />

            <Button
              onClick={handleNextStep}
              className="bg-white text-teal-600 hover:bg-white/95 px-8 py-6 text-lg font-medium welcome-button-glow rounded-full shadow-xl"
            >
              Comenzar
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )

  // Renderizar la pantalla de características
  const renderFeaturesScreen = () => (
    <motion.div
      className="absolute inset-0 flex flex-col z-10"
      initial={{ opacity: 0 }}
      animate={{
        opacity: currentStep === 1 ? 1 : 0,
        y: currentStep === 1 ? 0 : 50
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="flex-1 flex flex-col">
        {/* Encabezado */}
        <motion.div
          className="pt-12 pb-6 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Bienvenido a Routinize</h2>
          <p className="text-white/80">Descubre todo lo que puedes lograr</p>
        </motion.div>

        {/* Características */}
        <motion.div
          className="flex-1 px-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: showFeatures ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div
            ref={featuresRef}
            className="snap-x snap-mandatory flex overflow-x-auto space-x-4 pb-6 scrollbar-hide"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`feature-card snap-center flex-shrink-0 w-[85%] rounded-2xl overflow-hidden welcome-hover-lift ${
                  activeFeature === index ? 'ring-2 ring-white/50 shadow-lg' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                onClick={() => setActiveFeature(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`bg-gradient-to-br ${feature.color} p-6 h-full welcome-glass`}>
                  <div className="relative">
                    {/* Círculo de fondo con animación */}
                    <motion.div
                      className="absolute -inset-1 rounded-full bg-white/10 blur-sm"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: index * 0.2
                      }}
                    />

                    {/* Icono con efecto de brillo */}
                    <div className="relative bg-white/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                      <feature.icon className="h-7 w-7 text-white drop-shadow-md" />

                      {/* Efecto de brillo */}
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{
                          opacity: [0, 0.5, 0]
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: index * 0.3
                        }}
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">{feature.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Indicadores mejorados */}
          <div className="flex justify-center space-x-3 mt-4">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                className={`h-3 rounded-full transition-all duration-300 ${
                  activeFeature === index ? 'bg-white w-6' : 'bg-white/30 w-3'
                }`}
                onClick={() => setActiveFeature(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Botón de continuar */}
      <motion.div
        className="p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="relative">
          {/* Efecto de luz detrás del botón */}
          <motion.div
            className="absolute -inset-2 bg-white/20 rounded-xl blur-md"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.98, 1.01, 0.98]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />

          <Button
            onClick={handleNextStep}
            className="relative w-full bg-white text-teal-600 hover:bg-white/95 welcome-button-glow font-medium text-lg py-6 rounded-full shadow-xl"
          >
            Continuar a la aplicación
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )

  // Navegar al quiz demo
  const navigateToQuizDemo = () => {
    router.push("/quiz-demo")
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fondo con gradiente y elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600">
        <div className="absolute inset-0">
          {/* Elementos decorativos animados */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -30, 0],
              y: [0, 20, 0]
            }}
            transition={{
              duration: 15,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-300 opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 40, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 20,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-purple-300 opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 20, 0],
              y: [0, 30, 0]
            }}
            transition={{
              duration: 18,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
        </div>
      </div>

      {/* Contenido principal */}
      {renderSplashScreen()}
      {renderFeaturesScreen()}

      {/* Botón flotante para acceder al Quiz Demo */}
      <motion.div
        className="fixed bottom-8 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <Button3D
          onClick={navigateToQuizDemo}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Quiz Demo
        </Button3D>
      </motion.div>
    </div>
  )
}
