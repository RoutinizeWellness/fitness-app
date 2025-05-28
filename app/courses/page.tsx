"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Menu, Search, Filter } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { getCourses } from "@/lib/supabase-courses"
import { Course, CourseSortOption, CourseFilters } from "@/lib/types/courses"
import { toast } from "@/components/ui/use-toast"
import { CourseCard } from "@/components/courses/course-card"

export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Redirect to the new course overview page
  useEffect(() => {
    router.push("/courses/overview")
  }, [router])

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<CourseSortOption>("popular")
  const [filters, setFilters] = useState<CourseFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getCourses(sortBy, filters, user?.id)
        if (error) throw error
        setCourses(data || [])
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [sortBy, filters, user?.id])

  // Filter courses by search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value as CourseSortOption)
  }

  // Render course grid
  const renderCourseGrid = () => (
    <div className="grid grid-cols-1 gap-4">
      {filteredCourses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] overflow-hidden mx-auto relative flex items-center justify-center">
      <div className="animate-pulse text-[#573353]">Redirecting to courses...</div>
    </div>
  )
}
