"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CourseService } from "@/lib/services/course-service"
import { Course, CourseSortOption } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"

export default function CourseOverviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [sortBy, setSortBy] = useState<CourseSortOption>("popular")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await CourseService.getCourses(sortBy, undefined, user?.id)
        
        if (error) {
          console.error("Error loading courses:", error)
          toast({
            title: "Error",
            description: "Failed to load courses. Please try again.",
            variant: "destructive"
          })
          setCourses([])
        } else {
          setCourses(data || [])
          setFilteredCourses(data || [])
        }
      } catch (error) {
        console.error("Error loading courses:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        })
        setCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [user, sortBy])

  // Filter courses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses)
      return
    }

    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value as CourseSortOption)
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] overflow-hidden mx-auto relative">
      {/* Background elements */}
      <img className="absolute left-[-70px] top-[865px] w-[535.5px] h-[166px]" src="/images/habit-builder/vector-1690.svg" alt="" />
      <img className="absolute left-[-70px] top-[865px] w-[535.5px] h-[166px]" src="/images/habit-builder/vector-1700.svg" alt="" />
      <img className="absolute left-[-70px] top-[865px] w-[535.5px] h-[166px] opacity-50" src="/images/habit-builder/mask-group0.svg" alt="" />
      
      {/* Cloud elements */}
      <div className="absolute left-[15px] top-[638px]">
        <div className="relative">
          <div className="absolute left-[0px] top-[0px] w-[58.57px] h-[58.57px] rounded-full bg-[#FFDFC1]"></div>
          <div className="absolute left-[44px] top-[13px] w-[45.65px] h-[45.65px] rounded-full bg-[#FFDFC1]"></div>
          <div className="absolute left-[-28px] top-[13px] w-[45.65px] h-[45.65px] rounded-full bg-[#FFDFC1]"></div>
          <div className="absolute left-[-6px] top-[22px] w-[73.21px] h-[36.18px] bg-[#FFDFC1]"></div>
        </div>
        <img className="absolute left-[-28px] top-[-1px] w-[117.14px] h-[58.57px]" src="/images/habit-builder/mask-group1.svg" alt="" />
      </div>
      
      <img className="absolute left-[297px] top-[488px] w-[188px] h-[76.47px]" src="/images/habit-builder/cloud1.svg" alt="" />
      
      <div className="absolute left-[302px] top-[772px]">
        <div className="relative">
          <div className="absolute left-[17px] top-[0.5px] w-[34.49px] h-[34.49px] rounded-full bg-[#FFDFC1]"></div>
          <div className="absolute left-[43px] top-[8px] w-[26.88px] h-[26.88px] rounded-full bg-[#FFDFC1]"></div>
          <div className="absolute left-[0px] top-[8px] w-[26.88px] h-[26.88px] rounded-full bg-[#FFDFC1]"></div>
          <div className="absolute left-[13px] top-[14px] w-[43.12px] h-[21.3px] bg-[#FFDFC1]"></div>
        </div>
        <img className="absolute left-[0px] top-[0px] w-[68.99px] h-[34.49px]" src="/images/habit-builder/mask-group2.svg" alt="" />
      </div>
      
      {/* Courses */}
      <div className="absolute left-[20px] top-[344px] w-[374px] h-[560px]">
        {/* Course 1 */}
        <img className="absolute left-[0px] top-[1px] w-[374px] h-[273px]" src="/images/habit-builder/background1.svg" alt="" />
        <img className="absolute left-[0px] top-[0px] w-[374px] h-[166px]" src="/images/habit-builder/mask-group3.svg" alt="" />
        
        <div className="absolute left-[12px] top-[178px] w-[340px]">
          <div className="text-[#573353] font-['Manrope-Bold'] text-[18px] leading-[25px] tracking-[-0.03em] font-bold">
            30 Day Journal Challenge - Establish a Habit of Daily Journaling
          </div>
          <div className="absolute left-[0%] top-[62.79%] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium">
            2h 41m
          </div>
          <div className="absolute left-[0%] top-[83.72%] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium opacity-50">
            37 Lessons
          </div>
        </div>
        
        <img className="absolute left-[318px] top-[232px] w-[32px] h-[32px]" src="/images/habit-builder/share-post0.svg" alt="" />
        
        {/* Course 2 */}
        <img className="absolute left-[0px] top-[287px] w-[374px] h-[273px]" src="/images/habit-builder/background2.svg" alt="" />
        <img className="absolute left-[0px] top-[286px] w-[374px] h-[166px]" src="/images/habit-builder/mask-group4.svg" alt="" />
        
        <div className="absolute left-[12px] top-[464px] w-[340px]">
          <div className="text-[#573353] font-['Manrope-Bold'] text-[18px] leading-[25px] tracking-[-0.03em] font-bold">
            Self Help Series: How to Create and Maintain Good Habits
          </div>
          <div className="absolute left-[0%] top-[62.79%] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium">
            4h 6m
          </div>
          <div className="absolute left-[0%] top-[83.72%] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium opacity-50">
            24 Lessons
          </div>
        </div>
        
        <img className="absolute left-[330px] top-[518px] w-[32px] h-[32px]" src="/images/habit-builder/share-post1.svg" alt="" />
      </div>
      
      {/* Filter */}
      <div className="absolute left-[284px] top-[295px] w-[110px] h-[33px]">
        <div className="absolute left-[0px] top-[0px] right-[0px] bottom-[0px] bg-white rounded-[12px] border border-[rgba(87,51,83,0.1)]"></div>
        <div className="absolute left-[16px] top-[10px] text-[#FC9D45] font-['Manrope-Medium'] text-[14px] leading-[13px] tracking-[-0.03em] font-medium">
          Filters
        </div>
        <img className="absolute left-[84px] top-[15px] w-[10px] h-[4px]" src="/images/habit-builder/vector-1250.svg" alt="" />
      </div>
      
      {/* Sort */}
      <div className="absolute left-[80px] top-[295px] w-[183px] h-[33px]">
        <div className="absolute left-[0px] top-[0px] right-[0px] bottom-[0px] bg-white rounded-[12px] border border-[rgba(87,51,83,0.1)]"></div>
        <div className="absolute left-[20px] top-[10px] text-[#573353] font-['Manrope-Medium'] text-[14px] leading-[13px] tracking-[-0.03em] font-medium">
          Popular
        </div>
        <img className="absolute left-[155px] top-[15px] w-[10px] h-[4px]" src="/images/habit-builder/vector-1251.svg" alt="" />
      </div>
      
      <div className="absolute left-[20px] top-[304px] text-[#573353] font-['Manrope-Medium'] text-[16px] leading-[16px] tracking-[-0.03em] font-medium">
        Sort By:
      </div>
      
      {/* Title */}
      <div className="absolute left-[162px] top-[45px] w-[91px] h-[32px]">
        <div className="absolute left-[10px] top-[0px] right-[11px] bottom-[0px] text-[#573353] text-center font-['Manrope-Bold'] text-[18px] leading-[32px] tracking-[-0.03em] font-bold">
          Courses
        </div>
      </div>
      
      {/* Header */}
      <div className="absolute left-[20px] top-[125px] w-[374px] h-[146px]">
        <img className="absolute left-[0px] top-[0px] right-[0px] bottom-[0px] w-full h-full" src="/images/habit-builder/mask-group5.svg" alt="" />
        <div className="absolute left-[25px] top-[87px] right-[137px] bottom-[23px] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[18px] tracking-[-0.03em] font-medium">
          Find what fascinates you as you explore these habit courses.
        </div>
        <div className="absolute left-[25px] top-[22px] w-[144px] h-[61px]">
          <div className="absolute left-[0px] top-[0px] right-[0px] bottom-[-3px] text-[#573353] font-['Klasik-Regular'] text-[36px] leading-[32px] tracking-[-0.03em] font-normal uppercase">
            Habit courses
          </div>
        </div>
      </div>
      
      {/* Icons */}
      <div className="absolute left-[10px] top-[28px] w-[64px] h-[65px] overflow-hidden">
        <div className="absolute left-[15.62%] top-[16.92%] right-[15.62%] bottom-[15.38%] bg-[#573353] rounded-[25px] opacity-10"></div>
        <img className="absolute left-[10px] top-[11px] w-[44px] h-[44px]" src="/images/habit-builder/hamburger-menu0.svg" alt="" />
      </div>
      
      <div className="absolute left-[333px] top-[28px] w-[64px] h-[65px] overflow-hidden">
        <div className="absolute left-[15.62%] top-[16.92%] right-[15.62%] bottom-[15.38%] bg-[#573353] rounded-[25px] opacity-10"></div>
        <div className="absolute left-[10px] top-[11px] w-[44px] h-[44px]">
          <div className="absolute left-[11px] top-[11px] w-[22px] h-[22px] overflow-hidden">
            <img className="absolute left-[0px] top-[0px]" src="/images/habit-builder/group0.svg" alt="" />
            <img className="absolute left-[15.08px] top-[15.08px]" src="/images/habit-builder/group1.svg" alt="" />
          </div>
        </div>
      </div>
      
      {/* Bottom Menu */}
      <div className="absolute left-[0px] top-[907px] w-[414px] h-[124px]">
        <img className="absolute left-[0px] top-[44px] right-[0px] bottom-[0px] w-full h-[64.52%]" src="/images/habit-builder/menu1.svg" alt="" />
        <img className="absolute left-[42.27%] top-[0px] right-[42.27%] bottom-[48.39%] w-[15.46%] h-[51.61%]" src="/images/habit-builder/plus-button0.svg" alt="" />
      </div>
    </div>
  )
}
