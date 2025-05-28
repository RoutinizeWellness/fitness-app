"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { getCourseById, getLessonById, getLessonsByCourseId, updateLessonProgress } from "@/lib/supabase-courses"
import { Course, Lesson } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"

interface LessonPageProps {
  params: {
    id: string
    lessonId: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [progressSeconds, setProgressSeconds] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Fetch course and lesson data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await getCourseById(params.id, user?.id)
        if (courseError) throw courseError
        setCourse(courseData)

        // Fetch current lesson
        const { data: lessonData, error: lessonError } = await getLessonById(params.lessonId, user?.id)
        if (lessonError) throw lessonError
        setLesson(lessonData)

        // Set initial progress seconds
        if (lessonData?.progress) {
          setProgressSeconds(lessonData.progress.progress_seconds || 0)
        }

        // Fetch all lessons for navigation
        const { data: lessonsData, error: lessonsError } = await getLessonsByCourseId(params.id, user?.id)
        if (lessonsError) throw lessonsError
        setLessons(lessonsData || [])
      } catch (error) {
        console.error("Error fetching lesson data:", error)
        toast({
          title: "Error",
          description: "Failed to load lesson",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && params.lessonId && user?.id) {
      fetchData()
    } else if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this lesson",
        variant: "destructive",
      })
      router.push("/auth/login")
    }
  }, [params.id, params.lessonId, user?.id, router])

  // Set up progress tracking
  useEffect(() => {
    if (user?.id && lesson?.id && !lesson.progress?.is_completed) {
      // Start tracking progress
      progressInterval.current = setInterval(() => {
        setProgressSeconds(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [user?.id, lesson?.id, lesson?.progress?.is_completed])

  // Save progress periodically
  useEffect(() => {
    const saveProgress = async () => {
      if (user?.id && lesson?.id && progressSeconds > 0) {
        try {
          await updateLessonProgress(
            user.id,
            lesson.id,
            lesson.progress?.is_completed || false,
            progressSeconds
          )
        } catch (error) {
          console.error("Error saving progress:", error)
        }
      }
    }

    // Save progress every 10 seconds
    const saveInterval = setInterval(saveProgress, 10000)

    return () => {
      clearInterval(saveInterval)
      saveProgress() // Save on unmount
    }
  }, [user?.id, lesson?.id, progressSeconds, lesson?.progress?.is_completed])

  // Mark lesson as completed
  const markAsCompleted = async () => {
    if (!user?.id || !lesson?.id) return

    setIsCompleting(true)
    try {
      await updateLessonProgress(user.id, lesson.id, true, progressSeconds)

      // Update local state
      setLesson(prev => {
        if (!prev) return null
        return {
          ...prev,
          progress: {
            ...prev.progress,
            is_completed: true,
            completed_at: new Date().toISOString()
          }
        }
      })

      toast({
        title: "Lesson completed",
        description: "Your progress has been saved",
      })
    } catch (error) {
      console.error("Error marking lesson as completed:", error)
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  // Navigate to next or previous lesson
  const navigateToLesson = (direction: 'next' | 'prev') => {
    if (!lesson || lessons.length === 0) return

    const currentIndex = lessons.findIndex(l => l.id === lesson.id)
    if (currentIndex === -1) return

    let targetIndex
    if (direction === 'next') {
      targetIndex = currentIndex + 1
      if (targetIndex >= lessons.length) {
        // Last lesson, go back to course page
        router.push(`/courses/${params.id}`)
        return
      }
    } else {
      targetIndex = currentIndex - 1
      if (targetIndex < 0) {
        // First lesson, go back to course page
        router.push(`/courses/${params.id}`)
        return
      }
    }

    router.push(`/courses/${params.id}/lessons/${lessons[targetIndex].id}`)
  }

  return (
    <div className="relative w-full min-h-screen bg-[#FFF3E9]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-7">
        <Link href={`/courses/${params.id}`} className="w-10 h-10 rounded-full bg-[#573353] bg-opacity-10 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-[#573353]" />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#573353]">
            {course?.title ? course.title : "Lesson"}
          </h1>
        </div>
        <div className="w-10 h-10 opacity-0">
          {/* Placeholder for balance */}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
        </div>
      ) : lesson ? (
        <div className="px-4 pb-32">
          {/* Video Player */}
          {lesson.video_url && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                src={lesson.video_url}
                controls
                className="w-full aspect-video bg-black"
                poster={course?.thumbnail_url}
              />
            </div>
          )}

          {/* Lesson Content */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#573353] mb-3">{lesson.title}</h2>
            <div className="prose prose-sm text-[#573353]">
              <p>{lesson.description}</p>
              {lesson.content && (
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              )}
            </div>
          </div>

          {/* Lesson Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              className="bg-white border-none"
              onClick={() => navigateToLesson('prev')}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </Button>

            {lesson.progress?.is_completed ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span>Completed</span>
              </div>
            ) : (
              <Button
                onClick={markAsCompleted}
                disabled={isCompleting}
                className="bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              className="bg-white border-none"
              onClick={() => navigateToLesson('next')}
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center py-20">
          <p className="text-[#573353]">Lesson not found</p>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white h-[80px] flex items-center justify-around">
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-1/5">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18V15" stroke="#EBDCCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.07 2.82L3.14 8.37C2.36 8.99 1.86 10.3 2.03 11.28L3.36 19.24C3.6 20.66 4.96 21.81 6.4 21.81H17.6C19.03 21.81 20.4 20.65 20.64 19.24L21.97 11.28C22.13 10.3 21.63 8.99 20.86 8.37L13.93 2.83C12.86 1.97 11.13 1.97 10.07 2.82Z" stroke="#EBDCCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#EBDCCF]">Home</span>
        </Link>
        <Link href="/training" className="flex flex-col items-center justify-center w-1/5">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.62 16.28C9.62 17.29 10.42 18.12 11.39 18.12H13.59C14.43 18.12 15.12 17.4 15.12 16.52C15.12 15.57 14.71 15.23 14.09 15.02L9.91 13.47C9.29 13.26 8.88 12.93 8.88 11.97C8.88 11.1 9.57 10.37 10.41 10.37H12.61C13.58 10.37 14.38 11.2 14.38 12.21" stroke="#EBDCCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9V19" stroke="#EBDCCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#EBDCCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#EBDCCF]">Training</span>
        </Link>
        <div className="flex flex-col items-center justify-center w-1/5 relative">
          <div className="absolute -top-6 w-14 h-14 rounded-full bg-[#FC9D45] flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12H18" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18V6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="mt-8">
            <span className="text-xs text-[#EBDCCF]">New</span>
          </div>
        </div>
        <Link href="/community" className="flex flex-col items-center justify-center w-1/5">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 18.43H13L8.54999 21.39C7.88999 21.83 7 21.36 7 20.56V18.43C4 18.43 2 16.43 2 13.43V7.42993C2 4.42993 4 2.42993 7 2.42993H17C20 2.42993 22 4.42993 22 7.42993V13.43C22 16.43 20 18.43 17 18.43Z" stroke="#EBDCCF" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11.36V11.15C12 10.47 12.42 10.11 12.84 9.82001C13.25 9.54001 13.66 9.18002 13.66 8.52002C13.66 7.60002 12.92 6.85999 12 6.85999C11.08 6.85999 10.34 7.60002 10.34 8.52002" stroke="#EBDCCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 13.75H12.0045" stroke="#EBDCCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#EBDCCF]">Community</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center justify-center w-1/5">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="#FDA758" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 4.5V6.5C14.5 7.6 15.4 8.5 16.5 8.5H18.5" stroke="#FDA758" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 13H12" stroke="#FDA758" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 17H16" stroke="#FDA758" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#FDA758]">Courses</span>
        </Link>
      </div>
    </div>
  )
}
