import { supabase } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
  };
  config: WidgetConfig;
}

export type WidgetType = 
  | 'workout_frequency'
  | 'workout_performance'
  | 'nutrition_tracker'
  | 'goal_progress'
  | 'body_metrics'
  | 'streak_calendar'
  | 'personal_records'
  | 'recovery_metrics'
  | 'sleep_quality'
  | 'hydration_tracker'
  | 'custom';

export interface WidgetConfig {
  dataSource: string;
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all_time';
  visualization: 'bar' | 'line' | 'pie' | 'progress' | 'calendar' | 'table' | 'card';
  metrics: string[];
  filters?: Record<string, any>;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  customOptions?: Record<string, any>;
}

export interface UserDashboard {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all dashboards for a user
 * @param userId The user ID
 * @returns Array of user dashboards
 */
export async function getUserDashboards(userId: string): Promise<UserDashboard[]> {
  try {
    const { data, error } = await supabase
      .from('user_dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user dashboards:', error);
      return [];
    }

    if (!data || data.length === 0) {
      // Create default dashboard if none exists
      const defaultDashboard = await createDefaultDashboard(userId);
      return defaultDashboard ? [defaultDashboard] : [];
    }

    return data.map(item => item.dashboard_data);
  } catch (error) {
    console.error('Error in getUserDashboards:', error);
    return [];
  }
}

/**
 * Create a default dashboard for a user
 * @param userId The user ID
 * @returns The created dashboard
 */
async function createDefaultDashboard(userId: string): Promise<UserDashboard | null> {
  try {
    const defaultDashboard: UserDashboard = {
      id: uuidv4(),
      name: 'Mi Dashboard',
      isDefault: true,
      widgets: [
        {
          id: uuidv4(),
          type: 'workout_frequency',
          title: 'Frecuencia de Entrenamiento',
          size: 'medium',
          position: { x: 0, y: 0 },
          config: {
            dataSource: 'workout_sessions',
            timeRange: 'month',
            visualization: 'bar',
            metrics: ['count'],
            colors: ['#FDA758'],
            showLegend: false,
            showLabels: true
          }
        },
        {
          id: uuidv4(),
          type: 'goal_progress',
          title: 'Progreso de Objetivos',
          size: 'medium',
          position: { x: 1, y: 0 },
          config: {
            dataSource: 'user_goals',
            timeRange: 'all_time',
            visualization: 'progress',
            metrics: ['progress_percentage'],
            colors: ['#5DE292', '#FDA758', '#FF6767'],
            showLegend: true,
            showLabels: true
          }
        },
        {
          id: uuidv4(),
          type: 'streak_calendar',
          title: 'Calendario de Racha',
          size: 'large',
          position: { x: 0, y: 1 },
          config: {
            dataSource: 'user_streaks',
            timeRange: 'month',
            visualization: 'calendar',
            metrics: ['workout_days'],
            colors: ['#FDA758'],
            showLegend: false,
            showLabels: true
          }
        },
        {
          id: uuidv4(),
          type: 'personal_records',
          title: 'Récords Personales',
          size: 'small',
          position: { x: 0, y: 2 },
          config: {
            dataSource: 'workout_sessions',
            timeRange: 'all_time',
            visualization: 'card',
            metrics: ['max_weight', 'max_reps'],
            showLegend: false,
            showLabels: true
          }
        },
        {
          id: uuidv4(),
          type: 'nutrition_tracker',
          title: 'Seguimiento Nutricional',
          size: 'small',
          position: { x: 1, y: 2 },
          config: {
            dataSource: 'nutrition_logs',
            timeRange: 'week',
            visualization: 'pie',
            metrics: ['calories', 'protein', 'carbs', 'fat'],
            colors: ['#5DE292', '#FDA758', '#FF6767', '#8C80F8'],
            showLegend: true,
            showLabels: true
          }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const { error } = await supabase
      .from('user_dashboards')
      .insert([{
        user_id: userId,
        dashboard_data: defaultDashboard,
        created_at: defaultDashboard.createdAt,
        updated_at: defaultDashboard.updatedAt,
        is_default: true
      }]);

    if (error) {
      console.error('Error creating default dashboard:', error);
      return null;
    }

    return defaultDashboard;
  } catch (error) {
    console.error('Error in createDefaultDashboard:', error);
    return null;
  }
}

/**
 * Create a new dashboard for a user
 * @param userId The user ID
 * @param name The dashboard name
 * @returns The created dashboard
 */
export async function createDashboard(userId: string, name: string): Promise<UserDashboard | null> {
  try {
    const newDashboard: UserDashboard = {
      id: uuidv4(),
      name,
      isDefault: false,
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const { error } = await supabase
      .from('user_dashboards')
      .insert([{
        user_id: userId,
        dashboard_data: newDashboard,
        created_at: newDashboard.createdAt,
        updated_at: newDashboard.updatedAt,
        is_default: false
      }]);

    if (error) {
      console.error('Error creating dashboard:', error);
      return null;
    }

    return newDashboard;
  } catch (error) {
    console.error('Error in createDashboard:', error);
    return null;
  }
}

/**
 * Update a dashboard
 * @param userId The user ID
 * @param dashboardId The dashboard ID
 * @param dashboardData The updated dashboard data
 * @returns Success status
 */
export async function updateDashboard(
  userId: string,
  dashboardId: string,
  dashboardData: Partial<UserDashboard>
): Promise<boolean> {
  try {
    // Get current dashboard
    const { data: currentDashboard, error: fetchError } = await supabase
      .from('user_dashboards')
      .select('*')
      .eq('user_id', userId)
      .eq('dashboard_data->>id', dashboardId)
      .single();

    if (fetchError) {
      console.error('Error fetching dashboard:', fetchError);
      return false;
    }

    // Update dashboard
    const updatedDashboard = {
      ...currentDashboard.dashboard_data,
      ...dashboardData,
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const { error: saveError } = await supabase
      .from('user_dashboards')
      .update({
        dashboard_data: updatedDashboard,
        updated_at: updatedDashboard.updatedAt
      })
      .eq('user_id', userId)
      .eq('dashboard_data->>id', dashboardId);

    if (saveError) {
      console.error('Error updating dashboard:', saveError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDashboard:', error);
    return false;
  }
}
