"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Clock, User } from "lucide-react"
import { Course } from "@/lib/types/courses"

interface CourseCardProps {
  course: Course
  showProgress?: boolean
  className?: string
}

export function CourseCard({ course, showProgress = true, className = "" }: CourseCardProps) {
  // Format difficulty badge
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "intermediate":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "advanced":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className}`}>
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <img
            src={course.thumbnail_url || "/placeholder.svg"}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          {course.is_featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#FDA758] hover:bg-[#FDA758]/90 text-white">Featured</Badge>
            </div>
          )}
          {showProgress && course.progress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-[#FDA758]" 
                style={{ width: `${course.progress.progress_percentage}%` }}
              />
            </div>
          )}
          <button 
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              // Add bookmark functionality here
            }}
          >
            <Bookmark className="h-4 w-4 text-[#573353]" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#573353] mb-1 line-clamp-2">{course.title}</h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-xs text-[#573353] opacity-70">
              <Clock className="h-3 w-3 mr-1" />
              <span>{course.duration || `${course.lessons_count} lessons`}</span>
            </div>
            
            {course.difficulty && (
              <Badge variant="outline" className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </Badge>
            )}
          </div>
          
          {course.author && (
            <div className="flex items-center text-xs text-[#573353] opacity-70">
              <User className="h-3 w-3 mr-1" />
              <span>{course.author.full_name || "Unknown Author"}</span>
            </div>
          )}
          
          {showProgress && course.progress && (
            <div className="mt-2 text-xs text-[#573353]">
              {course.progress.is_completed ? (
                <span className="text-green-600">Completed</span>
              ) : (
                <span>{course.progress.progress_percentage}% complete</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
