"use client"

import { ReactNode } from "react"
import { useUserExperience } from "@/contexts/user-experience-context"
import { ExperienceLevel, InterfaceMode } from "@/lib/services/user-experience-service"

interface ExperienceConditionalProps {
  /**
   * Contenido a mostrar para usuarios principiantes
   */
  beginnerContent: ReactNode
  
  /**
   * Contenido a mostrar para usuarios avanzados
   */
  advancedContent: ReactNode
  
  /**
   * Determina si la condición se basa en el nivel de experiencia del usuario o en el modo de interfaz seleccionado
   * @default "interface"
   */
  conditionType?: "experience" | "interface"
  
  /**
   * Niveles de experiencia considerados como "principiantes"
   * @default ["amateur_zero", "beginner"]
   */
  beginnerLevels?: ExperienceLevel[]
  
  /**
   * Niveles de experiencia considerados como "avanzados"
   * @default ["intermediate", "advanced", "expert"]
   */
  advancedLevels?: ExperienceLevel[]
  
  /**
   * Clase CSS adicional
   */
  className?: string
}

/**
 * Componente que renderiza contenido condicional basado en el nivel de experiencia o modo de interfaz del usuario
 */
export function ExperienceConditional({
  beginnerContent,
  advancedContent,
  conditionType = "interface",
  beginnerLevels = ["amateur_zero", "beginner"],
  advancedLevels = ["intermediate", "advanced", "expert"],
  className = ""
}: ExperienceConditionalProps) {
  const { 
    experienceLevel, 
    interfaceMode,
    isAdvancedUser,
    isBeginnerUser
  } = useUserExperience()
  
  // Determinar qué contenido mostrar según el tipo de condición
  const shouldShowAdvancedContent = conditionType === "interface"
    ? interfaceMode === "advanced"
    : advancedLevels.includes(experienceLevel)
  
  return (
    <div className={className}>
      {shouldShowAdvancedContent ? advancedContent : beginnerContent}
    </div>
  )
}

interface ExperienceContentProps {
  /**
   * Contenido a renderizar
   */
  children: ReactNode
  
  /**
   * Modo de interfaz requerido para mostrar el contenido
   */
  interfaceMode?: InterfaceMode
  
  /**
   * Niveles de experiencia requeridos para mostrar el contenido
   */
  experienceLevels?: ExperienceLevel[]
  
  /**
   * Si es true, el contenido se mostrará cuando el usuario NO cumpla con los requisitos
   * @default false
   */
  negate?: boolean
  
  /**
   * Clase CSS adicional
   */
  className?: string
}

/**
 * Componente que renderiza su contenido solo si el usuario cumple con los requisitos de experiencia o interfaz
 */
export function ExperienceContent({
  children,
  interfaceMode,
  experienceLevels,
  negate = false,
  className = ""
}: ExperienceContentProps) {
  const { 
    experienceLevel, 
    interfaceMode: userInterfaceMode
  } = useUserExperience()
  
  // Verificar si el usuario cumple con los requisitos
  let shouldRender = true
  
  if (interfaceMode) {
    shouldRender = userInterfaceMode === interfaceMode
  }
  
  if (experienceLevels && shouldRender) {
    shouldRender = experienceLevels.includes(experienceLevel)
  }
  
  // Si negate es true, invertir la condición
  if (negate) {
    shouldRender = !shouldRender
  }
  
  // Renderizar el contenido solo si se cumplen las condiciones
  return shouldRender ? <div className={className}>{children}</div> : null
}
