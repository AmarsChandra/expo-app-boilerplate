import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Image, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabaseService, type Profile, type Review } from '../../src/services/supabase';

type ReviewWithProfile = Review & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

type ProfileModalProps = {
  profile: Profile;
  visible: boolean;
  onClose: () => void;
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

export function ProfileModal({ profile, visible, onClose }: ProfileModalProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
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
    if (visible) {
      fetchReviews();
    }
  }, [visible, profile.id]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={styles.header}>
            <View style={styles.profileInfo}>
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
              ) : (
                <View style={[styles.profileAvatar, styles.defaultAvatar]}>
                  <MaterialCommunityIcons name="account" size={40} color="#666" />
                </View>
              )}
              <View style={styles.userInfo}>
                <ThemedText style={styles.username}>{profile.username}</ThemedText>
                {profile.bio && <ThemedText style={styles.bio}>{profile.bio}</ThemedText>}
              </View>
            </View>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="#666"
              style={styles.closeButton}
              onPress={onClose}
            />
          </View>

          <FlatList
            data={reviews}
            renderItem={({ item }) => (
              <ReviewCard
                review={item}
                onPress={() => {}}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.reviewsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            ListEmptyComponent={
              isLoading ? (
                <ActivityIndicator style={styles.loader} />
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No reviews yet</ThemedText>
                </View>
              )
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    padding: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  reviewsList: {
    flexGrow: 1,
  },
  listContent: {
    paddingTop: 24,
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
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
}); 