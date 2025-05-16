"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Filter, ChevronLeft, Home, BookOpen, BarChart2, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CourseService } from "@/lib/services/course-service"
import { Course, CourseSortOption } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"
import { CourseCard } from "@/components/courses/course-card"

export default function HabitCoursesPage() {
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
    <div className="min-h-screen bg-[#FFF3E9]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-[#573353]"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-[#573353] text-lg font-medium">Courses</h1>
        </div>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {/* Hero Section */}
      <div className="px-4 mb-6">
        <div className="relative h-48 rounded-3xl overflow-hidden">
          <Image
            src="/images/courses/habit-courses-hero.jpg"
            alt="Habit Courses"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDA758]/80 to-[#FE9870]/80 flex flex-col justify-center p-6">
            <h2 className="text-white text-2xl font-bold mb-2">HABIT COURSES</h2>
            <p className="text-white text-sm opacity-90 max-w-[70%]">
              Find the best courses to improve your daily habits and life
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 mb-6">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#573353]/50" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-none rounded-xl"
            />
          </div>
          
          <div className="w-32">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="bg-white border-none rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="a-z">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="icon" className="bg-white border-none rounded-xl">
            <Filter className="h-4 w-4 text-[#573353]" />
          </Button>
        </div>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="px-4 pb-24 grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-10 text-center">
          <BookOpen className="h-12 w-12 text-[#573353]/30 mx-auto mb-4" />
          <h3 className="text-[#573353] font-medium mb-2">No courses found</h3>
          <p className="text-[#573353]/70 text-sm">
            {searchTerm ? "Try a different search term" : "Check back later for new courses"}
          </p>
        </div>
      )}

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
