import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from 'react-native-dotenv';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  song_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export const supabaseService = {
  // Auth functions
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signUp: async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up with:', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return { data: null, error };
      }

      if (!data.user) {
        console.error('No user data returned');
        return {
          data: null,
          error: new Error('Failed to create user')
        };
      }

      console.log('Successfully created user');
      return { data, error: null };
    } catch (error) {
      console.error('Signup process error:', error);
      return { data: null, error };
    }
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    return await supabase.auth.getSession();
  },

  // Profile functions
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Follow functions
  followUser: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .insert([
        {
          follower_id: followerId,
          following_id: followingId,
        }
      ]);

    return { data, error };
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    return { data, error };
  },

  getFollowers: async (userId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, profiles(*)')
      .eq('following_id', userId);

    return { data, error };
  },

  getFollowing: async (userId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles(*)')
      .eq('follower_id', userId);

    return { data, error };
  },

  // Review functions
  createReview: async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();

    return { data, error };
  },

  updateReview: async (reviewId: string, updates: Partial<Review>) => {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    return { data, error };
  },

  deleteReview: async (reviewId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    return { data, error };
  },

  getReviewsByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  getReviewsBySong: async (songId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(*)')
      .eq('song_id', songId)
      .order('created_at', { ascending: false });

    return { data, error };
  },
}; 