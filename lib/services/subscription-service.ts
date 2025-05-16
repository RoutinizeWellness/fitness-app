import { SupabaseClient } from '@supabase/supabase-js';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  is_popular?: boolean;
  discount_percentage?: number;
  price_per_month?: number;
}

export class SubscriptionService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .order('price');

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return this.getDefaultPlans();
    }

    return data.length ? data : this.getDefaultPlans();
  }

  private getDefaultPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly',
        description: 'Basic plan with all features',
        price: 19.00,
        interval: 'monthly',
        features: ['Unlimited habits', 'Access to all courses', 'Access to all audio illustrations'],
        price_per_month: 19.00
      },
      {
        id: 'quarterly',
        name: 'Quarterly',
        description: 'Save with a 3-month subscription',
        price: 29.00,
        interval: 'quarterly',
        features: ['Unlimited habits', 'Access to all courses', 'Access to all audio illustrations'],
        is_popular: true,
        discount_percentage: 50,
        price_per_month: 9.67
      },
      {
        id: 'yearly',
        name: 'Yearly',
        description: 'Best value for committed users',
        price: 49.00,
        interval: 'yearly',
        features: ['Unlimited habits', 'Access to all courses', 'Access to all audio illustrations'],
        discount_percentage: 80,
        price_per_month: 4.08
      }
    ];
  }

  async createCheckoutSession(userId: string, planId: string): Promise<string | null> {
    // En una implementación real, aquí se conectaría con Stripe u otro procesador de pagos
    // Para este ejemplo, simularemos una URL de checkout
    
    // Registrar la intención de compra en Supabase
    const { error } = await this.supabase
      .from('checkout_sessions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }

    // En una implementación real, aquí se devolvería la URL de Stripe
    return `/checkout/confirm?plan=${planId}`;
  }

  async confirmSubscription(userId: string, planId: string): Promise<boolean> {
    // Obtener el plan
    const { data: planData, error: planError } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('Error fetching plan:', planError);
      return false;
    }

    // Calcular fecha de finalización según el intervalo
    let endDate = new Date();
    switch (planData.interval) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Crear o actualizar la suscripción
    const { error: subscriptionError } = await this.supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true
      });

    if (subscriptionError) {
      console.error('Error confirming subscription:', subscriptionError);
      return false;
    }

    // Actualizar el estado de la sesión de checkout
    const { error: sessionError } = await this.supabase
      .from('checkout_sessions')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('status', 'pending');

    if (sessionError) {
      console.error('Error updating checkout session:', sessionError);
      // No es crítico, la suscripción ya se creó
    }

    return true;
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }

    return true;
  }

  async getActiveSubscription(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      console.error('Error fetching active subscription:', error);
      return null;
    }

    return data;
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    return !!subscription;
  }
}
