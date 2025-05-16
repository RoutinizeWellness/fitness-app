import { supabase } from '@/lib/supabase-client';
import { Course, Lesson, UserCourseProgress, UserLessonProgress, CourseSortOption, CourseFilters } from '@/lib/types/courses';

export class CourseService {
  /**
   * Get all courses with filtering and sorting
   */
  static async getCourses(
    sortBy: CourseSortOption = 'popular',
    filters?: CourseFilters,
    userId?: string
  ): Promise<{ data: Course[] | null; count: number; error: any }> {
    try {
      // Start building the query
      let query = supabase
        .from('courses')
        .select(`
          *,
          author:author_id(full_name, avatar_url)
        `, { count: 'exact' })
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
          // This is a simplified approach - in a real app, you might need a more complex query
          switch (filters.duration) {
            case 'short':
              query = query.lt('duration', '1h');
              break;
            case 'medium':
              query = query.gte('duration', '1h').lt('duration', '3h');
              break;
            case 'long':
              query = query.gte('duration', '3h');
              break;
          }
        }

        // Filter for free courses
        if (filters.free === true) {
          // This would require a more complex query to check if all lessons are free
          // For simplicity, we'll assume there's a is_free field on courses
          query = query.eq('is_free', true);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          // Assuming there's an enrollments_count field
          query = query.order('enrollments_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest_rated':
          // Assuming there's an average_rating field
          query = query.order('average_rating', { ascending: false });
          break;
        case 'a-z':
          query = query.order('title', { ascending: true });
          break;
        case 'z-a':
          query = query.order('title', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Execute the query
      const { data, error, count } = await query;

      // If a user ID is provided, fetch their progress for these courses
      if (userId && data && data.length > 0) {
        const courseIds = data.map(course => course.id);
        
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .in('course_id', courseIds);

        if (!progressError && progressData) {
          // Add progress data to each course
          const progressMap = progressData.reduce((map, progress) => {
            map[progress.course_id] = progress;
            return map;
          }, {});

          data.forEach(course => {
            course.progress = progressMap[course.id];
          });
        }
      }

      return {
        data: data as Course[],
        count: count || 0,
        error
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, count: 0, error };
    }
  }

  /**
   * Get a single course by ID with its lessons
   */
  static async getCourseById(courseId: string, userId?: string): Promise<{ data: Course | null; error: any }> {
    try {
      // Get the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          author:author_id(full_name, avatar_url)
        `)
        .eq('id', courseId)
        .eq('is_published', true)
        .single();

      if (courseError) {
        return { data: null, error: courseError };
      }

      // Get the lessons for this course
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_number', { ascending: true });

      if (lessonsError) {
        return { data: course as Course, error: lessonsError };
      }

      // If a user ID is provided, fetch their progress
      if (userId) {
        // Get course progress
        const { data: courseProgress, error: courseProgressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();

        if (!courseProgressError) {
          course.progress = courseProgress as UserCourseProgress;
        }

        // Get lesson progress
        if (lessons && lessons.length > 0) {
          const lessonIds = lessons.map(lesson => lesson.id);
          
          const { data: lessonProgress, error: lessonProgressError } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .in('lesson_id', lessonIds);

          if (!lessonProgressError && lessonProgress) {
            // Add progress data to each lesson
            const progressMap = lessonProgress.reduce((map, progress) => {
              map[progress.lesson_id] = progress;
              return map;
            }, {});

            lessons.forEach(lesson => {
              lesson.progress = progressMap[lesson.id];
            });
          }
        }
      }

      // Combine the course with its lessons
      return {
        data: {
          ...course,
          lessons: lessons as Lesson[]
        } as Course,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching course with ID ${courseId}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Get lessons for a course
   */
  static async getLessonsByCourseId(courseId: string, userId?: string): Promise<{ data: Lesson[] | null; error: any }> {
    try {
      // Get the lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_number', { ascending: true });

      if (lessonsError) {
        return { data: null, error: lessonsError };
      }

      // If a user ID is provided, fetch their progress
      if (userId && lessons && lessons.length > 0) {
        const lessonIds = lessons.map(lesson => lesson.id);
        
        const { data: lessonProgress, error: lessonProgressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds);

        if (!lessonProgressError && lessonProgress) {
          // Add progress data to each lesson
          const progressMap = lessonProgress.reduce((map, progress) => {
            map[progress.lesson_id] = progress;
            return map;
          }, {});

          lessons.forEach(lesson => {
            lesson.progress = progressMap[lesson.id];
          });
        }
      }

      return { data: lessons as Lesson[], error: null };
    } catch (error) {
      console.error(`Error fetching lessons for course ${courseId}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Get a single lesson by ID
   */
  static async getLessonById(lessonId: string, userId?: string): Promise<{ data: Lesson | null; error: any }> {
    try {
      // Get the lesson
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError) {
        return { data: null, error: lessonError };
      }

      // If a user ID is provided, fetch their progress
      if (userId) {
        const { data: progress, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (!progressError && progress) {
          lesson.progress = progress as UserLessonProgress;
        }
      }

      return { data: lesson as Lesson, error: null };
    } catch (error) {
      console.error(`Error fetching lesson with ID ${lessonId}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Update lesson progress
   */
  static async updateLessonProgress(
    userId: string,
    lessonId: string,
    isCompleted: boolean,
    progressSeconds: number
  ): Promise<{ data: UserLessonProgress | null; error: any }> {
    try {
      // Check if progress record already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (checkError) {
        return { data: null, error: checkError };
      }

      let result;

      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .update({
            is_completed: isCompleted,
            progress_seconds: progressSeconds,
            completed_at: isCompleted ? new Date().toISOString() : existingProgress.completed_at
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        result = { data, error };
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .insert([{
            user_id: userId,
            lesson_id: lessonId,
            is_completed: isCompleted,
            progress_seconds: progressSeconds,
            completed_at: isCompleted ? new Date().toISOString() : null
          }])
          .select()
          .single();

        result = { data, error };
      }

      // Update course progress if needed
      if (result.data && !result.error) {
        await this.updateCourseProgress(userId, lessonId);
      }

      return {
        data: result.data as UserLessonProgress,
        error: result.error
      };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return { data: null, error };
    }
  }

  /**
   * Update course progress based on lesson progress
   */
  private static async updateCourseProgress(userId: string, lessonId: string): Promise<void> {
    try {
      // Get the course ID for this lesson
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('course_id')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lesson) {
        console.error('Error getting course ID for lesson:', lessonError);
        return;
      }

      const courseId = lesson.course_id;

      // Get all lessons for this course
      const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)
        .eq('is_published', true);

      if (lessonsError || !allLessons) {
        console.error('Error getting lessons for course:', lessonsError);
        return;
      }

      // Get completed lessons for this course
      const { data: completedLessons, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .in('lesson_id', allLessons.map(l => l.id));

      if (progressError) {
        console.error('Error getting completed lessons:', progressError);
        return;
      }

      // Calculate progress percentage
      const totalLessons = allLessons.length;
      const completedCount = completedLessons ? completedLessons.length : 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      const isCompleted = progressPercentage === 100;

      // Check if course progress record already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking course progress:', checkError);
        return;
      }

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_course_progress')
          .update({
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
            completed_at: isCompleted && !existingProgress.completed_at ? new Date().toISOString() : existingProgress.completed_at
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress record
        await supabase
          .from('user_course_progress')
          .insert([{
            user_id: userId,
            course_id: courseId,
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
            started_at: new Date().toISOString(),
            completed_at: isCompleted ? new Date().toISOString() : null
          }]);
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  }
}
