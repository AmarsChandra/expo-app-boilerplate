import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseService, type Profile, type Review } from '@/src/services/supabase';
import ReviewDetailModal from '@/app/(tabs)/feed/review-detail-modal';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/src/services/supabase';

type ReviewWithProfile = Review & {
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

function ReviewCard({ review, onPress }: { review: ReviewWithProfile; onPress: () => void }) {
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <TouchableOpacity onPress={onPress}>
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
              <ThemedText style={styles.reviewUsername} numberOfLines={1}>{review.profiles.username}</ThemedText>
              <ThemedText style={styles.date}>{formattedDate}</ThemedText>
            </View>
          </View>
          {review.album_cover_url && (
            <Image 
              source={{ uri: review.album_cover_url }} 
              style={styles.albumCover}
            />
          )}
        </View>

        <View style={styles.contentSection}>
          <View style={styles.albumInfo}>
            <ThemedText style={styles.songTitle} numberOfLines={1}>{review.song_title}</ThemedText>
            <ThemedText style={styles.artistName} numberOfLines={1}>{review.artist_name}</ThemedText>
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
          </View>

          {review.comment && (
            <View style={styles.commentContainer}>
              <ThemedText style={styles.commentText} numberOfLines={1}>{review.comment}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileModal() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!profileId) return;
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabaseService.getProfile(profileId);
      if (profileError) throw profileError;

      // Get followers count
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', profileId);
      if (followersError) throw followersError;

      // Get following count
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profileId);
      if (followingError) throw followingError;

      if (profileData) {
        setProfile({
          ...profileData,
          followers_count: followersData?.length || 0,
          following_count: followingData?.length || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const checkFollowingStatus = async () => {
    if (!user || !profile) return;
    try {
      const { data } = await supabaseService.getFollowing(user.id);
      if (data) {
        const isFollowingUser = data.some(follow => follow.profiles[0]?.id === profile.id);
        setIsFollowing(isFollowingUser);
      }
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !profile) return;
    try {
      if (isFollowing) {
        await supabaseService.unfollowUser(user.id, profile.id);
      } else {
        await supabaseService.followUser(user.id, profile.id);
      }
      setIsFollowing(!isFollowing);
      // Refresh profile data to update counts
      await fetchProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const fetchReviews = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabaseService.getReviewsByUser(profile.id);
      
      if (error) throw error;
      
      if (data) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
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
    fetchProfile();
  }, [profileId]);

  useEffect(() => {
    if (profile && user) {
      checkFollowingStatus();
      fetchReviews();
    }
  }, [profile, user]);

  if (!profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>{profile.username}</ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.profileSection}>
          {profile.bio && (
            <ThemedText style={styles.bio}>{profile.bio}</ThemedText>
          )}
        </View>

        <View style={styles.reviewsSection}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onPress={() => setSelectedReview(review)}
            />
          ))}
          {!isLoading && reviews.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No reviews yet</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          visible={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollContent: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
  },
  reviewsSection: {
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    marginBottom: 20,
  },
  followingButton: {
    backgroundColor: '#eee',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#666',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTextContainer: {
    marginLeft: 12,
  },
  reviewUsername: {
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
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
}); 