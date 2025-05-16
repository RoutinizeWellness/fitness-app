"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SubscriptionPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirigir a la página de membresía
    router.push("/membership")
  }, [router])
  
  return null
}
