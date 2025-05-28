"use client"

import { FitnessBeginnerOnboarding } from "@/components/onboarding/fitness-beginner-onboarding"

export default function BeginnerOnboardingPage() {
  console.log('🎯 BeginnerOnboardingPage - Renderizando página de onboarding');

  // Mostrar directamente el componente de onboarding
  // La verificación del estado se hará dentro del componente
  return <FitnessBeginnerOnboarding redirectPath="/dashboard" />
}
