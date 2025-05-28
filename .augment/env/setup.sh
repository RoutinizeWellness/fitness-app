#!/bin/bash
set -e

echo "Creating a home page to showcase improvements..."

# Create a home page
mkdir -p app
cat > app/page.tsx << EOL
import Link from "next/link"
import { ArrowRight, Dumbbell, Utensils, Brain, BarChart3, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Routinize</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            Tu entrenamiento personalizado, <span className="text-primary">simplificado</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground md:text-xl">
            Routinize es la aplicación de fitness diseñada para profesionales ocupados.
            Entrena de manera efectiva, controla tu nutrición y mejora tu bienestar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Comenzar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/training/shared">Ver rutinas compartidas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Dumbbell className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Entrenamiento</CardTitle>
              <CardDescription>
                Rutinas personalizadas basadas en tus objetivos y disponibilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Planes de entrenamiento científicos con periodización, seguimiento de progreso y adaptación automática.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/training">Explorar</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Utensils className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Nutrición</CardTitle>
              <CardDescription>
                Planes de alimentación adaptados a tus objetivos y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recomendaciones nutricionales personalizadas, seguimiento de macros y planificación de comidas.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/nutrition">Explorar</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Bienestar</CardTitle>
              <CardDescription>
                Técnicas de mindfulness y gestión del estrés para profesionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ejercicios de respiración, meditación y técnicas de relajación adaptadas a tu rutina diaria.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/wellness">Explorar</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Progreso</CardTitle>
              <CardDescription>
                Seguimiento detallado de tu evolución física y mental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualiza tu progreso con gráficos detallados, estadísticas y análisis de tendencias.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/training/progress">Explorar</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Compartir</CardTitle>
              <CardDescription>
                Comparte tus rutinas y logros con la comunidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conecta con otros usuarios, comparte tus rutinas favoritas y encuentra inspiración.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/training/shared">Explorar</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5" />
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <CardTitle className="mt-4">Modo Offline</CardTitle>
                <CardDescription>
                  Accede a tus rutinas y registra tus entrenamientos sin conexión
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Routinize funciona incluso sin conexión a Internet. Tus datos se sincronizarán automáticamente cuando vuelvas a estar en línea.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/offline">Más información</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA section */}
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Comienza tu transformación hoy
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Únete a miles de profesionales que han mejorado su salud y bienestar con Routinize
          </p>
          <Button size="lg" className="mt-6">
            <Link href="/dashboard">Comenzar gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Routinize. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Términos
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
EOL

# Create a theme provider component
mkdir -p components
cat > components/theme-provider.tsx << EOL
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
EOL

# Create a dashboard page
mkdir -p app/dashboard
cat > app/dashboard/page.tsx << EOL
import { Metadata } from "next"
import Link from "next/link"
import { BarChart3, Dumbbell, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectivityStatus } from "@/components/features/app/connectivity-status"

export const metadata: Metadata = {
  title: "Dashboard | Routinize",
  description: "Tu panel de control personalizado",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de control personalizado
          </p>
        </div>
        <ConnectivityStatus />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Entrenamiento</CardTitle>
            <CardDescription>
              Visualiza y analiza tu progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] rounded-md border border-dashed flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/training/progress">Ver progreso</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rutinas de Entrenamiento</CardTitle>
            <CardDescription>
              Accede a tus rutinas personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] rounded-md border border-dashed flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/training">Ver rutinas</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rutinas Compartidas</CardTitle>
            <CardDescription>
              Explora rutinas de la comunidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] rounded-md border border-dashed flex items-center justify-center">
              <Share2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/training/shared">Explorar</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
EOL

# Create a globals.css file
mkdir -p app
cat > app/globals.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 54% 30%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 54% 30%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 217.2 91.2% 59.8%;
    --sidebar-background: 240 10% 3.9%;
    --sidebar-foreground: 0 0% 98%;
    --sidebar-primary: 217.2 91.2% 59.8%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 0 0% 98%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOL

echo "Home page created successfully!"