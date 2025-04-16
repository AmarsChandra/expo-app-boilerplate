import 'react-native-url-polyfill/auto';
import { createClient, AuthError, Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  Constants.expoConfig?.extra?.SUPABASE_URL ?? '',
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

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
  song_title: string;
  artist_name: string;
  rating: number;
  comment?: string;
  album_cover_url?: string;
  created_at: string;
  updated_at: string;
};

export const supabaseService = {
  supabase,
  // Auth functions
  signIn: async (email: string, password: string): Promise<{ data: any; error: AuthError | null }> => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signUp: async (email: string, password: string): Promise<{ data: any; error: AuthError | null }> => {
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
          error: new Error('Failed to create user') as AuthError
        };
      }

      console.log('Successfully created user');
      return { data, error: null };
    } catch (error) {
      console.error('Signup process error:', error);
      return { data: null, error: error as AuthError };
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

  deleteAccount: async () => {
    const { error } = await supabase.auth.admin.deleteUser(
      (await supabase.auth.getUser()).data.user?.id ?? ''
    );
    if (error) throw error;
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
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
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

  getReviews: async () => {
    console.log('Fetching reviews from Supabase...');
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        song_title,
        artist_name,
        rating,
        comment,
        album_cover_url,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    console.log('Supabase response:', { data, error });
    return { data, error };
  },

  searchProfiles: async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .order('username', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },
}; 