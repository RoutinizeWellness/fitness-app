"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { HabitDayGrid } from "./habit-day-card"
import Image from "next/image"

interface HabitQuoteCardProps {
  quote?: string
  author?: string
  className?: string
}

export function HabitQuoteCard({
  quote = "We first make our habits, and then our habits makes us.",
  author = "anonymous",
  className,
}: HabitQuoteCardProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  return (
    <div className={cn("space-y-4", className)}>
      {/* Habits Title */}
      <h2 className="font-manrope font-bold text-sm leading-8 tracking-tight uppercase text-[#573353]">
        Habits
      </h2>

      {/* Quote Card */}
      <div className="relative w-full h-[146px] bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[45.45%] right-[-8.82%] top-[-25.34%] bottom-[-115.75%] opacity-10">
            <Image
              src="/images/habit-pattern.svg"
              alt="Background pattern"
              width={300}
              height={300}
              className="object-cover"
            />
          </div>
        </div>

        {/* Quote Text */}
        <div className="absolute left-[4%] right-[3%] top-[17.81%] bottom-[39.73%]">
          <p className="font-['Roboto_Serif'] font-normal text-lg leading-5 tracking-tight uppercase text-[#573353]">
            {quote}
          </p>
        </div>

        {/* Author */}
        <div className="absolute left-[14px] bottom-[34px]">
          <p className="font-manrope font-bold text-xs leading-6 text-center uppercase text-[#573353] opacity-50">
            - {author}
          </p>
        </div>
      </div>

      {/* Day Selection */}
      <HabitDayGrid
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
    </div>
  )
}
