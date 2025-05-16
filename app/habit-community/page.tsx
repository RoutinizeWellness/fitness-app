"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Home, BookOpen, BarChart2, User, Plus, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CommunityService } from "@/lib/services/community-service"
import { CommunityPost, CommunityPostSortOption } from "@/lib/types/community"
import { toast } from "@/components/ui/use-toast"
import { PostCard } from "@/components/community/post-card"
import { CreatePost } from "@/components/community/create-post"

export default function HabitCommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [sortBy, setSortBy] = useState<CommunityPostSortOption>("newest")
  const [activeTab, setActiveTab] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        
        // Apply filters based on active tab
        const filters = activeTab === "following" 
          ? { user_id: user?.id } // This is a simplified approach
          : undefined
        
        const { data, count, error } = await CommunityService.getPosts(1, 10, sortBy, filters)
        
        if (error) {
          console.error("Error loading posts:", error)
          toast({
            title: "Error",
            description: "Failed to load community posts. Please try again.",
            variant: "destructive"
          })
          setPosts([])
        } else {
          setPosts(data || [])
          setHasMore((data?.length || 0) < (count || 0))
        }
      } catch (error) {
        console.error("Error loading posts:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        })
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
    // Reset page when tab or sort changes
    setPage(1)
  }, [user, sortBy, activeTab])

  // Load more posts
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return
    
    try {
      setIsLoadingMore(true)
      const nextPage = page + 1
      
      // Apply filters based on active tab
      const filters = activeTab === "following" 
        ? { user_id: user?.id } // This is a simplified approach
        : undefined
      
      const { data, count, error } = await CommunityService.getPosts(nextPage, 10, sortBy, filters)
      
      if (error) {
        console.error("Error loading more posts:", error)
        toast({
          title: "Error",
          description: "Failed to load more posts. Please try again.",
          variant: "destructive"
        })
      } else if (data && data.length > 0) {
        setPosts(prev => [...prev, ...data])
        setPage(nextPage)
        setHasMore((prev => prev.length + data.length) < (count || 0))
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more posts:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle post actions
  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive"
      })
      return
    }

    try {
      const { success, error } = await CommunityService.likePost(user.id, postId)
      
      if (error) {
        console.error("Error liking post:", error)
        toast({
          title: "Error",
          description: "Failed to like post. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = (postId: string) => {
    router.push(`/habit-community/posts/${postId}`)
  }

  const handleShare = (postId: string) => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share",
      description: "Sharing functionality is not implemented in this demo"
    })
  }

  const handlePostCreated = () => {
    // Reload posts after a new post is created
    setActiveTab("all")
    setSortBy("newest")
    setPage(1)
    setIsLoading(true)
    
    CommunityService.getPosts(1, 10, "newest")
      .then(({ data, count, error }) => {
        if (error) {
          console.error("Error reloading posts:", error)
        } else {
          setPosts(data || [])
          setHasMore((data?.length || 0) < (count || 0))
        }
      })
      .catch(error => {
        console.error("Error reloading posts:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-[#573353] text-lg font-medium">Community</h1>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-[#573353]"
          onClick={() => router.push("/habit-community/create")}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="all" 
              className="flex-1 rounded-lg data-[state=active]:bg-[#FDA758] data-[state=active]:text-white text-[#573353]"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="flex-1 rounded-lg data-[state=active]:bg-[#FDA758] data-[state=active]:text-white text-[#573353]"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Sort and Filter */}
      <div className="px-4 mb-4 flex justify-between">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-white border-none rounded-xl ${sortBy === 'newest' ? 'text-[#FDA758]' : 'text-[#573353]'}`}
            onClick={() => setSortBy('newest')}
          >
            Newest
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-white border-none rounded-xl ${sortBy === 'popular' ? 'text-[#FDA758]' : 'text-[#573353]'}`}
            onClick={() => setSortBy('popular')}
          >
            Popular
          </Button>
        </div>
        
        <Button variant="outline" size="sm" className="bg-white border-none rounded-xl text-[#573353]">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Create Post */}
      <div className="px-4 mb-4">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
        </div>
      ) : posts.length > 0 ? (
        <div className="px-4 pb-24 space-y-4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))}
          
          {hasMore && (
            <div className="flex justify-center pt-2 pb-6">
              <Button 
                variant="outline" 
                onClick={loadMorePosts}
                disabled={isLoadingMore}
                className="bg-white border-none text-[#573353]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-10 text-center">
          <User className="h-12 w-12 text-[#573353]/30 mx-auto mb-4" />
          <h3 className="text-[#573353] font-medium mb-2">No posts found</h3>
          <p className="text-[#573353]/70 text-sm">
            {activeTab === "following" 
              ? "Follow more people to see their posts here" 
              : "Be the first to post in the community"}
          </p>
          <Button 
            className="mt-4 bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
            onClick={() => router.push("/habit-community/create")}
          >
            Create Post
          </Button>
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
            <BookOpen className="h-5 w-5 text-[#573353]/70" />
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Courses</span>
        </Link>
        
        <Link href="/habit-community" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 9C17 12.87 13.64 16 9.5 16L8.57001 17.12L8.02 17.78C7.55 18.34 6.65 18.22 6.34 17.55L5 14.6C3.18 13.32 2 11.29 2 9C2 4.58 5.8 1 10.5 1C15.2 1 19 4.58 19 9" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 12.86C22 16.3 19.36 19.05 16 19.05L15.24 19.97C14.87 20.42 14.14 20.32 13.91 19.77L12.97 17.48C11.46 16.45 10.59 14.83 10.59 12.86C10.59 9.26 13.6 6.32 17.3 6.32C21 6.32 24 9.26 24 12.86" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#FDA758] mt-1">Community</span>
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
