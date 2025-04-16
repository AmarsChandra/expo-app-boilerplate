import { StyleSheet, View, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ReviewWithProfile = {
  id: string;
  user_id: string;
  song_title: string;
  artist_name: string;
  rating: number;
  comment: string | null;
  album_cover_url?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

type ReviewDetailModalProps = {
  review: ReviewWithProfile | null;
  visible: boolean;
  onClose: () => void;
};

export default function ReviewDetailModal({ review, visible, onClose }: ReviewDetailModalProps) {
  if (!review) return null;

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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
          
          <View style={styles.header}>
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
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {review.album_cover_url && (
              <Image 
                source={{ uri: review.album_cover_url }} 
                style={styles.albumCover}
              />
            )}

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
                    size={24}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>

            {review.comment && (
              <View style={styles.commentContainer}>
                <ThemedText style={styles.content}>{review.comment}</ThemedText>
              </View>
            )}
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  albumCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  albumInfo: {
    marginBottom: 20,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  commentContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 