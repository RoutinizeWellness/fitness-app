"use client"

import { useState, useEffect } from 'react'
import { HealthDataService, HealthStats } from '@/lib/health-data-service'
import { useAuth } from '@/lib/auth/auth-context'

export function useHealthData() {
  const { user } = useAuth()
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    const healthService = HealthDataService.getInstance()

    const initializeHealthService = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Inicializar el servicio con el ID de usuario
        await healthService.initialize(user.id)

        // Obtener estadísticas iniciales
        if (mounted) {
          setHealthStats(healthService.getHealthStats())
          setIsLoading(false)
        }

        // Configurar listeners para actualizaciones en tiempo real
        const handleStepsUpdate = () => {
          if (mounted) {
            setHealthStats(healthService.getHealthStats())
          }
        }

        const handleHeartRateUpdate = () => {
          if (mounted) {
            setHealthStats(healthService.getHealthStats())
          }
        }

        // Agregar listeners
        healthService.addStepListener(handleStepsUpdate)
        healthService.addHeartRateListener(handleHeartRateUpdate)

        // Limpiar listeners al desmontar
        return () => {
          mounted = false
          healthService.removeStepListener(handleStepsUpdate)
          healthService.removeHeartRateListener(handleHeartRateUpdate)
        }
      } catch (err) {
        console.error('Error al inicializar el servicio de salud:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Error desconocido'))
          setIsLoading(false)
        }
      }
    }

    initializeHealthService()

    // Limpiar al desmontar
    return () => {
      mounted = false
    }
  }, [user])

  // Función para registrar duración del sueño
  const logSleepDuration = async (hours: number) => {
    if (!user) return

    try {
      const healthService = HealthDataService.getInstance()
      await healthService.logSleepDuration(hours)
      setHealthStats(healthService.getHealthStats())
    } catch (err) {
      console.error('Error al registrar duración del sueño:', err)
      setError(err instanceof Error ? err : new Error('Error al registrar sueño'))
    }
  }

  // Función para registrar ingesta de agua
  const logWaterIntake = async (liters: number) => {
    if (!user) return

    try {
      const healthService = HealthDataService.getInstance()
      await healthService.logWaterIntake(liters)
      setHealthStats(healthService.getHealthStats())
    } catch (err) {
      console.error('Error al registrar ingesta de agua:', err)
      setError(err instanceof Error ? err : new Error('Error al registrar agua'))
    }
  }

  // Función para actualizar metas de salud
  const updateHealthGoals = async (goals: any) => {
    if (!user) return

    try {
      const healthService = HealthDataService.getInstance()
      await healthService.saveHealthGoals(goals)
      setHealthStats(healthService.getHealthStats())
    } catch (err) {
      console.error('Error al actualizar metas de salud:', err)
      setError(err instanceof Error ? err : new Error('Error al actualizar metas'))
    }
  }

  return {
    healthStats,
    isLoading,
    error,
    logSleepDuration,
    logWaterIntake,
    updateHealthGoals
  }
}
