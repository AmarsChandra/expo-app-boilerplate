import { Album, Artist } from '@/types/spotify';
import { Buffer } from 'buffer';

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

const getSpotifyToken = async () => {
  try {
    const credentials = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    
    console.log('Token request details:', {
      credentialsLength: credentials.length,
      base64CredentialsLength: base64Credentials.length,
      base64CredentialsFirstChars: base64Credentials.substring(0, 10) + '...'
    });

    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('Token response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (!response.ok) {
      console.error('Token error:', data);
      throw new Error(`Failed to get token: ${data.error_description || 'Unknown error'}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};

const searchSpotifyAlbums = async (query: string): Promise<Album[]> => {
  try {
    const token = await getSpotifyToken();
    console.log('Got token:', token);
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseData = await response.json();
    console.log('Spotify API response:', responseData);

    if (!response.ok) {
      console.error('Spotify API error:', responseData);
      throw new Error(`Failed to search albums: ${responseData.error?.message || 'Unknown error'}`);
    }

    return responseData.albums.items;
  } catch (error) {
    console.error('Error searching albums:', error);
    throw error;
  }
};

export const spotifyService = {
  async searchAlbums(query: string): Promise<Album[]> {
    try {
      const token = await getSpotifyToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const token = await getSpotifyToken();
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get album details');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting album details:', error);
      throw error;
    }
  },
}; 