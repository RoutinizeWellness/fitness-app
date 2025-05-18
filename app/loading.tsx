"use client"

import { PulseLoader } from "@/components/ui/enhanced-skeletons"

export default function Loading() {
  return (
    <PulseLoader 
      message="Cargando..." 
      fullScreen={true} 
    />
  )
}
