import { NextResponse } from 'next/server'
import { getActiveWorkoutPlan, getWorkoutPlan } from '@/lib/workout-plan-service'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    // Usar un ID de usuario de prueba
    const userId = 'test-user-id'
    
    // Obtener el plan activo
    const activePlan = await getActiveWorkoutPlan(userId)
    
    // Obtener todos los planes para depuración
    const { data: allPlans, error: plansError } = await supabase
      .from('workout_routines')
      .select('*')
    
    if (plansError) {
      console.error('Error al obtener todos los planes:', plansError)
    }
    
    // Contar los días en cada plan
    const plansWithDayCounts = allPlans?.map(plan => ({
      id: plan.id,
      name: plan.name,
      dayCount: Array.isArray(plan.days) ? plan.days.length : 0,
      dayIds: Array.isArray(plan.days) ? plan.days.map((d: any) => d.id) : []
    })) || []
    
    return NextResponse.json({ 
      success: true, 
      data: activePlan,
      debug: {
        allPlans: plansWithDayCounts,
        planCount: plansWithDayCounts.length,
        totalDays: plansWithDayCounts.reduce((acc, plan) => acc + plan.dayCount, 0)
      }
    })
  } catch (error) {
    console.error('Error en la ruta de depuración del plan de entrenamiento:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener el plan de entrenamiento' 
    }, { status: 500 })
  }
}
