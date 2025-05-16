"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageSquare, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { CommunityActivity } from "@/lib/supabase"

interface PostCardProps {
  post: CommunityActivity
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  
  // Renderizar tiempo relativo
  const renderRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } catch (error) {
      return "hace un momento"
    }
  }

  // Manejar like
  const handleLike = () => {
    setLiked(!liked)
    if (onLike) {
      onLike(post.id)
    }
  }

  // Manejar comentario
  const handleComment = () => {
    if (onComment) {
      onComment(post.id)
    }
  }

  // Manejar compartir
  const handleShare = () => {
    if (onShare) {
      onShare(post.id)
    }
  }

  return (
    <Card className="p-4 rounded-xl bg-white shadow-sm">
      <div className="flex items-start space-x-3">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url || ""} />
          <AvatarFallback>{post.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-[#573353]">{post.profiles?.full_name || "Usuario"}</p>
            <p className="text-xs text-[#573353] opacity-50">{renderRelativeTime(post.created_at)}</p>
          </div>
          <p className="text-sm text-[#573353] mb-3">{post.content}</p>
          <div className="flex items-center space-x-4">
            <button 
              className={`flex items-center ${liked ? 'text-[#FDA758]' : 'text-[#573353]'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-[#FDA758] text-[#FDA758]' : ''}`} />
              <span className="text-xs">{post.likes_count || 0}</span>
            </button>
            <button 
              className="flex items-center text-[#573353] opacity-50"
              onClick={handleComment}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">{post.comments_count || 0}</span>
            </button>
            <button 
              className="flex items-center text-[#573353] opacity-50"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
