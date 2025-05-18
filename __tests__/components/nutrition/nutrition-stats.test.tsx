import { render, screen } from '@testing-library/react'
import NutritionStats from '@/components/nutrition/nutrition-stats-improved'
import { useNutrition } from '@/contexts/nutrition-context'

// Mock del contexto de nutrición
jest.mock('@/contexts/nutrition-context', () => ({
  useNutrition: jest.fn()
}))

// Mock de los componentes de gráficos
jest.mock('@/components/nutrition/charts/calories-trend-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="calories-trend-chart">Calories Trend Chart</div>
}))

jest.mock('@/components/nutrition/charts/macro-distribution-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="macro-distribution-chart">Macro Distribution Chart</div>
}))

jest.mock('@/components/nutrition/charts/meal-distribution-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="meal-distribution-chart">Meal Distribution Chart</div>
}))

jest.mock('@/components/nutrition/stats/nutrition-stats-cards', () => ({
  __esModule: true,
  default: () => <div data-testid="nutrition-stats-cards">Nutrition Stats Cards</div>
}))

describe('NutritionStats', () => {
  beforeEach(() => {
    // Configurar el mock del contexto de nutrición
    (useNutrition as jest.Mock).mockReturnValue({
      dailyStats: {
        totalCalories: 2000,
        totalProtein: 120,
        totalCarbs: 200,
        totalFat: 70
      },
      isLoadingDailyStats: false,
      loadDailyStats: jest.fn(),
      nutritionGoals: {
        calories: 2200,
        protein: 130,
        carbs: 220,
        fat: 75
      },
      isLoadingGoals: false,
      loadNutritionGoals: jest.fn()
    })
  })
  
  it('renderiza correctamente los componentes de gráficos', () => {
    render(<NutritionStats />)
    
    // Verificar que se renderizan los componentes de gráficos
    expect(screen.getByTestId('calories-trend-chart')).toBeInTheDocument()
    expect(screen.getByTestId('macro-distribution-chart')).toBeInTheDocument()
    expect(screen.getByTestId('meal-distribution-chart')).toBeInTheDocument()
    expect(screen.getByTestId('nutrition-stats-cards')).toBeInTheDocument()
  })
  
  it('muestra el estado de carga cuando está cargando', () => {
    // Configurar el mock para simular estado de carga
    (useNutrition as jest.Mock).mockReturnValue({
      dailyStats: null,
      isLoadingDailyStats: true,
      loadDailyStats: jest.fn(),
      nutritionGoals: null,
      isLoadingGoals: true,
      loadNutritionGoals: jest.fn()
    })
    
    render(<NutritionStats />)
    
    // Verificar que se muestra el estado de carga
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })
  
  // Aquí se agregarían más pruebas para diferentes escenarios
})
