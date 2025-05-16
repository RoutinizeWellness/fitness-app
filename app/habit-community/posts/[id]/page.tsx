"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Loader2, ChevronLeft, Send, Home, BookOpen, BarChart2, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CommunityService } from "@/lib/services/community-service"
import { CommunityPost, CommunityComment } from "@/lib/types/community"
import { toast } from "@/components/ui/use-toast"
import { PostCard } from "@/components/community/post-card"
import { CommentCard } from "@/components/community/comment-card"

interface PostDetailPageProps {
  params: {
    id: string
  }
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState<CommunityPost | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

  // Load post details
  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await CommunityService.getPostById(params.id)
        
        if (error) {
          console.error("Error loading post:", error)
          toast({
            title: "Error",
            description: "Failed to load post details. Please try again.",
            variant: "destructive"
          })
          setPost(null)
        } else if (data) {
          setPost(data)
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error("Error loading post:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        })
        setPost(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [params.id])

  // Handle like post
  const handleLikePost = async (postId: string) => {
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

  // Handle like comment
  const handleLikeComment = (commentId: string) => {
    // In a real app, this would call an API to like the comment
    toast({
      title: "Like",
      description: "Comment like functionality is not implemented in this demo"
    })
  }

  // Handle share post
  const handleSharePost = (postId: string) => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share",
      description: "Sharing functionality is not implemented in this demo"
    })
  }

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive"
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await CommunityService.addComment({
        user_id: user.id,
        post_id: params.id,
        content: newComment.trim()
      })

      if (error) {
        throw new Error(error.message)
      }

      // Add the new comment to the list
      if (data) {
        setComments(prev => [...prev, data])
        
        // Update post comments count
        if (post) {
          setPost({
            ...post,
            comments_count: (post.comments_count || 0) + 1
          })
        }
      }

      // Clear the input
      setNewComment("")
      
      // Focus the input for another comment
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FFF3E9] flex flex-col items-center justify-center p-4">
        <User className="h-16 w-16 text-[#573353]/30 mb-4" />
        <h2 className="text-[#573353] text-xl font-medium mb-2">Post not found</h2>
        <p className="text-[#573353]/70 text-center mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          onClick={() => router.push("/habit-community")}
          className="bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
        >
          Back to Community
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
        <h1 className="text-[#573353] text-lg font-medium">Post</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {/* Post */}
      <div className="px-4 mb-4">
        <PostCard 
          post={post} 
          onLike={handleLikePost}
          onComment={() => {}}
          onShare={handleSharePost}
        />
      </div>

      {/* Comments Section */}
      <div className="px-4 mb-20">
        <h2 className="text-[#573353] font-medium mb-4">
          {comments.length > 0 
            ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` 
            : 'Comments'}
        </h2>
        
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                onLike={handleLikeComment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl">
            <User className="h-12 w-12 text-[#573353]/30 mx-auto mb-4" />
            <p className="text-[#573353]/70">No comments yet</p>
            <p className="text-[#573353]/70 text-sm mt-1">Be the first to comment</p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border border-[#FDA758]/20">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url || ""} 
              alt={user?.user_metadata?.full_name || "User"} 
            />
            <AvatarFallback className="bg-[#FDA758]/20 text-[#573353] text-xs">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <Input
            ref={commentInputRef}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-[#FFF3E9]/50 border-none rounded-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmitComment()
              }
            }}
          />
          
          <Button
            size="icon"
            className={`rounded-full ${
              newComment.trim() 
                ? 'bg-[#FDA758] hover:bg-[#FDA758]/90 text-white' 
                : 'bg-[#FDA758]/20 text-[#573353]/50'
            }`}
            disabled={isSubmitting || !newComment.trim()}
            onClick={handleSubmitComment}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
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
