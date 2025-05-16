"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Tipos
type SupabaseContextType = {
  supabase: SupabaseClient
}

// Crear el contexto
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Proveedor del contexto
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => {
    console.log("Inicializando cliente de Supabase en SupabaseProvider");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://soviwrzrgskhvgcmujfj.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdml3cnpyZ3NraHZnY211amZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTIzMzIsImV4cCI6MjA2MTY4ODMzMn0.dBGIib2YNrXTrGFvMQaUf3w8jbIRX-pixujAj_SPn5s"
    );
  })

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Hook para usar el contexto
export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase debe ser usado dentro de un SupabaseProvider")
  }
  return context
}
