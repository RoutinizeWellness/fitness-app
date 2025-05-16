"use client"

import React from "react"

interface HabitCardSimpleProps {
  id: string
  title: string
  subtitle: string
  category: 'water' | 'reading' | 'exercise' | 'nutrition' | 'sleep' | 'productivity' | 'health'
  completed: boolean
  onToggleComplete: (id: string, completed: boolean) => void
}

export function HabitCardSimple({
  id,
  title,
  subtitle,
  category,
  completed,
  onToggleComplete
}: HabitCardSimpleProps) {
  // Category color mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'water':
        return { bg: 'bg-[#8C80F8]/20', main: 'bg-[#8C80F8]' }
      case 'reading':
        return { bg: 'bg-[#FDA758]/20', main: 'bg-[#FDA758]' }
      case 'exercise':
        return { bg: 'bg-[#FF6767]/20', main: 'bg-[#FF6767]' }
      case 'nutrition':
        return { bg: 'bg-[#5DE292]/20', main: 'bg-[#5DE292]' }
      case 'sleep':
        return { bg: 'bg-[#8C80F8]/20', main: 'bg-[#8C80F8]' }
      case 'productivity':
        return { bg: 'bg-[#8C80F8]/20', main: 'bg-[#8C80F8]' }
      case 'health':
        return { bg: 'bg-[#5DE292]/20', main: 'bg-[#5DE292]' }
      default:
        return { bg: 'bg-[#FDA758]/20', main: 'bg-[#FDA758]' }
    }
  }

  const colors = getCategoryColor(category)

  return (
    <div className="bg-white rounded-[24px] p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg mr-4 flex items-center justify-center ${colors.bg}`}>
          <div className={`w-8 h-8 rounded-md ${colors.main}`}></div>
        </div>
        <div>
          <h3 className="font-medium text-[#573353]">{title}</h3>
          <p className="text-sm text-[#573353]/70">{subtitle}</p>
        </div>
      </div>
      <button 
        className={`${completed ? 'bg-[#FDA758] text-white' : 'bg-[#F5F5F5] text-[#573353]'} font-medium rounded-full px-4 py-2 text-sm`}
        onClick={() => onToggleComplete(id, !completed)}
      >
        {completed ? 'Done!' : 'Mark Done'}
      </button>
    </div>
  )
}
