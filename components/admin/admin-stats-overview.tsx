"use client"

import { useState } from "react"
import {
  Users, UserPlus, BarChart2, Dumbbell, Utensils,
  Calendar, Activity, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, PieChart
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Progress } from "@/components/ui/progress"
import { GlobalStats } from "@/lib/admin-dashboard-service"

interface AdminStatsOverviewProps {
  stats: GlobalStats
}

export function AdminStatsOverview({ stats }: AdminStatsOverviewProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta de usuarios */}
        <Card3D>
          <Card3DContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Usuarios totales</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  <span>+{stats.newUsersThisMonth} este mes</span>
                </div>
                <span>{stats.activeUsers} activos</span>
              </div>
              <Progress 
                value={(stats.activeUsers / stats.totalUsers) * 100} 
                className="mt-2"
              />
            </div>
          </Card3DContent>
        </Card3D>

        {/* Tarjeta de entrenadores */}
        <Card3D>
          <Card3DContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Entrenadores</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalTrainers}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Dumbbell className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span>{stats.verifiedTrainers} verificados</span>
                </div>
                <span>{stats.totalTrainers - stats.verifiedTrainers} pendientes</span>
              </div>
              <Progress 
                value={(stats.verifiedTrainers / (stats.totalTrainers || 1)) * 100} 
                className="mt-2"
              />
            </div>
          </Card3DContent>
        </Card3D>

        {/* Tarjeta de nutricionistas */}
        <Card3D>
          <Card3DContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Nutricionistas</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalNutritionists}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Utensils className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span>{stats.verifiedNutritionists} verificados</span>
                </div>
                <span>{stats.totalNutritionists - stats.verifiedNutritionists} pendientes</span>
              </div>
              <Progress 
                value={(stats.verifiedNutritionists / (stats.totalNutritionists || 1)) * 100} 
                className="mt-2"
              />
            </div>
          </Card3DContent>
        </Card3D>

        {/* Tarjeta de relaciones cliente-profesional */}
        <Card3D>
          <Card3DContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Relaciones cliente-profesional</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalClientRelationships}</h3>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <UserPlus className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span>{stats.activeClientRelationships} activas</span>
                </div>
                <span>{stats.totalClientRelationships - stats.activeClientRelationships} inactivas</span>
              </div>
              <Progress 
                value={(stats.activeClientRelationships / (stats.totalClientRelationships || 1)) * 100} 
                className="mt-2"
              />
            </div>
          </Card3DContent>
        </Card3D>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de actividad de entrenamiento */}
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Actividad de entrenamiento</Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{stats.totalWorkouts}</h3>
                <p className="text-sm text-gray-500">Entrenamientos totales</p>
              </div>
              <div>
                <h3 className="text-xl font-bold">{stats.workoutsThisMonth}</h3>
                <p className="text-sm text-gray-500">Este mes</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Entrenamientos por usuario</span>
                  <span className="text-sm text-gray-500">
                    {(stats.totalWorkouts / (stats.totalUsers || 1)).toFixed(1)}
                  </span>
                </div>
                <Progress value={Math.min((stats.totalWorkouts / (stats.totalUsers || 1)) * 10, 100)} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Actividad mensual</span>
                  <span className="text-sm text-gray-500">
                    {((stats.workoutsThisMonth / stats.totalWorkouts) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(stats.workoutsThisMonth / (stats.totalWorkouts || 1)) * 100} />
              </div>
            </div>
          </Card3DContent>
        </Card3D>

        {/* Tarjeta de actividad de nutrición */}
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Actividad de nutrición</Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{stats.totalMealPlans}</h3>
                <p className="text-sm text-gray-500">Planes de comida totales</p>
              </div>
              <div>
                <h3 className="text-xl font-bold">{stats.mealPlansThisMonth}</h3>
                <p className="text-sm text-gray-500">Este mes</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Planes por usuario</span>
                  <span className="text-sm text-gray-500">
                    {(stats.totalMealPlans / (stats.totalUsers || 1)).toFixed(1)}
                  </span>
                </div>
                <Progress value={Math.min((stats.totalMealPlans / (stats.totalUsers || 1)) * 10, 100)} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Actividad mensual</span>
                  <span className="text-sm text-gray-500">
                    {((stats.mealPlansThisMonth / stats.totalMealPlans) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(stats.mealPlansThisMonth / (stats.totalMealPlans || 1)) * 100} />
              </div>
            </div>
          </Card3DContent>
        </Card3D>
      </div>

      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Distribución de usuarios</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold gradient-text">
                {stats.totalUsers - stats.totalTrainers - stats.totalNutritionists}
              </div>
              <p className="text-sm text-gray-500">Clientes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold gradient-text">
                {stats.totalTrainers}
              </div>
              <p className="text-sm text-gray-500">Entrenadores</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold gradient-text">
                {stats.totalNutritionists}
              </div>
              <p className="text-sm text-gray-500">Nutricionistas</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold gradient-text">
                {stats.activeUsers}
              </div>
              <p className="text-sm text-gray-500">Usuarios activos</p>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
