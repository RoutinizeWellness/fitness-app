'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Importar motion.div de manera dinámica para evitar errores de webpack
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false, loading: () => <div /> }
)

// Componente de fallback para motion.div
export const MotionComponent = ({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: ReactNode, 
  className?: string, 
  [key: string]: any 
}) => {
  // Si estamos en un entorno de servidor o si hay algún problema con framer-motion,
  // renderizar un div normal
  if (typeof window === 'undefined') {
    return <div className={className}>{children}</div>
  }

  // En el cliente, intentar usar MotionDiv
  try {
    return <MotionDiv className={className} {...props}>{children}</MotionDiv>
  } catch (error) {
    console.error('Error al renderizar MotionComponent:', error)
    // Fallback a un div normal si hay algún error
    return <div className={className}>{children}</div>
  }
}

// Exportar otros componentes de motion que puedan ser necesarios
export const MotionFadeIn = ({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: ReactNode, 
  className?: string, 
  delay?: number 
}) => {
  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </MotionComponent>
  )
}

export const MotionSlideUp = ({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: ReactNode, 
  className?: string, 
  delay?: number 
}) => {
  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </MotionComponent>
  )
}

export const MotionSlideIn = ({ 
  children, 
  className = '', 
  delay = 0, 
  direction = 'left' 
}: { 
  children: ReactNode, 
  className?: string, 
  delay?: number,
  direction?: 'left' | 'right' 
}) => {
  const x = direction === 'left' ? -20 : 20

  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </MotionComponent>
  )
}
