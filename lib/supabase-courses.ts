import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { 
  Course, 
  Lesson, 
  UserCourseProgress, 
  UserLessonProgress, 
  CourseComment,
  CourseSortOption,
  CourseFilters
} from './types/courses';

// Type for query responses
export type QueryResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Get all courses
export const getCourses = async (
  sortBy: CourseSortOption = 'popular',
  filters?: CourseFilters,
  userId?: string
): Promise<QueryResponse<Course[]>> => {
  try {
    let query = supabase
      .from('courses')
      .select(`
        *,
        author:author_id(full_name, avatar_url)
      `)
      .eq('is_published', true);

    // Apply filters
    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.duration) {
        // Implement duration filtering logic
        // This is a simplification - you might need more complex logic
        if (filters.duration === 'short') {
          query = query.lt('lessons_count', 10);
        } else if (filters.duration === 'medium') {
          query = query.gte('lessons_count', 10).lt('lessons_count', 20);
        } else if (filters.duration === 'long') {
          query = query.gte('lessons_count', 20);
        }
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'a-z':
        query = query.order('title', { ascending: true });
        break;
      case 'z-a':
        query = query.order('title', { ascending: false });
        break;
      case 'popular':
      default:
        query = query.order('lessons_count', { ascending: false });
        break;
    }

    const { data, error } = await query;

    // If user is logged in, get their progress for each course
    if (userId && data) {
      const { data: progressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .in('course_id', data.map(course => course.id));

      if (!progressError && progressData) {
        // Add progress data to each course
        data.forEach(course => {
          const progress = progressData.find(p => p.course_id === course.id);
          if (progress) {
            course.progress = progress;
          }
        });
      }
    }

    return { data, error };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: null, error: error as Error };
  }
};

// Get a single course by ID
export const getCourseById = async (
  courseId: string,
  userId?: string
): Promise<QueryResponse<Course>> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        author:author_id(full_name, avatar_url)
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      throw error;
    }

    // Get user progress if userId is provided
    if (userId) {
      const { data: progressData, error: progressError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (!progressError && progressData) {
        data.progress = progressData;
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching course:', error);
    return { data: null, error: error as Error };
  }
};

// Get lessons for a course
export const getLessonsByCourseId = async (
  courseId: string,
  userId?: string
): Promise<QueryResponse<Lesson[]>> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('order_number', { ascending: true });

    if (error) {
      throw error;
    }

    // Get user progress for each lesson if userId is provided
    if (userId && data) {
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', data.map(lesson => lesson.id));

      if (!progressError && progressData) {
        // Add progress data to each lesson
        data.forEach(lesson => {
          const progress = progressData.find(p => p.lesson_id === lesson.id);
          if (progress) {
            lesson.progress = progress;
          }
        });
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return { data: null, error: error as Error };
  }
};

// Get a single lesson by ID
export const getLessonById = async (
  lessonId: string,
  userId?: string
): Promise<QueryResponse<Lesson>> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) {
      throw error;
    }

    // Get user progress if userId is provided
    if (userId) {
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (!progressError && progressData) {
        data.progress = progressData;
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return { data: null, error: error as Error };
  }
};

// Update user lesson progress
export const updateLessonProgress = async (
  userId: string,
  lessonId: string,
  isCompleted: boolean,
  progressSeconds: number
): Promise<QueryResponse<UserLessonProgress>> => {
  try {
    // Check if progress record exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw checkError;
    }

    let data;
    let error;

    if (existingData) {
      // Update existing record
      const result = await supabase
        .from('user_lesson_progress')
        .update({
          is_completed: isCompleted,
          progress_seconds: progressSeconds,
          completed_at: isCompleted ? new Date().toISOString() : existingData.completed_at
        })
        .eq('id', existingData.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new record
      const result = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          is_completed: isCompleted,
          progress_seconds: progressSeconds,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return { data: null, error: error as Error };
  }
};

// Get comments for a course
export const getCourseComments = async (
  courseId: string
): Promise<QueryResponse<CourseComment[]>> => {
  try {
    const { data, error } = await supabase
      .from('course_comments')
      .select(`
        *,
        user:user_id(full_name, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching course comments:', error);
    return { data: null, error: error as Error };
  }
};

// Add a comment to a course
export const addCourseComment = async (
  userId: string,
  courseId: string,
  content: string,
  rating?: number
): Promise<QueryResponse<CourseComment>> => {
  try {
    const { data, error } = await supabase
      .from('course_comments')
      .insert({
        user_id: userId,
        course_id: courseId,
        content,
        rating
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error adding course comment:', error);
    return { data: null, error: error as Error };
  }
};
