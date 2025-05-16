"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MoreHorizontal } from "lucide-react"
import { CommunityComment } from "@/lib/types/community"

interface CommentCardProps {
  comment: CommunityComment
  onLike: (commentId: string) => void
  isLiked?: boolean
}

export function CommentCard({ comment, onLike, isLiked = false }: CommentCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(comment.likes_count)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
    onLike(comment.id)
  }

  return (
    <div className="flex space-x-3 p-3 rounded-lg bg-[#FFF3E9]/50">
      <Avatar className="h-8 w-8 border border-[#FDA758]/20">
        <AvatarImage 
          src={comment.user?.avatar_url || ""} 
          alt={comment.user?.full_name || "User"} 
        />
        <AvatarFallback className="bg-[#FDA758]/20 text-[#573353] text-xs">
          {comment.user?.full_name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-sm text-[#573353]">
              {comment.user?.full_name || "Anonymous"}
            </div>
            <p className="text-sm text-[#573353]">{comment.content}</p>
          </div>
          
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#573353]/60 hover:text-[#573353]">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center mt-1 space-x-3">
          <div className="text-xs text-[#573353]/60">
            {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { 
              addSuffix: true,
              locale: es 
            })}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 px-1 text-xs ${liked ? "text-[#FDA758]" : "text-[#573353]/60"}`}
            onClick={handleLike}
          >
            <ThumbsUp className="h-3 w-3 mr-1" fill={liked ? "currentColor" : "none"} />
            <span>{likesCount > 0 ? likesCount : "Like"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
