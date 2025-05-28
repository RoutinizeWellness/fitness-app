"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, BarChart, Dumbbell } from "lucide-react"
import ImprovedWorkoutHistory from "@/components/training/improved-workout-history"

export default function ImprovedWorkoutHistoryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // If loading or no user, show skeleton
  if (authLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3 rounded-full"
          onClick={() => router.push("/training")}
        >
          <ArrowLeft className="h-5 w-5 text-[#573353]" />
        </Button>
        <h1 className="text-2xl font-bold text-[#573353]">Historial de Entrenamientos</h1>
      </div>

      <ImprovedWorkoutHistory
        userId={user.uid}
        limit={20}
        showViewAll={false}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 z-10 shadow-sm">
        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/training')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Rutinas</span>
        </button>

        <button
          className="flex flex-col items-center w-16"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-[#FDA758]" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#FDA758]">Historial</span>
        </button>

        <div className="flex flex-col items-center relative w-16">
          <div className="w-16 h-16 rounded-full bg-[#FDA758]/20 flex items-center justify-center absolute -top-8">
            <button
              className="w-12 h-12 rounded-full bg-[#FDA758] flex items-center justify-center shadow-md"
              onClick={() => router.push('/training/start-workout')}
            >
              <Dumbbell className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="w-6 h-6 mt-8"></div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Entrenar</span>
        </div>

        <button
          className="flex flex-col items-center w-16"
          onClick={() => router.push('/training/calendar')}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs mt-1 font-medium text-[#573353]/70">Calendario</span>
        </button>
      </div>
    </div>
  )
}
