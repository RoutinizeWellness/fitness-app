"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle, XCircle, Dumbbell, Utensils,
  Shield, Eye, Clock, Filter, Search,
  Award, Calendar, BadgeCheck, AlertCircle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { updateProfessionalVerification } from "@/lib/admin-dashboard-service"
import { supabase } from "@/lib/supabase-client"

// Tipo para solicitud de verificación
interface VerificationRequest {
  id: string
  userId: string
  fullName: string
  email: string
  avatarUrl?: string
  professionalType: 'trainer' | 'nutritionist'
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  processedAt?: string
  processedBy?: string
  notes?: string
  documents?: {
    title: string
    url: string
    type: string
  }[]
  profile?: {
    specialties: string[]
    experienceYears: number
    certifications?: string[]
    bio?: string
  }
}

export function AdminProfessionalVerification() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  // Cargar solicitudes de verificación
  useEffect(() => {
    loadVerificationRequests()
  }, [activeTab])

  const loadVerificationRequests = async () => {
    setIsLoading(true)
    try {
      // Consultar solicitudes de verificación
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:profiles(full_name, avatar_url),
          auth_users:auth.users(email)
        `)
        .eq('status', activeTab)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      // Obtener perfiles profesionales para cada solicitud
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const table = request.professional_type === 'trainer' ? 'trainer_profiles' : 'nutritionist_profiles'

          const { data: profileData, error: profileError } = await supabase
            .from(table)
            .select('*')
            .eq('user_id', request.user_id)
            .single()

          return {
            id: request.id,
            userId: request.user_id,
            fullName: request.profiles?.full_name || 'Usuario sin nombre',
            email: request.auth_users?.email || '',
            avatarUrl: request.profiles?.avatar_url,
            professionalType: request.professional_type,
            status: request.status,
            submittedAt: request.submitted_at,
            processedAt: request.processed_at,
            processedBy: request.processed_by,
            notes: request.notes,
            documents: request.documents,
            profile: profileData ? {
              specialties: profileData.specialties,
              experienceYears: profileData.experience_years,
              certifications: profileData.certifications,
              bio: profileData.bio
            } : undefined
          }
        })
      )

      setRequests(requestsWithProfiles)
    } catch (error) {
      console.error("Error al cargar solicitudes de verificación:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de verificación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar solicitudes por término de búsqueda
  const filteredRequests = requests.filter(request =>
    request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar verificación de profesional
  const handleVerification = async (userId: string, professionalType: 'trainer' | 'nutritionist', isVerified: boolean) => {
    try {
      const { data, error } = await updateProfessionalVerification(userId, professionalType, isVerified)

      if (error) throw error

      // Actualizar el estado de la solicitud
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status: isVerified ? 'approved' : 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: reviewNotes
        })
        .eq('user_id', userId)
        .eq('professional_type', professionalType)

      if (updateError) throw updateError

      // Crear notificación para el usuario
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: isVerified ? 'verification_approved' : 'verification_rejected',
          title: isVerified ? 'Verificación aprobada' : 'Verificación rechazada',
          content: isVerified
            ? 'Tu perfil profesional ha sido verificado. Ahora puedes comenzar a trabajar con clientes.'
            : `Tu solicitud de verificación ha sido rechazada. ${reviewNotes}`,
          is_read: false,
          created_at: new Date().toISOString()
        }])

      if (notificationError) {
        console.error("Error al crear notificación:", notificationError)
      }

      toast({
        title: isVerified ? "Perfil verificado" : "Perfil rechazado",
        description: isVerified
          ? "El perfil profesional ha sido verificado correctamente"
          : "El perfil profesional ha sido rechazado",
      })

      // Recargar solicitudes
      loadVerificationRequests()
      setShowReviewDialog(false)
      setReviewNotes("")
    } catch (error) {
      console.error("Error al verificar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud de verificación",
        variant: "destructive",
      })
    }
  }

  // Abrir diálogo de revisión
  const openReviewDialog = (request: VerificationRequest) => {
    setSelectedRequest(request)
    setReviewNotes("")
    setShowReviewDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar profesionales..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobados
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Rechazados
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card3D>
        <Card3DHeader>
          <div className="flex items-center justify-between">
            <Card3DTitle>Solicitudes de verificación</Card3DTitle>
            <Badge variant="outline">{filteredRequests.length} solicitudes</Badge>
          </div>
        </Card3DHeader>
        <Card3DContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando solicitudes...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={request.avatarUrl || undefined} />
                          <AvatarFallback>{request.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.fullName}</h3>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500 mr-2">{request.email}</p>
                            <Badge variant={request.professionalType === 'trainer' ? 'default' : 'secondary'}>
                              {request.professionalType === 'trainer' ? (
                                <Dumbbell className="h-3 w-3 mr-1" />
                              ) : (
                                <Utensils className="h-3 w-3 mr-1" />
                              )}
                              {request.professionalType === 'trainer' ? 'Entrenador' : 'Nutricionista'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button3D
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewDialog(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button3D>

                        {activeTab === 'pending' && (
                          <>
                            <Button3D
                              variant="default"
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => openReviewDialog(request)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button3D>
                            <Button3D
                              variant="destructive"
                              size="sm"
                              onClick={() => openReviewDialog(request)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button3D>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <p>Solicitud enviada: {new Date(request.submittedAt).toLocaleDateString()}</p>
                      {request.processedAt && (
                        <p>Procesada: {new Date(request.processedAt).toLocaleDateString()}</p>
                      )}
                      {request.profile && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {request.profile.experienceYears} años de experiencia
                          </Badge>
                          {request.profile.certifications?.slice(0, 2).map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                          {(request.profile.certifications?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(request.profile.certifications?.length || 0) - 2} más
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay solicitudes {activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}</p>
            </div>
          )}
        </Card3DContent>
      </Card3D>

      {/* Diálogo de revisión */}
      {showReviewDialog && selectedRequest && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Revisar solicitud de verificación</DialogTitle>
              <DialogDescription>
                Revisa la información del profesional antes de aprobar o rechazar su solicitud.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={selectedRequest.avatarUrl || undefined} />
                  <AvatarFallback>{selectedRequest.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedRequest.fullName}</h3>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 mr-2">{selectedRequest.email}</p>
                    <Badge variant={selectedRequest.professionalType === 'trainer' ? 'default' : 'secondary'}>
                      {selectedRequest.professionalType === 'trainer' ? (
                        <Dumbbell className="h-3 w-3 mr-1" />
                      ) : (
                        <Utensils className="h-3 w-3 mr-1" />
                      )}
                      {selectedRequest.professionalType === 'trainer' ? 'Entrenador' : 'Nutricionista'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedRequest.profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card3D>
                    <Card3DHeader>
                      <Card3DTitle>Información profesional</Card3DTitle>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Experiencia</p>
                          <p className="text-sm">{selectedRequest.profile.experienceYears} años</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Especialidades</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRequest.profile.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedRequest.profile.certifications && selectedRequest.profile.certifications.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Certificaciones</p>
                            <div className="space-y-1 mt-1">
                              {selectedRequest.profile.certifications.map((cert, index) => (
                                <div key={index} className="flex items-center">
                                  <Award className="h-4 w-4 mr-2 text-amber-500" />
                                  <span className="text-sm">{cert}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card3DContent>
                  </Card3D>

                  <Card3D>
                    <Card3DHeader>
                      <Card3DTitle>Biografía</Card3DTitle>
                    </Card3DHeader>
                    <Card3DContent>
                      <p className="text-sm">
                        {selectedRequest.profile.bio || "No hay biografía disponible"}
                      </p>
                    </Card3DContent>
                  </Card3D>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notas de revisión</label>
                <Textarea
                  placeholder="Añade notas sobre esta solicitud (opcional para aprobación, requerido para rechazo)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button3D variant="outline">
                  Cancelar
                </Button3D>
              </DialogClose>
              <Button3D
                variant="destructive"
                onClick={() => handleVerification(
                  selectedRequest.userId,
                  selectedRequest.professionalType,
                  false
                )}
                disabled={activeTab !== 'pending' || (reviewNotes.trim() === '')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button3D>
              <Button3D
                variant="default"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleVerification(
                  selectedRequest.userId,
                  selectedRequest.professionalType,
                  true
                )}
                disabled={activeTab !== 'pending'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar
              </Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
