"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Check,
  X,
  CreditCard,
  Calendar,
  Clock,
  User,
  Shield,
  Zap,
  Star,
  Award,
  Gift,
  ArrowRight
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { format, addMonths } from "date-fns"
import { es } from "date-fns/locale"

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  is_popular: boolean;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  last_four?: string;
  expiry_date?: string;
  is_default: boolean;
}

interface BillingHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  payment_date: string;
  payment_method: string;
  invoice_url?: string;
}

export default function MembershipPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("subscription")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMembershipData = async () => {
      setIsLoading(true)
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("Usuario no autenticado")
        }

        // Get subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!subscriptionError) {
          setSubscription(subscriptionData)
        }

        // Get plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true })

        if (plansError) throw plansError
        setPlans(plansData || [])

        // Get payment methods
        const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)

        if (paymentMethodsError) throw paymentMethodsError
        setPaymentMethods(paymentMethodsData || [])

        // Get billing history
        const { data: billingHistoryData, error: billingHistoryError } = await supabase
          .from('billing_history')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })

        if (billingHistoryError) throw billingHistoryError
        setBillingHistory(billingHistoryData || [])
      } catch (error) {
        console.error("Error fetching membership data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de membresía.",
          variant: "destructive"
        })

        // Crear datos de ejemplo si no hay datos reales
        createSampleData()
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembershipData()
  }, [toast])

  const createSampleData = () => {
    // Sample plans
    const samplePlans: Plan[] = [
      {
        id: "plan-basic",
        name: "Plan Básico",
        description: "Acceso a funciones esenciales para comenzar tu viaje fitness",
        price: 9.99,
        currency: "EUR",
        billing_period: "monthly",
        features: [
          "Seguimiento de entrenamientos",
          "Biblioteca básica de ejercicios",
          "Seguimiento nutricional básico",
          "Soporte por email"
        ],
        is_popular: false
      },
      {
        id: "plan-premium",
        name: "Plan Premium",
        description: "Acceso completo a todas las funciones para maximizar tus resultados",
        price: 19.99,
        currency: "EUR",
        billing_period: "monthly",
        features: [
          "Todo lo del Plan Básico",
          "Biblioteca completa de ejercicios",
          "Planes de entrenamiento personalizados",
          "Análisis nutricional avanzado",
          "Seguimiento de progreso detallado",
          "Soporte prioritario"
        ],
        is_popular: true
      },
      {
        id: "plan-elite",
        name: "Plan Elite",
        description: "La experiencia definitiva con coaching personalizado",
        price: 39.99,
        currency: "EUR",
        billing_period: "monthly",
        features: [
          "Todo lo del Plan Premium",
          "Sesiones de coaching mensuales",
          "Planes de nutrición personalizados",
          "Análisis avanzado de métricas",
          "Acceso anticipado a nuevas funciones",
          "Soporte 24/7"
        ],
        is_popular: false
      }
    ]

    setPlans(samplePlans)

    // Sample subscription
    const sampleSubscription: Subscription = {
      id: "sub-sample",
      user_id: "user-sample",
      plan_id: "plan-premium",
      status: "active",
      start_date: new Date().toISOString(),
      end_date: addMonths(new Date(), 1).toISOString(),
      auto_renew: true,
      payment_method: "credit_card",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setSubscription(sampleSubscription)

    // Sample payment methods
    const samplePaymentMethods: PaymentMethod[] = [
      {
        id: "pm-sample-1",
        user_id: "user-sample",
        type: "credit_card",
        last_four: "4242",
        expiry_date: "12/25",
        is_default: true
      }
    ]

    setPaymentMethods(samplePaymentMethods)

    // Sample billing history
    const sampleBillingHistory: BillingHistory[] = [
      {
        id: "bill-sample-1",
        user_id: "user-sample",
        subscription_id: "sub-sample",
        amount: 19.99,
        currency: "EUR",
        status: "paid",
        payment_date: new Date().toISOString(),
        payment_method: "credit_card",
        invoice_url: "#"
      },
      {
        id: "bill-sample-2",
        user_id: "user-sample",
        subscription_id: "sub-sample",
        amount: 19.99,
        currency: "EUR",
        status: "paid",
        payment_date: addMonths(new Date(), -1).toISOString(),
        payment_method: "credit_card",
        invoice_url: "#"
      }
    ]

    setBillingHistory(sampleBillingHistory)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM, yyyy', { locale: es })
  }

  const getCurrentPlan = () => {
    if (!subscription || !plans.length) return null
    return plans.find(plan => plan.id === subscription.plan_id)
  }

  const handleSubscribe = (planId: string) => {
    toast({
      title: "Procesando suscripción",
      description: "Redirigiendo al proceso de pago...",
    })
    // Aquí iría la lógica para redirigir al proceso de pago
  }

  const handleCancelSubscription = () => {
    toast({
      title: "Cancelación de suscripción",
      description: "Tu solicitud de cancelación ha sido recibida. Tu suscripción seguirá activa hasta el final del período de facturación.",
    })
    // Aquí iría la lógica para cancelar la suscripción
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Cargando información de membresía...</p>
        </div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Membresía</h1>
          <p className="text-muted-foreground">Gestiona tu suscripción y métodos de pago</p>
        </div>
        {subscription && (
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="text-sm">
            {subscription.status === 'active' ? 'Activa' :
             subscription.status === 'trial' ? 'Prueba' :
             subscription.status === 'canceled' ? 'Cancelada' : 'Expirada'}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
          <TabsTrigger value="payment">Métodos de Pago</TabsTrigger>
          <TabsTrigger value="billing">Historial de Facturación</TabsTrigger>
        </TabsList>

        {/* Pestaña de Suscripción */}
        <TabsContent value="subscription" className="space-y-4 mt-6">
          {subscription && currentPlan ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Tu Plan Actual</CardTitle>
                    <CardDescription>Detalles de tu suscripción actual</CardDescription>
                  </div>
                  {currentPlan.is_popular && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-orange-500">Popular</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{formatCurrency(currentPlan.price, currentPlan.currency)}</span>
                    <span className="text-sm text-muted-foreground">/{currentPlan.billing_period === 'monthly' ? 'mes' :
                      currentPlan.billing_period === 'quarterly' ? 'trimestre' : 'año'}</span>
                  </div>
                </div>

                <p className="text-muted-foreground">{currentPlan.description}</p>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Características incluidas:</p>
                  <ul className="space-y-1">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm">Estado:</span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status === 'active' ? 'Activa' :
                       subscription.status === 'trial' ? 'Prueba' :
                       subscription.status === 'canceled' ? 'Cancelada' : 'Expirada'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fecha de inicio:</span>
                    <span className="text-sm">{formatDate(subscription.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Próxima facturación:</span>
                    <span className="text-sm">{formatDate(subscription.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Renovación automática:</span>
                    <span className="text-sm">{subscription.auto_renew ? 'Activada' : 'Desactivada'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancelSubscription}>
                  Cancelar suscripción
                </Button>
                <Button>
                  Cambiar plan
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Elige un plan</h2>
                <p className="text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`relative ${plan.is_popular ? 'border-primary shadow-lg' : ''}`}>
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-0 right-0 mx-auto w-max">
                        <Badge className="bg-gradient-to-r from-pink-500 to-orange-500">
                          Más Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <span className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
                        <span className="text-sm text-muted-foreground">/{plan.billing_period === 'monthly' ? 'mes' :
                          plan.billing_period === 'quarterly' ? 'trimestre' : 'año'}</span>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={`w-full ${plan.is_popular ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' : ''}`}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        Suscribirse
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Pestaña de Métodos de Pago */}
        <TabsContent value="payment" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Gestiona tus métodos de pago</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          {method.type === 'credit_card' ? (
                            <CreditCard className="h-5 w-5 text-primary" />
                          ) : method.type === 'paypal' ? (
                            <div className="text-primary font-bold">P</div>
                          ) : (
                            <div className="text-primary font-bold">B</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {method.type === 'credit_card' ? 'Tarjeta terminada en ' + method.last_four :
                             method.type === 'paypal' ? 'PayPal' : 'Transferencia bancaria'}
                          </p>
                          {method.expiry_date && (
                            <p className="text-sm text-muted-foreground">Expira: {method.expiry_date}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {method.is_default && (
                          <Badge variant="outline" className="mr-2">Predeterminado</Badge>
                        )}
                        <Button variant="ghost" size="sm">Editar</Button>
                        {!method.is_default && (
                          <Button variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No hay métodos de pago</p>
                  <p className="text-sm text-muted-foreground mb-4">Añade un método de pago para gestionar tus suscripciones</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Añadir método de pago
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Historial de Facturación */}
        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Facturación</CardTitle>
              <CardDescription>Revisa tus facturas anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              {billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                          bill.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bill.status === 'paid' ? (
                            <Check className="h-5 w-5" />
                          ) : bill.status === 'pending' ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(bill.amount, bill.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(bill.payment_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={
                          bill.status === 'paid' ? 'default' :
                          bill.status === 'pending' ? 'outline' :
                          'destructive'
                        }>
                          {bill.status === 'paid' ? 'Pagado' :
                           bill.status === 'pending' ? 'Pendiente' :
                           'Fallido'}
                        </Badge>
                        {bill.invoice_url && (
                          <Button variant="ghost" size="sm" className="ml-2">
                            Ver factura
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No hay historial de facturación</p>
                  <p className="text-sm text-muted-foreground">Tu historial de facturación aparecerá aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
