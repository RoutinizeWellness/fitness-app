"use client"

import { useState } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button3D } from "@/components/ui/button-3d"
import { 
  MuscleGroupType, 
  MuscleGroupVolumeSummary, 
  MUSCLE_GROUP_DISPLAY_NAMES 
} from "@/lib/types/volume-landmarks"

interface VolumeLandmarksChartProps {
  summaries: MuscleGroupVolumeSummary[]
  selectedMuscleGroup: MuscleGroupType
  onSelectMuscleGroup: (muscleGroup: MuscleGroupType) => void
}

export function VolumeLandmarksChart({
  summaries,
  selectedMuscleGroup,
  onSelectMuscleGroup
}: VolumeLandmarksChartProps) {
  const [chartType, setChartType] = useState<"comparison" | "landmarks">("comparison")
  
  // Prepare data for comparison chart (current vs target volume)
  const comparisonData = summaries.map(summary => ({
    name: MUSCLE_GROUP_DISPLAY_NAMES[summary.muscle_group],
    muscleGroup: summary.muscle_group,
    current: summary.current_volume,
    target: summary.mav,
    status: summary.status
  }))
  
  // Prepare data for landmarks chart (MEV, MAV, MRV for selected muscle group)
  const selectedSummary = summaries.find(s => s.muscle_group === selectedMuscleGroup)
  const landmarksData = selectedSummary ? [
    { name: "MEV", value: selectedSummary.mev, type: "MEV" },
    { name: "MAV", value: selectedSummary.mav, type: "MAV" },
    { name: "MRV", value: selectedSummary.mrv, type: "MRV" },
    { name: "Actual", value: selectedSummary.current_volume, type: "Actual" }
  ] : []
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'below_mev':
        return "#EAB308" // yellow-500
      case 'optimal':
        return "#22C55E" // green-500
      case 'approaching_mrv':
        return "#3B82F6" // blue-500
      case 'exceeding_mrv':
        return "#EF4444" // red-500
      default:
        return "#6B7280" // gray-500
    }
  }
  
  // Custom tooltip for comparison chart
  const ComparisonTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Actual: {data.current} series/semana</p>
          <p className="text-sm">Óptimo: {data.target} series/semana</p>
          <p className="text-sm">
            Estado: <span style={{ color: getStatusColor(data.status) }}>
              {data.status === 'below_mev' ? 'Por debajo del MEV' :
               data.status === 'optimal' ? 'Volumen óptimo' :
               data.status === 'approaching_mrv' ? 'Acercándose al MRV' :
               'Excediendo el MRV'}
            </span>
          </p>
        </div>
      )
    }
    return null
  }
  
  // Custom tooltip for landmarks chart
  const LandmarksTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{data.value} series/semana</p>
          <p className="text-sm text-gray-500">
            {data.type === "MEV" ? "Volumen Mínimo Efectivo" :
             data.type === "MAV" ? "Volumen Adaptativo Máximo" :
             data.type === "MRV" ? "Volumen Máximo Recuperable" :
             "Volumen Actual"}
          </p>
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button3D
            variant={chartType === "comparison" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("comparison")}
          >
            Comparación
          </Button3D>
          <Button3D
            variant={chartType === "landmarks" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("landmarks")}
          >
            Puntos de referencia
          </Button3D>
        </div>
        
        {chartType === "landmarks" && (
          <Select 
            value={selectedMuscleGroup} 
            onValueChange={(value) => onSelectMuscleGroup(value as MuscleGroupType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              {summaries.map((summary) => (
                <SelectItem key={summary.muscle_group} value={summary.muscle_group}>
                  {summary.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "comparison" ? (
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis label={{ value: 'Series por semana', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<ComparisonTooltip />} />
              <Legend />
              <Bar 
                dataKey="current" 
                name="Volumen actual" 
                fill="#8884d8"
                onClick={(data) => onSelectMuscleGroup(data.muscleGroup as MuscleGroupType)}
              >
                {comparisonData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getStatusColor(entry.status)}
                    stroke="#fff"
                    strokeWidth={entry.muscleGroup === selectedMuscleGroup ? 2 : 0}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="target" 
                name="Volumen óptimo (MAV)" 
                fill="#82ca9d"
                onClick={(data) => onSelectMuscleGroup(data.muscleGroup as MuscleGroupType)}
              >
                {comparisonData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#82ca9d"
                    stroke="#fff"
                    strokeWidth={entry.muscleGroup === selectedMuscleGroup ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={landmarksData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Series por semana', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<LandmarksTooltip />} />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Series por semana" 
                fill="#8884d8"
              >
                {landmarksData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.type === "MEV" ? "#EAB308" : // yellow
                      entry.type === "MAV" ? "#22C55E" : // green
                      entry.type === "MRV" ? "#EF4444" : // red
                      "#3B82F6" // blue for current
                    }
                  />
                ))}
              </Bar>
              {selectedSummary && (
                <>
                  <ReferenceLine 
                    y={selectedSummary.mev} 
                    stroke="#EAB308" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'MEV', 
                      position: 'insideBottomRight',
                      fill: '#EAB308',
                      fontSize: 12
                    }} 
                  />
                  <ReferenceLine 
                    y={selectedSummary.mav} 
                    stroke="#22C55E" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'MAV', 
                      position: 'insideBottomRight',
                      fill: '#22C55E',
                      fontSize: 12
                    }} 
                  />
                  <ReferenceLine 
                    y={selectedSummary.mrv} 
                    stroke="#EF4444" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'MRV', 
                      position: 'insideBottomRight',
                      fill: '#EF4444',
                      fontSize: 12
                    }} 
                  />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
