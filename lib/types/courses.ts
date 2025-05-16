// Types for courses and lessons

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration?: string; // Format: "2h 41m"
  lessons_count: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string; // 'habit', 'fitness', 'nutrition', etc.
  author_id?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: {
    full_name?: string;
    avatar_url?: string;
  };
  progress?: UserCourseProgress;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  duration?: string; // Format: "2:16" (minutes:seconds)
  order_number: number;
  is_free: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  progress?: UserLessonProgress;
}

export interface UserCourseProgress {
  id?: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
  last_accessed_lesson_id?: string;
  started_at: string;
  completed_at?: string;
}

export interface UserLessonProgress {
  id?: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  progress_seconds: number;
  completed_at?: string;
}

export interface CourseComment {
  id: string;
  user_id: string;
  course_id: string;
  content: string;
  rating?: number; // 1-5
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Filter and sort options
export type CourseSortOption = 'popular' | 'newest' | 'oldest' | 'highest_rated' | 'a-z' | 'z-a';

export interface CourseFilters {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: 'short' | 'medium' | 'long';
  completed?: boolean;
  free?: boolean;
}
