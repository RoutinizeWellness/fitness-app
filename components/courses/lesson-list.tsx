"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, Lock, Play } from "lucide-react"
import { Lesson } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"

interface LessonListProps {
  lessons: Lesson[]
  courseId: string
  userHasAccess?: boolean
  className?: string
}

export function LessonList({ lessons, courseId, userHasAccess = false, className = "" }: LessonListProps) {
  const router = useRouter()
  
  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    // If lesson is free or user has access, navigate to lesson
    if (lesson.is_free || userHasAccess) {
      router.push(`/courses/${courseId}/lessons/${lesson.id}`)
    } else {
      toast({
        title: "Premium content",
        description: "This lesson requires a subscription",
        variant: "destructive",
      })
    }
  }

  // Format duration
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return ""
    return duration
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {lessons.map((lesson, index) => (
        <div 
          key={lesson.id}
          className="flex items-center p-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleLessonClick(lesson)}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FDA758] bg-opacity-10 flex items-center justify-center mr-3 text-[#573353]">
            {lesson.progress?.is_completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[#573353]">{lesson.title}</h4>
            {lesson.description && (
              <p className="text-xs text-[#573353] opacity-70 line-clamp-1">{lesson.description}</p>
            )}
            <div className="flex items-center text-xs text-[#573353] opacity-70 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDuration(lesson.duration)}</span>
            </div>
          </div>
          <div className="ml-2">
            {!lesson.is_free && !userHasAccess ? (
              <Lock className="h-4 w-4 text-[#573353] opacity-50" />
            ) : (
              <Play className="h-4 w-4 text-[#FDA758]" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
