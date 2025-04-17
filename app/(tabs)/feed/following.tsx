import { StyleSheet, View, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService, type Review } from '@/services/supabase';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReviewDetailModal from './review-detail-modal';
import { useAuth } from '@/src/contexts/AuthContext';

type ReviewWithProfile = Review & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  album_cover_url?: string;
};

export default function FollowingFeedScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfile | null>(null);

  const fetchFollowingReviews = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data: followingData } = await supabaseService.getFollowing(user.id);
      
      if (!followingData || followingData.length === 0) {
        setReviews([]);
        return;
      }

      const followingIds = followingData.map(follow => follow.following_id);
      const { data: reviewsData, error } = await supabaseService.getReviews();
      
      if (error) throw error;
      
      if (reviewsData) {
        const followingReviews = reviewsData.filter(review => 
          followingIds.includes(review.user_id)
        );
        setReviews(followingReviews);
      }
    } catch (err) {
      console.error('Error fetching following reviews:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFollowingReviews();
  };

  useEffect(() => {
    fetchFollowingReviews();
  }, [user]);

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Please sign in to see reviews from users you follow
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={reviews}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.reviewCard}
              onPress={() => setSelectedReview(item)}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  {item.profiles.avatar_url ? (
                    <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.defaultAvatar]}>
                      <MaterialCommunityIcons name="account" size={24} color="#666" />
                    </View>
                  )}
                  <View style={styles.userTextContainer}>
                    <ThemedText style={styles.username}>{item.profiles.username}</ThemedText>
                    <ThemedText style={styles.date}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>
                {item.album_cover_url && (
                  <Image source={{ uri: item.album_cover_url }} style={styles.albumCover} />
                )}
              </View>

              <View style={styles.contentSection}>
                <View style={styles.albumInfo}>
                  <ThemedText style={styles.songTitle}>{item.song_title}</ThemedText>
                  <ThemedText style={styles.artistName}>{item.artist_name}</ThemedText>
                </View>

                <View style={styles.ratingContainer}>
                  <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, index) => (
                      <MaterialCommunityIcons
                        key={index}
                        name={index < item.rating ? "star" : "star-outline"}
                        size={20}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>

                {item.comment && (
                  <View style={styles.commentContainer}>
                    <ThemedText style={styles.commentText}>{item.comment}</ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>Loading...</ThemedText>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  Follow some users to see their reviews here!
                </ThemedText>
              </View>
            )
          }
        />
      </SafeAreaView>

      <ReviewDetailModal
        review={selectedReview}
        visible={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />
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
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  albumCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  contentSection: {
    marginTop: 12,
  },
  albumInfo: {
    marginBottom: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  commentContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
}); 