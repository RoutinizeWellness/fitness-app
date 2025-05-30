"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dumbbell, Utensils, Brain, Lock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"

interface FitnessPlan {
  id: string
  title: string
  description: string
  imageUrl: string
  duration: string
  equipmentType: string
  goal: string
  isLocked: boolean
  tags: string[]
}

interface PersonalFitnessPlanProps {
  className?: string
}

export function PersonalFitnessPlan({ className }: PersonalFitnessPlanProps) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [plan, setPlan] = useState<FitnessPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Usuario'

  useEffect(() => {
    async function fetchPersonalPlan() {
      setIsLoading(true)

      try {
        if (user?.id) {
          try {
            // Verificar si la tabla existe antes de consultar
            const { data, error } = await supabase
              .from('fitness_plans')
              .select('*')
              .eq('user_id', user.id)
              .single()

            if (error) {
              // Si el error es porque la tabla no existe, lo manejamos silenciosamente
              if (error.code === '42P01') { // Código PostgreSQL para "tabla no existe"
                console.info('La tabla fitness_plans no existe todavía');
                loadSamplePlan();
                return;
              }

              console.warn("Error fetching fitness plan:", error);
              loadSamplePlan();
            } else if (data) {
              setPlan(data);
            } else {
              loadSamplePlan();
            }
          } catch (supabaseError) {
            console.warn('Error al consultar tabla fitness_plans:', supabaseError);
            loadSamplePlan();
          }
        } else {
          loadSamplePlan();
        }
      } catch (error) {
        console.error("Error general:", error);
        loadSamplePlan();
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersonalPlan();
  }, [user?.id])

  // Cargar un plan de ejemplo si no hay datos en Supabase
  const loadSamplePlan = () => {
    setPlan({
      id: 'sample-plan',
      title: 'Centr Power in Gym: Intermediate',
      description: 'tailored training for total-body strength and staying power.',
      imageUrl: '/images/workouts/strength-training.jpg',
      duration: '13 weeks',
      equipmentType: 'Gym equipment',
      goal: 'Get Stronger',
      isLocked: true,
      tags: ['Build muscle', 'Self-guided']
    })
  }

  const handleUnlock = () => {
    router.push('/subscription')
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-48 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold">No plan available</h2>
        <p>You don't have a personalized fitness plan yet.</p>
        <Button onClick={() => router.push('/training/questionnaire')}>
          Create Your Plan
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight uppercase">
          {userName}, HERE'S A PEEK AT<br />YOUR PERSONAL FITNESS PLAN:
        </h1>
      </div>

      <div>
        <h2 className="text-xl font-bold">{plan.goal}: <span className="font-normal">{plan.description}</span></h2>
      </div>

      {/* Tarjeta principal de entrenamiento */}
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-900 to-blue-700 text-white shadow-lg"
      >
        <div className="relative">
          <div className="absolute left-0 top-0 z-10 m-4 rounded-full bg-blue-500/80 px-4 py-1.5">
            <Dumbbell className="mr-1.5 inline-block h-4 w-4" />
            <span className="text-sm font-medium">Move</span>
          </div>

          {plan.isLocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Lock className="h-16 w-16 text-white opacity-90" />
            </div>
          )}

          <div className="relative h-56 w-full">
            <Image
              src={plan.imageUrl}
              alt={plan.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/800x400?text=Fitness+Plan";
              }}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
            <h3 className="text-2xl font-bold text-white">{plan.title}</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-5">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 rounded-full px-3 py-1">
            {plan.duration}
          </Badge>
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 rounded-full px-3 py-1">
            {plan.equipmentType}
          </Badge>
          {plan.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20 rounded-full px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tarjetas secundarias */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-green-800 to-green-600 text-white shadow-md"
        >
          <div className="absolute left-0 top-0 z-10 m-3 rounded-full bg-green-500/80 px-3 py-1">
            <Utensils className="mr-1 inline-block h-4 w-4" />
            <span className="text-sm font-medium">Meals</span>
          </div>

          {plan.isLocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Lock className="h-10 w-10 text-white opacity-90" />
            </div>
          )}

          <div className="relative h-36 w-full">
            <Image
              src="/images/meals/healthy-meal.jpg"
              alt="Nutrition Plan"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/400x200?text=Nutrition";
              }}
            />
          </div>

          <div className="p-4">
            <h3 className="font-bold text-white text-lg">Recipes and more</h3>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-purple-800 to-purple-600 text-white shadow-md"
        >
          <div className="absolute left-0 top-0 z-10 m-3 rounded-full bg-purple-500/80 px-3 py-1">
            <Brain className="mr-1 inline-block h-4 w-4" />
            <span className="text-sm font-medium">Mind</span>
          </div>

          {plan.isLocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Lock className="h-10 w-10 text-white opacity-90" />
            </div>
          )}

          <div className="relative h-36 w-full">
            <Image
              src="/images/meditation/meditation.jpg"
              alt="Meditation Plan"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/400x200?text=Meditation";
              }}
            />
          </div>

          <div className="p-4">
            <h3 className="font-bold text-white text-lg">Meditations and more</h3>
          </div>
        </motion.div>
      </div>

      {/* Botón CTA */}
      {plan.isLocked ? (
        <Button
          className="w-full bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg"
          size="lg"
          variant="pill"
          onClick={handleUnlock}
        >
          UNLOCK YOUR PLAN NOW
        </Button>
      ) : (
        <Button
          className="w-full shadow-lg"
          size="lg"
          variant="pill"
          onClick={() => router.push('/training/my-plan')}
        >
          START YOUR PLAN NOW
        </Button>
      )}
    </div>
  )
}
