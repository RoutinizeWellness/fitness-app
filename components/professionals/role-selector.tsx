"use client"

import { useRouter } from "next/navigation"
import { Dumbbell, Utensils, ChevronRight, Users, ClipboardList } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"

export function ProfessionalRoleSelector() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold gradient-text mb-2">Únete como profesional</h2>
        <p className="text-gray-500">
          Selecciona tu rol profesional para comenzar a gestionar clientes y ofrecer tus servicios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card3D className="overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Entrenador Personal</h3>
              <p className="text-gray-500">
                Gestiona tus clientes, crea rutinas personalizadas y realiza seguimiento de su progreso
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Gestión de clientes</h4>
                  <p className="text-sm text-gray-500">Administra tus clientes y sus perfiles</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Rutinas personalizadas</h4>
                  <p className="text-sm text-gray-500">Crea y asigna rutinas adaptadas a cada cliente</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button3D className="w-full" onClick={() => router.push("/trainer-registration")}>
                Registrarse como entrenador
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button3D>
            </div>
          </div>
        </Card3D>

        <Card3D className="overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Utensils className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nutricionista</h3>
              <p className="text-gray-500">
                Crea planes nutricionales personalizados y realiza seguimiento de la alimentación de tus clientes
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Gestión de clientes</h4>
                  <p className="text-sm text-gray-500">Administra tus clientes y sus perfiles nutricionales</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Planes nutricionales</h4>
                  <p className="text-sm text-gray-500">Crea y asigna planes de alimentación personalizados</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button3D className="w-full" onClick={() => router.push("/nutritionist-registration")}>
                Registrarse como nutricionista
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button3D>
            </div>
          </div>
        </Card3D>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-4">
          ¿Ya tienes una cuenta profesional?
        </p>
        <div className="flex justify-center space-x-4">
          <Button3D variant="outline" onClick={() => router.push("/trainer-dashboard")}>
            Dashboard de entrenador
          </Button3D>
          <Button3D variant="outline" onClick={() => router.push("/nutritionist-dashboard")}>
            Dashboard de nutricionista
          </Button3D>
        </div>
      </div>
    </div>
  )
}
