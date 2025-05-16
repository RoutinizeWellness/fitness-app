import { 
  calculateIdealWeight, 
  analyzeMuscleGroupFatigue,
  getUserFatigue,
  updateFatigueAfterWorkout,
  updateFatigueAfterRest,
  needsDeloadWeek,
  learnFromWorkoutPatterns
} from '@/lib/adaptive-learning-service';
import { supabase } from '@/lib/supabase-client';
import { WorkoutLog } from '@/lib/types/training';

// Mock de Supabase
jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis()
  }
}));

describe('Adaptive Learning Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFatigue', () => {
    it('should return user fatigue data when available', async () => {
      // Mock de respuesta de Supabase
      const mockFatigueData = {
        user_id: 'test-user',
        current_fatigue: 40,
        baseline_fatigue: 20,
        recovery_rate: 5,
        last_updated: new Date().toISOString()
      };

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockFatigueData,
        error: null
      });

      const result = await getUserFatigue('test-user');

      expect(result).toEqual({
        userId: 'test-user',
        currentFatigue: 40,
        baselineFatigue: 20,
        recoveryRate: 5,
        lastUpdated: mockFatigueData.last_updated
      });

      expect(supabase.from).toHaveBeenCalledWith('user_fatigue');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 'test-user');
    });

    it('should return default values when no data is available', async () => {
      // Mock de respuesta de Supabase con error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'No data found' }
      });

      const result = await getUserFatigue('test-user');

      expect(result).toEqual({
        userId: 'test-user',
        currentFatigue: 30,
        baselineFatigue: 20,
        recoveryRate: 5,
        lastUpdated: expect.any(String)
      });
    });
  });

  describe('calculateIdealWeight', () => {
    it('should calculate ideal weight based on fatigue and exercise history', async () => {
      // Mock de fatiga del usuario
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_fatigue') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                current_fatigue: 40,
                baseline_fatigue: 20,
                recovery_rate: 5,
                last_updated: new Date().toISOString()
              },
              error: null
            })
          };
        } else if (table === 'exercise_history') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  user_id: 'test-user',
                  exercise_id: 'bench-press',
                  weight: 80,
                  reps: 8,
                  rir: 2,
                  date: new Date().toISOString()
                }
              ],
              error: null
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        };
      });

      const result = await calculateIdealWeight('test-user', 'bench-press', 6, 1);

      // Esperamos un peso recomendado basado en el algoritmo
      // Con fatiga moderada (40%), RIR objetivo menor (1 vs 2) y menos repeticiones (6 vs 8)
      // Debería recomendar un peso mayor
      expect(result).toBeGreaterThan(80);
      expect(result).toBeLessThan(90); // No debería ser un aumento demasiado grande
      expect(result % 2.5).toBe(0); // Debería ser múltiplo de 2.5
    });

    it('should return null when no exercise history is available', async () => {
      // Mock de fatiga del usuario
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_fatigue') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                current_fatigue: 40,
                baseline_fatigue: 20,
                recovery_rate: 5,
                last_updated: new Date().toISOString()
              },
              error: null
            })
          };
        } else if (table === 'exercise_history') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        };
      });

      const result = await calculateIdealWeight('test-user', 'bench-press', 6, 1);

      expect(result).toBeNull();
    });
  });

  describe('analyzeMuscleGroupFatigue', () => {
    it('should analyze fatigue by muscle group', async () => {
      // Mock de fatiga del usuario
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_fatigue') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: 'test-user',
                current_fatigue: 40,
                baseline_fatigue: 20,
                recovery_rate: 5,
                last_updated: new Date().toISOString()
              },
              error: null
            })
          };
        } else if (table === 'exercises') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockImplementation((exerciseId) => {
              const muscleGroups: Record<string, string[]> = {
                'bench-press': ['chest', 'shoulders', 'arms'],
                'squat': ['legs', 'core'],
                'deadlift': ['back', 'legs', 'core']
              };
              
              return Promise.resolve({
                data: { muscle_group: muscleGroups[exerciseId] || [] },
                error: null
              });
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis()
        };
      });

      // Crear logs de entrenamiento de prueba
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const workoutLogs: WorkoutLog[] = [
        {
          id: '1',
          userId: 'test-user',
          routineId: 'routine-1',
          dayId: 'day-1',
          date: yesterday.toISOString(),
          duration: 60,
          completedSets: [
            { id: 'set-1', exerciseId: 'bench-press', completedReps: 8, completedWeight: 80 },
            { id: 'set-2', exerciseId: 'bench-press', completedReps: 8, completedWeight: 80 }
          ]
        },
        {
          id: '2',
          userId: 'test-user',
          routineId: 'routine-1',
          dayId: 'day-2',
          date: now.toISOString(),
          duration: 60,
          completedSets: [
            { id: 'set-3', exerciseId: 'squat', completedReps: 8, completedWeight: 100 },
            { id: 'set-4', exerciseId: 'deadlift', completedReps: 6, completedWeight: 120 }
          ]
        }
      ];

      const result = await analyzeMuscleGroupFatigue('test-user', workoutLogs);

      // Verificar que se calculó la fatiga para todos los grupos musculares
      expect(result).toHaveProperty('chest');
      expect(result).toHaveProperty('back');
      expect(result).toHaveProperty('legs');
      expect(result).toHaveProperty('shoulders');
      expect(result).toHaveProperty('arms');
      expect(result).toHaveProperty('core');

      // La fatiga de piernas debería ser mayor que la de pecho
      // ya que se entrenaron más recientemente
      expect(result.legs).toBeGreaterThan(result.chest);
      
      // La fatiga de core debería ser alta ya que se entrena en squat y deadlift
      expect(result.core).toBeGreaterThan(0);
    });
  });
});
