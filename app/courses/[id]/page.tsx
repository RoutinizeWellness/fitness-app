"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, Play, Clock } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { getCourseById, getLessonsByCourseId, updateLessonProgress } from "@/lib/supabase-courses"
import { Course, Lesson } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"
import { LessonList } from "@/components/courses/lesson-list"

interface CourseDetailPageProps {
  params: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Redirect to the new course details page
  useEffect(() => {
    router.push(`/courses/${params.id}/details`)
  }, [router, params.id])

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch course and lessons
  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true)
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await getCourseById(params.id, user?.id)
        if (courseError) throw courseError
        setCourse(courseData)

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await getLessonsByCourseId(params.id, user?.id)
        if (lessonsError) throw lessonsError
        setLessons(lessonsData || [])
      } catch (error) {
        console.error("Error fetching course data:", error)
        toast({
          title: "Error",
          description: "Failed to load course",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCourseData()
    }
  }, [params.id, user?.id])

  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this lesson",
        variant: "destructive",
      })
      return
    }

    // If lesson is locked and user hasn't purchased the course
    if (!lesson.is_free) {
      // Check if user has access to this course
      // This is a simplified check - you might need more complex logic
      if (!course?.progress) {
        toast({
          title: "Premium content",
          description: "This lesson requires a subscription",
          variant: "destructive",
        })
        return
      }
    }

    // Navigate to lesson
    router.push(`/courses/${params.id}/lessons/${lesson.id}`)
  }

  // Calculate course progress
  const calculateProgress = () => {
    if (!course?.progress) return 0
    return course.progress.progress_percentage
  }

  // Format duration
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return ""
    return duration
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] overflow-hidden mx-auto relative flex items-center justify-center">
      <div className="animate-pulse text-[#573353]">Redirecting to course details...</div>
    </div>
  )
}
