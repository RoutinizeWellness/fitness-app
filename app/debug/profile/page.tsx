"use client"

import { ProfileDebugger } from "@/components/debug/profile-debugger"

export default function ProfileDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Depuración de Perfil de Usuario</h1>
      <ProfileDebugger />
    </div>
  )
}
