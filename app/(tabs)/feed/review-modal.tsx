import { StyleSheet, View, Modal, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabase';

// Types
type Artist = {
  id: string;
  name: string;
};

type Album = {
  id: string;
  name: string;
  artists: Artist[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
};

type ReviewModalProps = {
  visible: boolean;
  onClose: () => void;
};

// Spotify API functions
const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

console.log('Spotify credentials loaded:', {
  clientIdLength: SPOTIFY_CLIENT_ID?.length,
  secretLength: SPOTIFY_CLIENT_SECRET?.length,
  clientIdFirstChar: SPOTIFY_CLIENT_ID?.[0],
  secretFirstChar: SPOTIFY_CLIENT_SECRET?.[0],
});

const getSpotifyToken = async () => {
  try {
    const credentials = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
    const base64Credentials = btoa(credentials);
    
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
    console.log('Token response:', data);

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
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ReviewModal({ visible, onClose }: ReviewModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const searchAlbums = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchSpotifyAlbums(debouncedSearchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching albums:', error);
        Alert.alert('Error', 'Failed to search albums. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    searchAlbums();
  }, [debouncedSearchQuery]);

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setSearchQuery(album.name);
    setSearchResults([]);
  };

  const handleCreateReview = async () => {
    if (!selectedAlbum || !rating || !reviewText) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      Alert.alert('Error', 'Rating must be a number between 0 and 10');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseService.createReview({
        song_id: selectedAlbum.id,
        rating: ratingNum,
        content: reviewText,
        album_name: selectedAlbum.name,
        artist_name: selectedAlbum.artists[0].name,
        album_image_url: selectedAlbum.images[0]?.url || null,
      });

      if (error) throw error;

      Alert.alert('Success', 'Review created successfully!');
      onClose();
      // Reset form
      setSearchQuery('');
      setSelectedAlbum(null);
      setRating('');
      setReviewText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <ThemedText type="title" style={styles.modalTitle}>
            Create Review
          </ThemedText>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search for an album..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!isLoading}
            />
            {isSearching && (
              <ThemedText style={{ textAlign: 'center', marginBottom: 10 }}>
                Searching...
              </ThemedText>
            )}
            {searchResults.length > 0 && (
              <ScrollView style={styles.searchResults}>
                {searchResults.map((album) => (
                  <TouchableOpacity
                    key={album.id}
                    style={styles.albumItem}
                    onPress={() => handleAlbumSelect(album)}
                  >
                    {album.images[0] && (
                      <Image
                        source={{ uri: album.images[0].url }}
                        style={styles.albumImage}
                      />
                    )}
                    <View style={styles.albumInfo}>
                      <ThemedText style={styles.albumName}>{album.name}</ThemedText>
                      <ThemedText style={styles.artistName}>
                        {album.artists.map((artist) => artist.name).join(', ')}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {selectedAlbum && (
            <View style={styles.selectedAlbumContainer}>
              {selectedAlbum.images[0] && (
                <Image
                  source={{ uri: selectedAlbum.images[0].url }}
                  style={styles.selectedAlbumImage}
                />
              )}
              <View style={styles.selectedAlbumInfo}>
                <ThemedText style={styles.selectedAlbumName}>
                  {selectedAlbum.name}
                </ThemedText>
                <ThemedText style={styles.selectedArtistName}>
                  {selectedAlbum.artists.map((artist) => artist.name).join(', ')}
                </ThemedText>
              </View>
            </View>
          )}

          {selectedAlbum && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Rating (0-10)"
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric"
                editable={!isLoading}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your review..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                editable={!isLoading}
              />
              
              <TouchableOpacity
                style={[styles.createButton, isLoading && styles.buttonDisabled]}
                onPress={handleCreateReview}
                disabled={isLoading}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? 'Creating...' : 'Create Review'}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  searchContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  searchResults: {
    maxHeight: 300,
    width: '100%',
    position: 'absolute',
    top: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  albumItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  albumImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  createButton: {
    backgroundColor: '#0A7EA4',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    marginTop: 20,
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  selectedAlbumContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAlbumImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  selectedAlbumInfo: {
    flex: 1,
  },
  selectedAlbumName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedArtistName: {
    fontSize: 16,
    color: '#666',
  },
}); 