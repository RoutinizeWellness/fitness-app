import { supabase } from '@/lib/supabase-client';
import { CommunityPost, CommunityComment, CommunityPostSortOption, CommunityPostFilters } from '@/lib/types/community';

export class CommunityService {
  /**
   * Get all community posts with pagination
   */
  static async getPosts(
    page: number = 1,
    pageSize: number = 10,
    sortBy: CommunityPostSortOption = 'newest',
    filters?: CommunityPostFilters
  ): Promise<{ data: CommunityPost[] | null; count: number; error: any }> {
    try {
      // Calculate offset
      const offset = (page - 1) * pageSize;

      // Start building the query
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          user:user_id(full_name, avatar_url)
        `, { count: 'exact' });

      // Apply filters
      if (filters) {
        if (filters.user_id) {
          query = query.eq('user_id', filters.user_id);
        }

        if (filters.date_range) {
          if (filters.date_range.from) {
            query = query.gte('created_at', filters.date_range.from);
          }
          if (filters.date_range.to) {
            query = query.lte('created_at', filters.date_range.to);
          }
        }

        // Filter by tag (requires a join with post_tags)
        if (filters.tag) {
          // This is a simplified approach - in a real app, you might need a more complex query
          const { data: postIds } = await supabase
            .from('post_tags')
            .select('post_id')
            .eq('tag_id', filters.tag);

          if (postIds && postIds.length > 0) {
            const ids = postIds.map(item => item.post_id);
            query = query.in('id', ids);
          } else {
            // No posts with this tag
            return { data: [], count: 0, error: null };
          }
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'trending':
          // For trending, we might want to consider recent posts with high engagement
          // This is a simplified approach
          query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'most_commented':
          query = query.order('comments_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + pageSize - 1);

      // Execute the query
      const { data, error, count } = await query;

      return {
        data: data as CommunityPost[],
        count: count || 0,
        error
      };
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return { data: null, count: 0, error };
    }
  }

  /**
   * Get a single post by ID with its comments
   */
  static async getPostById(postId: string): Promise<{ data: CommunityPost | null; error: any }> {
    try {
      // Get the post
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:user_id(full_name, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (postError) {
        return { data: null, error: postError };
      }

      // Get the comments for this post
      const { data: comments, error: commentsError } = await supabase
        .from('community_comments')
        .select(`
          *,
          user:user_id(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        return { data: post as CommunityPost, error: commentsError };
      }

      // Combine the post with its comments
      return {
        data: {
          ...post,
          comments: comments as CommunityComment[]
        } as CommunityPost,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching post with ID ${postId}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Create a new post
   */
  static async createPost(post: Omit<CommunityPost, 'id' | 'created_at' | 'likes_count' | 'comments_count'>): Promise<{ data: CommunityPost | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          ...post,
          likes_count: 0,
          comments_count: 0
        }])
        .select();

      if (error) {
        return { data: null, error };
      }

      return { data: data[0] as CommunityPost, error: null };
    } catch (error) {
      console.error('Error creating community post:', error);
      return { data: null, error };
    }
  }

  /**
   * Add a comment to a post
   */
  static async addComment(comment: Omit<CommunityComment, 'id' | 'created_at' | 'likes_count'>): Promise<{ data: CommunityComment | null; error: any }> {
    try {
      // Start a transaction
      const { data: newComment, error: commentError } = await supabase
        .from('community_comments')
        .insert([{
          ...comment,
          likes_count: 0
        }])
        .select();

      if (commentError) {
        return { data: null, error: commentError };
      }

      // Increment the comments count on the post
      const { error: updateError } = await supabase
        .from('community_posts')
        .update({ comments_count: supabase.rpc('increment', { inc: 1 }) })
        .eq('id', comment.post_id);

      if (updateError) {
        console.error('Error updating post comments count:', updateError);
      }

      return { data: newComment[0] as CommunityComment, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { data: null, error };
    }
  }

  /**
   * Like a post
   */
  static async likePost(userId: string, postId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Check if the user already liked this post
      const { data: existingLike, error: checkError } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (checkError) {
        return { success: false, error: checkError };
      }

      if (existingLike) {
        // User already liked this post, so unlike it
        const { error: unlikeError } = await supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);

        if (unlikeError) {
          return { success: false, error: unlikeError };
        }

        // Decrement the likes count on the post
        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ likes_count: supabase.rpc('decrement', { dec: 1 }) })
          .eq('id', postId);

        if (updateError) {
          console.error('Error updating post likes count:', updateError);
        }

        return { success: true, error: null };
      } else {
        // User hasn't liked this post yet, so add a like
        const { error: likeError } = await supabase
          .from('community_likes')
          .insert([{ user_id: userId, post_id: postId }]);

        if (likeError) {
          return { success: false, error: likeError };
        }

        // Increment the likes count on the post
        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ likes_count: supabase.rpc('increment', { inc: 1 }) })
          .eq('id', postId);

        if (updateError) {
          console.error('Error updating post likes count:', updateError);
        }

        return { success: true, error: null };
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      return { success: false, error };
    }
  }

  /**
   * Check if a user has liked a post
   */
  static async hasUserLikedPost(userId: string, postId: string): Promise<{ liked: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (error) {
        return { liked: false, error };
      }

      return { liked: !!data, error: null };
    } catch (error) {
      console.error('Error checking if user liked post:', error);
      return { liked: false, error };
    }
  }
}
