// Types for community features

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at?: string;
  // Joined fields
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
  comments?: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at?: string;
  // Joined fields
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CommunityLike {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

export interface CommunityTag {
  id: string;
  name: string;
  description?: string;
  post_count: number;
  created_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

// Filter and sort options
export type CommunityPostSortOption = 'newest' | 'popular' | 'trending' | 'most_commented';

export interface CommunityPostFilters {
  tag?: string;
  user_id?: string;
  liked_by_user?: boolean;
  date_range?: {
    from?: string;
    to?: string;
  };
}
