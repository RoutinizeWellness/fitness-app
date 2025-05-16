"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, ChevronLeft, Play, Clock, Home, BookOpen, BarChart2, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CourseService } from "@/lib/services/course-service"
import { Course, Lesson } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"

interface CourseDetailPageProps {
  params: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])

  // Load course details
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await CourseService.getCourseById(params.id, user?.id)
        
        if (error) {
          console.error("Error loading course:", error)
          toast({
            title: "Error",
            description: "Failed to load course details. Please try again.",
            variant: "destructive"
          })
          setCourse(null)
        } else if (data) {
          setCourse(data)
          
          // Load lessons
          const { data: lessonsData, error: lessonsError } = await CourseService.getLessonsByCourseId(params.id, user?.id)
          
          if (lessonsError) {
            console.error("Error loading lessons:", lessonsError)
            setLessons([])
          } else {
            setLessons(lessonsData || [])
          }
        }
      } catch (error) {
        console.error("Error loading course:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        })
        setCourse(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourse()
  }, [params.id, user])

  // Start course or continue learning
  const handleStartCourse = () => {
    if (!course) return
    
    // If user has progress, navigate to the last accessed lesson
    if (course.progress?.last_accessed_lesson_id) {
      router.push(`/habit-courses/${params.id}/lessons/${course.progress.last_accessed_lesson_id}`)
    } else if (lessons.length > 0) {
      // Otherwise, start with the first lesson
      router.push(`/habit-courses/${params.id}/lessons/${lessons[0].id}`)
    }
  }

  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    // If lesson is free or user has access, navigate to lesson
    if (lesson.is_free || course?.progress) {
      router.push(`/habit-courses/${params.id}/lessons/${lesson.id}`)
    } else {
      toast({
        title: "Premium content",
        description: "This lesson requires a subscription",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex flex-col items-center justify-center p-4">
        <BookOpen className="h-16 w-16 text-[#573353]/30 mb-4" />
        <h2 className="text-[#573353] text-xl font-medium mb-2">Course not found</h2>
        <p className="text-[#573353]/70 text-center mb-6">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          onClick={() => router.push("/habit-courses")}
          className="bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
        >
          Browse Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-[#573353]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[#573353] text-lg font-medium">Course Details</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {/* Course Header */}
      <div className="px-4 mb-6">
        <div className="relative h-48 rounded-3xl overflow-hidden">
          <Image
            src={course.thumbnail_url || "/images/courses/default-course.jpg"}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-white text-xl font-bold mb-2">{course.title}</h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white/90">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{course.duration || `${course.lessons_count} lessons`}</span>
              </div>
              
              {course.author && (
                <div className="flex items-center text-white/90">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center mr-1">
                    {course.author.avatar_url ? (
                      <Image
                        src={course.author.avatar_url}
                        alt={course.author.full_name || ""}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{course.author.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      {course.progress && (
        <div className="px-4 mb-6">
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[#573353] font-medium">Your Progress</h3>
              <span className="text-[#573353] text-sm">{course.progress.progress_percentage}%</span>
            </div>
            <Progress 
              value={course.progress.progress_percentage} 
              className="h-2 bg-[#FFF2E9]"
              indicatorClassName="bg-[#FDA758]"
            />
            <Button
              onClick={handleStartCourse}
              className="w-full mt-4 bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
            >
              {course.progress.progress_percentage > 0 ? "Continue Learning" : "Start Course"}
            </Button>
          </div>
        </div>
      )}

      {/* Course Description */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-[#573353] font-medium mb-2">About this course</h3>
          <p className="text-[#573353]/80 text-sm">
            {course.description || "No description available for this course."}
          </p>
        </div>
      </div>

      {/* Lessons List */}
      <div className="px-4 pb-24">
        <h3 className="text-[#573353] font-medium mb-3">{lessons.length} Lessons</h3>
        
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              className="flex items-center p-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleLessonClick(lesson)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FDA758] bg-opacity-10 flex items-center justify-center mr-3 text-[#573353]">
                {lesson.progress?.is_completed ? (
                  <div className="h-5 w-5 rounded-full bg-[#FDA758] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
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
                  <span>{lesson.duration || "Self-paced"}</span>
                </div>
              </div>
              <div className="ml-2">
                {!lesson.is_free && !course.progress ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.66667 7.33333V5.33333C4.66667 3.49267 6.16 2 8 2C9.84 2 11.3333 3.49267 11.3333 5.33333V7.33333M4.66667 7.33333H11.3333M4.66667 7.33333H3.33333C2.96667 7.33333 2.66667 7.63333 2.66667 8V12.6667C2.66667 13.0333 2.96667 13.3333 3.33333 13.3333H12.6667C13.0333 13.3333 13.3333 13.0333 13.3333 12.6667V8C13.3333 7.63333 13.0333 7.33333 12.6667 7.33333H11.3333" stroke="#573353" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-[#FDA758] flex items-center justify-center">
                    <Play className="h-3 w-3 text-white" fill="white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {lessons.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl">
            <BookOpen className="h-12 w-12 text-[#573353]/30 mx-auto mb-4" />
            <p className="text-[#573353]/70">No lessons available yet</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3">
        <Link href="/habit-dashboard" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <Home className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Home</span>
        </Link>
        
        <Link href="/habit-courses" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#FDA758]" />
          </div>
          <span className="text-xs text-[#FDA758] mt-1">Courses</span>
        </Link>
        
        <Link href="/habit-dashboard/stats" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Stats</span>
        </Link>
        
        <Link href="/profile/habit-dashboard" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <User className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
