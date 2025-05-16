"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"
import { ChevronRight, Check, Loader2 } from "lucide-react"
import { SubscriptionService, SubscriptionPlan } from "@/lib/services/subscription-service"
import { NotificationService } from "@/lib/services/notification-service"
import { toast } from "@/components/ui/use-toast"

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("monthly")
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 56,
    seconds: 48
  })

  // Servicios
  const subscriptionService = new SubscriptionService(supabase)
  const notificationService = new NotificationService(supabase)

  // Cargar datos de suscripción
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const loadSubscriptionData = async () => {
      try {
        // Cargar planes de suscripción
        const subscriptionPlans = await subscriptionService.getSubscriptionPlans()
        setPlans(subscriptionPlans)

        // Verificar si el usuario tiene una suscripción activa
        const subscription = await subscriptionService.getActiveSubscription(user.id)
        setActiveSubscription(subscription)

        // Si tiene una suscripción activa, seleccionar ese plan
        if (subscription) {
          setSelectedPlan(subscription.plan_id)
        }
      } catch (error) {
        console.error("Error loading subscription data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscriptionData()

    // Iniciar el temporizador para la promoción
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1
        if (newSeconds >= 0) {
          return { ...prev, seconds: newSeconds }
        }

        const newMinutes = prev.minutes - 1
        if (newMinutes >= 0) {
          return { ...prev, minutes: newMinutes, seconds: 59 }
        }

        const newHours = prev.hours - 1
        if (newHours >= 0) {
          return { hours: newHours, minutes: 59, seconds: 59 }
        }

        // Si el temporizador llega a cero, detenerlo
        clearInterval(timer)
        return { hours: 0, minutes: 0, seconds: 0 }
      })
    }, 1000)

    // Limpiar el temporizador al desmontar
    return () => clearInterval(timer)
  }, [user, router, supabase])

  // Suscribirse a un plan
  const handleSubscribe = async () => {
    if (!user) return

    setIsSubscribing(true)

    try {
      // Obtener el plan seleccionado
      const plan = plans.find(p => p.id === selectedPlan)

      if (!plan) {
        throw new Error("Selected plan not found")
      }

      // Crear sesión de checkout
      const checkoutUrl = await subscriptionService.createCheckoutSession(user.id, plan.id)

      if (checkoutUrl) {
        // En una implementación real, redirigir al usuario a la página de checkout
        // Para este ejemplo, simularemos una suscripción exitosa
        const success = await subscriptionService.confirmSubscription(user.id, plan.id)

        if (success) {
          // Crear notificación de suscripción
          await notificationService.createSubscriptionNotification(user.id, plan.name)

          toast({
            title: "Success",
            description: `You are now subscribed to the ${plan.name} plan.`,
          })

          // Recargar los datos de suscripción
          const subscription = await subscriptionService.getActiveSubscription(user.id)
          setActiveSubscription(subscription)
        } else {
          throw new Error("Failed to confirm subscription")
        }
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  // Cancelar suscripción
  const handleCancelSubscription = async () => {
    if (!user || !activeSubscription) return

    try {
      const confirmed = window.confirm("Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.")

      if (confirmed) {
        const success = await subscriptionService.cancelSubscription(user.id)

        if (success) {
          toast({
            title: "Subscription Canceled",
            description: "Your subscription has been canceled. You will still have access until the end of your billing period.",
          })

          // Actualizar el estado de la suscripción
          const subscription = await subscriptionService.getActiveSubscription(user.id)
          setActiveSubscription(subscription)
        } else {
          throw new Error("Failed to cancel subscription")
        }
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF3E9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDA758]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/profile/habit-dashboard" className="text-[#573353]">
          <ChevronRight className="h-6 w-6 transform rotate-180" />
        </Link>
        <h1 className="text-[#573353] text-lg font-medium">Premium</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {/* Promotion Banner */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[#573353] text-xl font-bold mb-1">50% off your upgrade</h2>
            <p className="text-[#573353]/70 text-sm">Expires in</p>

            <div className="flex space-x-2 mt-2">
              <div className="bg-[#573353] text-white w-8 h-8 rounded-md flex items-center justify-center">
                <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
              </div>
              <div className="bg-[#573353] text-white w-8 h-8 rounded-md flex items-center justify-center">
                <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
              </div>
              <div className="bg-[#573353] text-white w-8 h-8 rounded-md flex items-center justify-center">
                <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="relative w-24 h-24">
            <Image
              src="/images/profile/tent-illustration.png"
              alt="Premium Tent"
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback para imagen no encontrada
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = "w-24 h-24 rounded-full bg-[#FDA758]/20 flex items-center justify-center";
                  fallback.innerHTML = "<span class='text-[#573353] font-medium'>🏕️</span>";
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <h2 className="text-[#573353] text-xl font-bold mb-4 text-center">Unlock Monumental Habits</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
              <Check className="h-3 w-3 text-[#FDA758]" />
            </div>
            <span className="text-[#573353] text-sm">Unlimited habits</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
              <Check className="h-3 w-3 text-[#FDA758]" />
            </div>
            <span className="text-[#573353] text-sm">Access to all courses</span>
          </div>

          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
              <Check className="h-3 w-3 text-[#FDA758]" />
            </div>
            <span className="text-[#573353] text-sm">Access to all audio illustrations</span>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl p-4 text-center cursor-pointer relative ${
                selectedPlan === plan.id
                  ? "bg-[#FDA758] text-white"
                  : "bg-[#FFF2E9] text-[#573353]"
              } ${activeSubscription && activeSubscription.plan_id === plan.id ? "border-2 border-[#573353]" : ""}`}
              onClick={() => !activeSubscription && setSelectedPlan(plan.id)}
            >
              {plan.is_popular && selectedPlan === plan.id && (
                <div className="absolute -top-2 -right-2 bg-[#573353] text-white text-xs px-2 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {plan.discount_percentage && plan.discount_percentage >= 70 && selectedPlan === plan.id && (
                <div className="absolute -top-2 -right-2 bg-[#573353] text-white text-xs px-2 py-1 rounded-full">
                  Best Value
                </div>
              )}

              <div className="text-lg font-bold">${plan.price.toFixed(2)}</div>
              <div className="text-xs">
                {plan.interval === 'monthly' ? '1 month' :
                 plan.interval === 'quarterly' ? '3 months' :
                 '12 months'}
              </div>
              <div className="text-xs mt-1">${plan.price_per_month?.toFixed(2)}/mo</div>

              {activeSubscription && activeSubscription.plan_id === plan.id && (
                <div className="mt-2 text-xs font-medium">
                  Current Plan
                </div>
              )}
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-3 text-center py-4 text-[#573353]/70">
              <p>No subscription plans available.</p>
            </div>
          )}
        </div>

        {/* Subscription Buttons */}
        <div className="space-y-3">
          {activeSubscription ? (
            <div className="space-y-3">
              <div className="text-center text-sm text-[#573353] mb-2">
                <p>You are currently subscribed to the <span className="font-medium">{
                  plans.find(p => p.id === activeSubscription.plan_id)?.name || activeSubscription.plan_id
                }</span> plan.</p>
                <p className="text-xs mt-1">
                  {activeSubscription.status === 'active'
                    ? `Your subscription will ${activeSubscription.auto_renew ? 'renew' : 'expire'} on ${new Date(activeSubscription.end_date).toLocaleDateString()}.`
                    : activeSubscription.status === 'canceled'
                    ? `Your subscription is canceled and will expire on ${new Date(activeSubscription.end_date).toLocaleDateString()}.`
                    : ''}
                </p>
              </div>

              {activeSubscription.status === 'active' && activeSubscription.auto_renew && (
                <button
                  onClick={handleCancelSubscription}
                  className="w-full bg-white border border-[#FDA758] text-[#FDA758] py-3 rounded-full font-medium"
                >
                  Cancel Subscription
                </button>
              )}

              <button
                onClick={() => router.push('/profile/habit-dashboard')}
                className="w-full bg-[#FDA758] text-white py-3 rounded-full font-medium"
              >
                Back to Profile
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing || plans.length === 0}
                className="w-full bg-[#FDA758] text-white py-3 rounded-full font-medium flex items-center justify-center"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe Now"
                )}
              </button>

              <div className="text-center text-xs text-[#573353]/70">
                <span>Secure payment. Cancel anytime</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mx-4 mb-20 text-center">
        <div className="text-xs text-[#573353]/70 mb-2">
          Restore Purchase
        </div>
        <div className="text-xs text-[#573353]/70 flex justify-center space-x-2">
          <span>Terms of Service</span>
          <span>•</span>
          <span>Privacy Policy</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3">
        <Link href="/habit-dashboard" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17.99V14.99" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Home</span>
        </Link>

        <Link href="/habit-dashboard/habits" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" stroke="#573353" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7V21C2 21.83 2.94 22.3 3.6 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.29 22.29C8.68 22.68 9.32 22.68 9.71 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" stroke="#573353" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13.01H12" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9.01H12" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.99561 13H6.00459" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.99561 9H6.00459" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Habits</span>
        </Link>

        <Link href="/habit-dashboard/stats" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10.74V13.94" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9V15.68" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 10.74V13.94" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Stats</span>
        </Link>

        <Link href="/profile/habit-dashboard" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#FDA758] mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
