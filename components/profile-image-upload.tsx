"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { uploadProfileImage, getPublicUrl } from "@/lib/supabase-storage"
import { updateUserProfile } from "@/lib/supabase-queries"
import { Loader2, Upload } from "lucide-react"

export default function ProfileImageUpload() {
  const { user, profile, refreshProfile } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null)
      setPreview(null)
      return
    }

    const selectedFile = e.target.files[0]
    setFile(selectedFile)

    // Crear URL de vista previa
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    // Limpiar URL de vista previa al desmontar
    return () => URL.revokeObjectURL(objectUrl)
  }

  // Manejar subida de imagen
  const handleUpload = async () => {
    if (!user || !file) return

    try {
      setUploading(true)

      // Subir imagen a Supabase Storage
      const { data: fileUrl, error: uploadError } = await uploadProfileImage(user.id, file)

      if (uploadError) {
        throw uploadError
      }

      if (!fileUrl) {
        throw new Error("No se pudo obtener la URL de la imagen")
      }

      // Actualizar perfil con la nueva URL de avatar
      const { error: updateError } = await updateUserProfile(user.id, {
        avatar_url: fileUrl,
      })

      if (updateError) {
        throw updateError
      }

      // Refrescar perfil
      await refreshProfile()

      toast({
        title: "Imagen de perfil actualizada",
        description: "Tu imagen de perfil se ha actualizado correctamente.",
      })

      // Limpiar estado
      setFile(null)
      setPreview(null)
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imagen de perfil</CardTitle>
          <CardDescription>Inicia sesión para gestionar tu imagen de perfil</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagen de perfil</CardTitle>
        <CardDescription>Sube una imagen para personalizar tu perfil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={preview || (profile?.avatar_url ? getPublicUrl("profile-images", profile.avatar_url) : undefined)}
              alt={profile?.full_name || "Usuario"}
            />
            <AvatarFallback className="text-2xl">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">
            Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 2MB.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir imagen
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
