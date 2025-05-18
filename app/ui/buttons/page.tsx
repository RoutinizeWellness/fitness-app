"use client"

import { ButtonShowcase } from "@/components/ui/buttons/button-showcase"

export default function ButtonsShowcasePage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Componentes de Botones</h1>
          <p className="text-muted-foreground">
            Una colección completa de componentes de botones para la aplicación.
          </p>
        </div>
        
        <ButtonShowcase />
      </div>
    </div>
  )
}
