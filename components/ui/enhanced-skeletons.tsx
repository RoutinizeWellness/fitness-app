"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d"
import Image from "next/image"

// Esqueleto para tarjeta de módulo
export function ModuleCardSkeleton({ className }: { className?: string }) {
  return (
    <Card3D className={cn("overflow-hidden", className)}>
      <div className="relative">
        <Skeleton className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 opacity-90" />
        <div className="relative p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <Skeleton className="h-2 w-full rounded-full mb-4" />

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Skeleton className="h-4 w-16 mx-auto rounded-md mb-1" />
              <Skeleton className="h-4 w-8 mx-auto rounded-md" />
              <Skeleton className="h-1 w-full rounded-full mt-1" />
            </div>

            <div className="text-center">
              <Skeleton className="h-4 w-16 mx-auto rounded-md mb-1" />
              <Skeleton className="h-4 w-8 mx-auto rounded-md" />
              <Skeleton className="h-1 w-full rounded-full mt-1" />
            </div>

            <div className="text-center">
              <Skeleton className="h-4 w-16 mx-auto rounded-md mb-1" />
              <Skeleton className="h-4 w-8 mx-auto rounded-md" />
              <Skeleton className="h-1 w-full rounded-full mt-1" />
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  )
}

// Esqueleto para tarjeta de comida
export function MealCardSkeleton({ className }: { className?: string }) {
  return (
    <Card3D className={cn("p-5", className)}>
      <div className="flex items-start">
        <Skeleton className="rounded-full h-12 w-12 mr-4" />

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="mt-3 space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </Card3D>
  )
}

// Esqueleto para tarjeta de receta
export function RecipeCardSkeleton({ className }: { className?: string }) {
  return (
    <Card3D className={cn("overflow-hidden", className)}>
      <div className="relative h-36">
        <Skeleton className="absolute inset-0" />
        <div className="relative p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-5 w-20 rounded-full mb-2" />
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>

            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
    </Card3D>
  )
}

// Esqueleto para perfil de usuario
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <Card3D className={cn(className)}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </Card3DHeader>
      <Card3DContent>
        <div className="flex flex-col items-center justify-center py-6">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-40 rounded-md mb-2" />
          <Skeleton className="h-4 w-32 rounded-md mb-6" />

          <div className="grid grid-cols-2 gap-4 w-full">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}

// Esqueleto para lista de elementos
export function ListSkeleton({
  count = 5,
  className,
  itemClassName
}: {
  count?: number
  className?: string
  itemClassName?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn("flex items-center p-4 bg-gray-50 rounded-lg", itemClassName)}
        >
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 rounded-md mb-2" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  )
}

// Esqueleto para gráficos
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card3D className={cn(className)}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>

          <Skeleton className="h-40 w-full rounded-lg" />

          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}

// Esqueleto para navegación inferior
export function BottomNavigationSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 h-16">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center justify-center">
            <Skeleton className="h-6 w-6 rounded-full mb-1" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Esqueleto para pantalla completa de carga
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32 rounded-md" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Contenido principal */}
      <ModuleCardSkeleton />

      <div className="flex justify-between items-center mt-8 mb-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      <div className="space-y-4">
        <MealCardSkeleton />
        <MealCardSkeleton />
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RecipeCardSkeleton />
        <RecipeCardSkeleton />
      </div>

      {/* Navegación inferior */}
      <BottomNavigationSkeleton />
    </div>
  )
}

// Enhanced loading screen with modern design and animations
export function PulseLoader({ message = "Loading...", fullScreen = true }: { message?: string, fullScreen?: boolean }) {
  const content = (
    <>
      {/* Logo container with enhanced animations */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring animation */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-spin-slow"></div>

        {/* Middle ring animation (opposite direction) */}
        <div className="absolute inset-2 rounded-full border-4 border-teal-400/40 animate-reverse-spin"></div>

        {/* Inner container with gradient background */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg overflow-hidden">
          {/* Logo with pulse animation */}
          <Image
            src="/images/routinize-logo.svg"
            alt="Routinize Logo"
            width={80}
            height={80}
            className="drop-shadow-lg animate-pulse-organic"
            priority
          />
        </div>

        {/* Decorative particles */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-400 blur-sm animate-float-organic"></div>
        <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-teal-400 blur-sm animate-float-organic" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Loading indicator dots with enhanced animation */}
      <div className="flex space-x-3 justify-center items-center mb-6">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="w-3 h-3 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-pulse-organic"
            style={{
              animationDelay: `${index * 0.15}s`,
              opacity: 0.7 + (index * 0.1)
            }}
          />
        ))}
      </div>

      {/* Loading message with enhanced typography */}
      <p className="text-lg font-medium text-blue-100 tracking-wide">{message}</p>

      {/* Subtle progress bar */}
      <div className="mt-8 w-64 h-1 bg-blue-900/30 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-shimmer-organic"></div>
      </div>
    </>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a2151]/95 to-[#2d3a80]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
      {content}
    </div>
  )
}
