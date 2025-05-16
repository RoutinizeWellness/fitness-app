"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Play, Lock, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CourseService } from "@/lib/services/course-service"
import { Course, Lesson } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"

interface CourseDetailsPageProps {
  params: {
    id: string
  }
}

export default function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])

  // Load course and lessons
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
          setLessons([])
        } else if (data) {
          setCourse(data)
          // If lessons are included in the course data
          if (data.lessons) {
            setLessons(data.lessons)
          } else {
            // Otherwise fetch lessons separately
            const lessonsResponse = await CourseService.getLessonsByCourseId(params.id, user?.id)
            if (lessonsResponse.data) {
              setLessons(lessonsResponse.data)
            }
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
        setLessons([])
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadCourse()
    }
  }, [params.id, user])

  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    // If lesson is free or user has access, navigate to lesson
    if (lesson.is_free || course?.progress) {
      router.push(`/courses/${params.id}/lessons/${lesson.id}`)
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
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] overflow-hidden mx-auto relative">
      {/* Header */}
      <div className="absolute left-[162px] top-[45px] w-[91px] h-[32px]"></div>
      
      {/* Video Preview */}
      <div className="absolute left-[20px] top-[121px] w-[374px] h-[200px]">
        <img className="absolute left-[0px] top-[0px]" src="/images/habit-builder/mask-group0.svg" alt="" />
      </div>
      
      {/* Back Button */}
      <div className="absolute left-[10px] top-[28px] w-[64px] h-[65px] overflow-hidden">
        <div className="absolute left-[15.62%] top-[16.92%] right-[15.62%] bottom-[15.38%] bg-[#573353] rounded-[25px] opacity-10"></div>
        <img className="absolute left-[24px] top-[27px] w-[16.5px] h-[12px]" src="/images/habit-builder/back-icon0.svg" alt="" />
      </div>
      
      {/* Course Title */}
      <div className="absolute left-[96px] top-[45px] w-[222px] h-[32px]">
        <div className="absolute left-[0px] top-[0px] right-[0px] bottom-[21.88%] text-[#573353] text-center font-['Manrope-Bold'] text-[18px] leading-[25px] tracking-[-0.03em] font-bold">
          30 Day Journal Challenge...
        </div>
      </div>
      
      {/* Content Background */}
      <img className="absolute left-[20px] top-[332px] w-[374px] h-[393px]" src="/images/habit-builder/background0.svg" alt="" />
      
      {/* Lessons */}
      {/* Lesson 5 */}
      <div className="absolute left-[26px] top-[680px] w-[352px] h-[38px]">
        <div className="absolute left-[52px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium">
          5. Day 1
        </div>
        <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px]">
          <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px] bg-[#FDA758] rounded-[12px] opacity-10"></div>
          <img className="absolute left-[11px] top-[9px] w-[16px] h-[20px]" src="/images/habit-builder/bx-bxs-lock0.svg" alt="" />
        </div>
        <div className="absolute left-[346px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium opacity-50">
          3:38
        </div>
      </div>
      
      {/* Lesson 4 */}
      <div className="absolute left-[26px] top-[630px] w-[352px] h-[38px]">
        <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px]">
          <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px] bg-[#FDA758] rounded-[12px] opacity-10"></div>
          <img className="absolute left-[11px] top-[9px] w-[16px] h-[20px]" src="/images/habit-builder/bx-bxs-lock1.svg" alt="" />
        </div>
        <div className="absolute left-[345px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium opacity-50">
          2:04
        </div>
        <div className="absolute left-[78px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium">
          4. Optional Supplies
        </div>
      </div>
      
      {/* Lesson 3 */}
      <div className="absolute left-[26px] top-[530px] w-[352px] h-[38px]">
        <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px]">
          <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px] bg-[#FDA758] rounded-[12px] opacity-10"></div>
          <img className="absolute left-[11px] top-[9px] w-[16px] h-[20px]" src="/images/habit-builder/bx-bxs-lock2.svg" alt="" />
        </div>
        <div className="absolute left-[345px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium opacity-50">
          3:08
        </div>
        <div className="absolute left-[78px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium">
          2. Adopting Prompts to Covid-19...
        </div>
      </div>
      
      {/* Lesson 2 */}
      <div className="absolute left-[26px] top-[580px] w-[352px] h-[38px]">
        <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px]">
          <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px] bg-[#FDA758] rounded-[12px] opacity-10"></div>
          <img className="absolute left-[11px] top-[9px] w-[16px] h-[20px]" src="/images/habit-builder/bx-bxs-lock3.svg" alt="" />
        </div>
        <div className="absolute left-[344px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium opacity-50">
          6:06
        </div>
        <div className="absolute left-[78px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium">
          3. Choosing a Notebook
        </div>
      </div>
      
      {/* Lesson 1 */}
      <div className="absolute left-[26px] top-[480px] w-[352px] h-[38px]">
        <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px]">
          <div className="absolute left-[0px] top-[0px] w-[38px] h-[38px] bg-[#FDA758] rounded-[12px] opacity-10"></div>
          <div className="absolute left-[11px] top-[10px] w-[16px] h-[17.6px] overflow-hidden">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 7.74L3 14.26V1.22L14 7.74Z" fill="#FDA758" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="absolute left-[74px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium">
          <ol>
            <li>Introduction</li>
          </ol>
        </div>
        <div className="absolute left-[348px] top-[11px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium opacity-50">
          2:16
        </div>
      </div>
      
      {/* Course Info */}
      <div className="absolute left-[37px] top-[443px] text-[#573353] font-['Manrope-Bold'] text-[16px] leading-[14px] tracking-[-0.03em] font-bold">
        37 Lessons (2h 41m)
      </div>
      
      <div className="absolute left-[37px] top-[357px] text-[#573353] font-['Manrope-Bold'] text-[18px] leading-[25px] tracking-[-0.03em] font-bold w-[324px]">
        30 Day Journal Challenge - Establish a Habit of Daily Journaling
      </div>
      
      {/* Bottom Menu */}
      <div className="absolute left-[0px] top-[772px] w-[414px] h-[124px]">
        <img className="absolute left-[0px] top-[44px] right-[0px] bottom-[0px] w-full h-[64.52%]" src="/images/habit-builder/menu1.svg" alt="" />
        <img className="absolute left-[42.27%] top-[0px] right-[42.27%] bottom-[48.39%] w-[15.46%] h-[51.61%]" src="/images/habit-builder/plus-button0.svg" alt="" />
      </div>
    </div>
  )
}
