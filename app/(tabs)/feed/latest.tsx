import { StyleSheet, View, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService } from '@/services/supabase';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ReviewWithProfile = {
  id: string;
  user_id: string;
  song_title: string;
  artist_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

function ReviewCard({ review }: { review: ReviewWithProfile }) {
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {review.profiles.avatar_url ? (
            <Image source={{ uri: review.profiles.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <MaterialCommunityIcons name="account" size={24} color="#666" />
            </View>
          )}
          <View style={styles.userTextContainer}>
            <ThemedText style={styles.username}>{review.profiles.username}</ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.albumInfo}>
        <ThemedText style={styles.songTitle}>{review.song_title}</ThemedText>
        <ThemedText style={styles.artistName}>{review.artist_name}</ThemedText>
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.ratingStars}>
          {[...Array(5)].map((_, index) => (
            <MaterialCommunityIcons
              key={index}
              name={index < review.rating ? "star" : "star-outline"}
              size={20}
              color="#FFD700"
            />
          ))}
        </View>
        <ThemedText style={styles.ratingText}>{review.rating.toFixed(1)}</ThemedText>
      </View>

      {review.comment && (
        <View style={styles.commentContainer}>
          <ThemedText style={styles.content}>{review.comment}</ThemedText>
        </View>
      )}
    </View>
  );
}

export default function LatestFeedScreen() {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting to fetch reviews...');
      
      const { data, error: reviewError } = await supabaseService.getReviews();
      
      if (reviewError) {
        console.error('Error fetching reviews:', reviewError);
        throw reviewError;
      }

      console.log('Raw data from getReviews:', JSON.stringify(data, null, 2));
      
      if (!data) {
        console.log('No data returned from getReviews');
        setReviews([]);
        return;
      }

      // Ensure data is in the correct format
      const formattedReviews = data.map((review: any) => {
        console.log('Processing review:', review);
        return {
          ...review,
          profiles: review.profiles || { username: 'Unknown', avatar_url: null }
        };
      });

      console.log('Formatted reviews:', JSON.stringify(formattedReviews, null, 2));
      setReviews(formattedReviews);
    } catch (err) {
      console.error('Error in fetchReviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  useEffect(() => {
    console.log('LatestFeedScreen mounted');
    fetchReviews();
  }, []);

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        {isLoading && !refreshing ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.loadingText}>Loading reviews...</ThemedText>
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No reviews yet</ThemedText>
          </View>
        ) : (
          <FlatList
            data={reviews}
            renderItem={({ item }) => <ReviewCard review={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  albumInfo: {
    marginBottom: 12,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  commentContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0A7EA4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 