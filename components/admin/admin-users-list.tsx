"use client"

import { useState } from "react"
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Dumbbell, Utensils, Shield, CheckCircle, XCircle,
  Eye, Edit, Trash, MoreHorizontal
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserWithDetails } from "@/lib/admin-dashboard-service"

interface AdminUsersListProps {
  users: UserWithDetails[]
  totalUsers: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (value: string) => void
  onSearch: () => void
  onPageChange: (page: number) => void
  isLoading: boolean
}

export function AdminUsersList({
  users,
  totalUsers,
  currentPage,
  searchTerm,
  setSearchTerm,
  onSearch,
  onPageChange,
  isLoading
}: AdminUsersListProps) {
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [verificationFilter, setVerificationFilter] = useState<string>("all")
  
  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalUsers / 10)
  
  // Aplicar filtros locales
  const filteredUsers = users.filter(user => {
    // Filtrar por rol
    if (roleFilter === "admin" && !user.isAdmin) return false
    if (roleFilter === "trainer" && !user.isTrainer) return false
    if (roleFilter === "nutritionist" && !user.isNutritionist) return false
    if (roleFilter === "client" && (user.isAdmin || user.isTrainer || user.isNutritionist)) return false
    
    // Filtrar por verificación
    if (verificationFilter === "verified" && !user.isVerified) return false
    if (verificationFilter === "unverified" && user.isVerified) return false
    
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuarios..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch()
                }
              }}
            />
          </div>
          <Button3D onClick={onSearch} disabled={isLoading}>
            Buscar
          </Button3D>
        </div>
        
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="trainer">Entrenadores</SelectItem>
              <SelectItem value="nutritionist">Nutricionistas</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Verificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="verified">Verificados</SelectItem>
              <SelectItem value="unverified">No verificados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card3D>
        <Card3DHeader>
          <div className="flex items-center justify-between">
            <Card3DTitle>Usuarios ({totalUsers})</Card3DTitle>
            <Badge variant="outline">{filteredUsers.length} mostrados</Badge>
          </div>
        </Card3DHeader>
        <Card3DContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.fullName}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {user.isAdmin && (
                            <Badge variant="default" className="bg-red-500">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.isTrainer && (
                            <Badge variant="default" className="bg-green-500">
                              <Dumbbell className="h-3 w-3 mr-1" />
                              Entrenador
                              {user.isVerified && <CheckCircle className="h-3 w-3 ml-1" />}
                            </Badge>
                          )}
                          {user.isNutritionist && (
                            <Badge variant="default" className="bg-purple-500">
                              <Utensils className="h-3 w-3 mr-1" />
                              Nutricionista
                              {user.isVerified && <CheckCircle className="h-3 w-3 ml-1" />}
                            </Badge>
                          )}
                          {!user.isAdmin && !user.isTrainer && !user.isNutritionist && (
                            <Badge variant="outline">
                              Cliente
                            </Badge>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button3D variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button3D>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar usuario
                            </DropdownMenuItem>
                            {(user.isTrainer || user.isNutritionist) && !user.isVerified && (
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verificar perfil
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Trash className="h-4 w-4 mr-2" />
                              Eliminar usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Registrado: {new Date(user.createdAt).toLocaleDateString()}</p>
                      {user.lastSignIn && (
                        <p>Último acceso: {new Date(user.lastSignIn).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalUsers)} de {totalUsers}
              </div>
              <div className="flex space-x-2">
                <Button3D
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button3D>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Mostrar páginas alrededor de la página actual
                    let pageToShow = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageToShow = currentPage - 2 + i;
                      }
                      if (currentPage > totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      }
                    }
                    
                    return (
                      <Button3D
                        key={i}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageToShow)}
                        disabled={isLoading}
                      >
                        {pageToShow}
                      </Button3D>
                    );
                  })}
                </div>
                <Button3D
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button3D>
              </div>
            </div>
          )}
        </Card3DContent>
      </Card3D>
    </div>
  )
}
