"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CommunityService } from "@/lib/services/community-service"
import { toast } from "@/components/ui/use-toast"

interface CreatePostProps {
  onPostCreated?: () => void
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image should be less than 5MB",
        variant: "destructive"
      })
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive"
      })
      return
    }

    if (!content.trim() && !imageFile) {
      toast({
        title: "Empty post",
        description: "Please add some text or an image",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, you would upload the image to storage first
      // and then use the returned URL in the post
      let imageUrl = null
      if (imageFile) {
        // This is a placeholder for actual image upload
        // imageUrl = await uploadImage(imageFile)
        imageUrl = imagePreview // For demo purposes only
      }

      const { data, error } = await CommunityService.createPost({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl
      })

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Post created",
        description: "Your post has been published successfully"
      })

      // Reset form
      setContent("")
      removeImage()

      // Notify parent component
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10 border border-[#FDA758]/20">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url || ""} 
              alt={user?.user_metadata?.full_name || "User"} 
            />
            <AvatarFallback className="bg-[#FDA758]/20 text-[#573353]">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] border-none focus-visible:ring-0 p-0 text-[#573353] placeholder:text-[#573353]/50 resize-none"
            />
            
            {imagePreview && (
              <div className="relative mt-3 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Post image preview"
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover max-h-[200px]"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-0 border-t border-gray-100">
        <div className="flex justify-between items-center w-full p-2">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-[#573353]/70"
              onClick={handleImageClick}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>Image</span>
            </Button>
          </div>
          
          <Button
            className="bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageFile)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
