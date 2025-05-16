"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Calendar, CreditCard, Clock, Shield, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface MembershipCardProps {
  className?: string
  membershipType?: "premium" | "basic" | "free"
  nextPaymentDate?: string
  amountSaved?: number
  onManage?: () => void
}

export function MembershipCard({
  className,
  membershipType = "basic",
  nextPaymentDate = "02/04/2025",
  amountSaved = 4.17,
  onManage
}: MembershipCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleManage = () => {
    if (onManage) {
      onManage()
    } else {
      router.push("/membership")
    }
  }

  const handleKeepMembership = () => {
    setShowCancelDialog(false)
    toast({
      title: "Membresía mantenida",
      description: "Gracias por continuar con nosotros",
    })
  }

  const handleCancelMembership = () => {
    setShowCancelDialog(false)
    toast({
      title: "Membresía cancelada",
      description: "Tu membresía permanecerá activa hasta el final del período de facturación",
      variant: "destructive"
    })
  }

  return (
    <>
      <Card organic={true} hover={true} className={`overflow-hidden ${className}`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center">
              <Badge
                className={
                  membershipType === "premium" ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white" :
                  membershipType === "basic" ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" :
                  "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                }
              >
                {membershipType === "premium" ? "PREMIUM" :
                 membershipType === "basic" ? "BASIC" : "FREE"}
              </Badge>
              <span className="ml-2 font-medium">Routinize+</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleManage}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-5">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Próximo pago: {nextPaymentDate}</span>
            </div>

            {membershipType !== "free" && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm rounded-full"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancelar membresía
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              ¿Cancelar Routinize+?
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/cancel-membership.png"
                alt="Cancel Membership"
                width={200}
                height={150}
                className="object-contain"
                onError={(e) => {
                  // Fallback si la imagen no existe
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/200x150?text=Calendar";
                }}
              />
            </div>

            <p className="text-center mb-4">
              Ya has ahorrado <span className="font-bold">€{amountSaved}</span> con tu membresía Routinize+.
              ¿Estás seguro que quieres cancelar? Tu membresía permanecerá activa hasta el {nextPaymentDate}.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-col gap-2">
            <Button
              variant="destructive"
              className="w-full rounded-full"
              onClick={handleCancelMembership}
            >
              Cancelar membresía
            </Button>

            <Button
              variant="default"
              className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleKeepMembership}
            >
              Mantener membresía
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
