import { render, screen, waitFor } from '@testing-library/react'
import { NutritionProvider, useNutrition } from '@/contexts/nutrition-context'
import { AuthProvider } from '@/lib/auth/auth-context'
import { SupabaseProvider } from '@/contexts/supabase-context'
import { useAuth } from '@/lib/auth/auth-context'

// Mock de los hooks y servicios
jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('@/lib/nutrition-service', () => ({
  getNutritionEntries: jest.fn(),
  addNutritionEntry: jest.fn(),
  updateNutritionEntry: jest.fn(),
  deleteNutritionEntry: jest.fn(),
  searchFoodDatabase: jest.fn(),
  getFoodById: jest.fn(),
  getUserCustomFoods: jest.fn(),
  addCustomFood: jest.fn(),
  updateCustomFood: jest.fn(),
  deleteCustomFood: jest.fn(),
  getUserMealPlans: jest.fn(),
  getMealPlanById: jest.fn(),
  getMealPlanDetails: jest.fn(),
  createMealPlan: jest.fn(),
  updateMealPlan: jest.fn(),
  deleteMealPlan: jest.fn(),
  getUserNutritionGoals: jest.fn(),
  setNutritionGoals: jest.fn(),
  getWaterLog: jest.fn(),
  addWaterEntry: jest.fn(),
  deleteWaterEntry: jest.fn(),
  getDailyNutritionStats: jest.fn()
}))

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const { nutritionEntries, isLoadingEntries } = useNutrition()

  return (
    <div>
      <div data-testid="loading-state">{isLoadingEntries ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="entries-count">{nutritionEntries.length}</div>
    </div>
  )
}

describe('NutritionContext', () => {
  beforeEach(() => {
    // Configurar el mock de useAuth para simular un usuario autenticado
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
      isLoading: false
    })
  })

  it('proporciona el estado inicial correcto', () => {
    render(
      <SupabaseProvider>
        <AuthProvider>
          <NutritionProvider>
            <TestComponent />
          </NutritionProvider>
        </AuthProvider>
      </SupabaseProvider>
    )

    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
    expect(screen.getByTestId('entries-count')).toHaveTextContent('0')
  })

  // Aquí se agregarían más pruebas para las diferentes funcionalidades del contexto
})
