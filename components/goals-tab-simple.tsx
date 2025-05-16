"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface GoalsTabProps {
  userId: string
}

export default function GoalsTab({ userId }: GoalsTabProps) {
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Objetivos</h2>
        {tableExists && (
          <Button>
            Nuevo Objetivo
          </Button>
        )}
      </div>

      {tableExists === null ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm">Verificando la tabla de objetivos...</p>
          </div>
        </div>
      ) : tableExists === false ? (
        <div className="bg-yellow-50 p-4 rounded">
          <p>La tabla de objetivos no existe</p>
        </div>
      ) : (
        <div>
          <p>Contenido de objetivos</p>
        </div>
      )}
    </div>
  )
}
