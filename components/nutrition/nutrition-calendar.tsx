"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NutritionEntry } from "@/lib/types/nutrition"
import CalendarDaySummary from "./calendar-day-summary"

interface NutritionCalendarProps {
  entries: NutritionEntry[]
  onDateSelect: (date: string) => void
  selectedDate?: string
}

export default function NutritionCalendar({
  entries,
  onDateSelect,
  selectedDate = new Date().toISOString().split("T")[0]
}: NutritionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [entriesByDate, setEntriesByDate] = useState<Record<string, NutritionEntry[]>>({})
  
  // Generar días del calendario para el mes actual
  useEffect(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Añadir días de la semana anterior para completar la primera semana
    const firstDayOfWeek = start.getDay() // 0 = domingo, 1 = lunes, etc.
    const previousMonthDays = []
    
    for (let i = firstDayOfWeek; i > 0; i--) {
      const date = new Date(start)
      date.setDate(start.getDate() - i)
      previousMonthDays.push(date)
    }
    
    // Añadir días de la semana siguiente para completar la última semana
    const lastDayOfWeek = end.getDay()
    const nextMonthDays = []
    
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(end)
      date.setDate(end.getDate() + i)
      nextMonthDays.push(date)
    }
    
    setCalendarDays([...previousMonthDays, ...days, ...nextMonthDays])
  }, [currentMonth])
  
  // Agrupar entradas por fecha
  useEffect(() => {
    const groupedEntries: Record<string, NutritionEntry[]> = {}
    
    entries.forEach(entry => {
      if (!groupedEntries[entry.date]) {
        groupedEntries[entry.date] = []
      }
      groupedEntries[entry.date].push(entry)
    })
    
    setEntriesByDate(groupedEntries)
  }, [entries])
  
  // Cambiar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  // Cambiar al mes siguiente
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  // Cambiar al mes actual
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date())
  }
  
  // Nombres de los días de la semana
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      {/* Encabezado del calendario */}
      <div className="flex items-center justify-between mb-6">
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F9F9F9]"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-5 w-5 text-[#573353]" />
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#573353] capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          {!isSameMonth(currentMonth, new Date()) && (
            <button 
              className="text-xs text-[#FDA758] font-medium"
              onClick={goToCurrentMonth}
            >
              Ir al mes actual
            </button>
          )}
        </div>
        
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F9F9F9]"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-5 w-5 text-[#573353]" />
        </button>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center">
            <p className="text-xs font-medium text-[#573353]/70">{day}</p>
          </div>
        ))}
      </div>
      
      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(day => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayEntries = entriesByDate[dateStr] || []
          const isCurrentMonth = isSameMonth(day, currentMonth)
          
          return (
            <div 
              key={dateStr}
              className={`${!isCurrentMonth ? "opacity-40" : ""}`}
            >
              <CalendarDaySummary
                date={dateStr}
                entries={dayEntries}
                onClick={() => onDateSelect(dateStr)}
                isSelected={dateStr === selectedDate}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
