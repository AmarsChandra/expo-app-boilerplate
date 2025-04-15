import { createClient } from '@supabase/supabase-js';
import { supabaseService } from './supabase';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export type Album = {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
};

export const spotifyService = {
  async searchAlbums(query: string): Promise<Album[]> {
    try {
      const { data: { session } } = await supabaseService.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${session.provider_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search albums');
      }

      const data = await response.json();
      return data.albums.items;
    } catch (error) {
      console.error('Error searching albums:', error);
      throw error;
    }
  },

  async getAlbumDetails(albumId: string): Promise<Album> {
    try {
      const { data: { session } } = await supabaseService.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${SPOTIFY_API_URL}/albums/${albumId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.provider_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get album details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting album details:', error);
      throw error;
    }
  },
}; 