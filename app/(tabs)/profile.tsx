import { StyleSheet, View, FlatList, Image, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService, type Review, type Profile } from '../../src/services/supabase';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import ReviewDetailModal from './feed/review-detail-modal';

type ReviewWithProfile = Review & {
  profiles: {
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

  const truncateText = (text: string) => {
    return text.length > 23 ? text.substring(0, 23) + '...' : text;
  };

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
              <ThemedText style={styles.username} numberOfLines={1}>{truncateText(review.profiles.username)}</ThemedText>
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
            <ThemedText style={styles.songTitle} numberOfLines={1}>{truncateText(review.song_title)}</ThemedText>
            <ThemedText style={styles.artistName} numberOfLines={1}>{truncateText(review.artist_name)}</ThemedText>
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

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfile | null>(null);
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabaseService.getProfile(user.id);
      if (error) throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?.id) {
        setIsSignInModalVisible(true);
        return;
      }

      const { data, error: reviewError } = await supabaseService.getReviewsByUser(user.id);
      
      if (reviewError) throw reviewError;
      
      if (data) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsAuthLoading(true);
      const { data, error } = await supabaseService.signIn(email, password);
      
      if (error) {
        Alert.alert('Login Error', error.message || 'An error occurred during login');
        return;
      }

      if (data?.user) {
        setUser(data.user);
        setIsSignInModalVisible(false);
        setEmail('');
        setPassword('');
        fetchReviews();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsAuthLoading(true);
      const { data, error } = await supabaseService.signUp(email, password);
      
      if (error) {
        Alert.alert('Sign Up Error', error.message || 'An error occurred during sign up');
        return;
      }

      if (data?.user?.identities?.length === 0) {
        Alert.alert('Error', 'An account with this email already exists');
        return;
      }

      // After successful sign-up, automatically sign in
      const { data: signInData, error: signInError } = await supabaseService.signIn(email, password);
      
      if (signInError) {
        Alert.alert('Error', 'Account created but failed to sign in. Please try signing in manually.');
        return;
      }

      if (signInData?.user) {
        setUser(signInData.user);
        setIsSignInModalVisible(false);
        setEmail('');
        setPassword('');
        fetchReviews();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
    fetchReviews();
  }, [user?.id]);

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Please sign in to view your profile</ThemedText>
          </View>
        </SafeAreaView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isSignInModalVisible}
          onRequestClose={() => setIsSignInModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <ThemedText type="title" style={styles.modalTitle}>
                {isLoginMode ? 'Login' : 'Sign Up'}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isAuthLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isAuthLoading}
              />
              <TouchableOpacity
                style={[styles.signUpButton, isAuthLoading && styles.buttonDisabled]}
                onPress={isLoginMode ? handleSignIn : handleSignUp}
                disabled={isAuthLoading}
              >
                <ThemedText style={styles.buttonText}>
                  {isAuthLoading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Sign Up')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} disabled={isAuthLoading}>
                <ThemedText style={styles.switchModeText}>
                  {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ThemedText>Loading reviews...</ThemedText>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : reviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText>No reviews yet</ThemedText>
              </View>
            ) : (
              <>
                <View style={styles.profileHeader}>
                  <View style={styles.profileInfo}>
                    {profile?.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
                    ) : (
                      <View style={[styles.profileAvatar, styles.profileDefaultAvatar]}>
                        <MaterialCommunityIcons name="account" size={24} color="#666" />
                      </View>
                    )}
                    <ThemedText style={styles.profileUsername}>{profile?.username || 'User'}</ThemedText>
                  </View>
                </View>
                <FlatList
                  data={reviews}
                  renderItem={({ item }) => (
                    <ReviewCard
                      review={item}
                      onPress={() => setSelectedReview(item)}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.reviewsList}
                />
              </>
            )}
          </View>
        </ScrollView>

        <ReviewDetailModal
          review={selectedReview!}
          visible={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
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
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewsList: {
    paddingBottom: 20,
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
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
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
  albumCover: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  contentSection: {
    flex: 1,
  },
  albumInfo: {
    marginBottom: 12,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  ratingContainer: {
    marginBottom: 12,
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
    lineHeight: 20,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    height: '50%',
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
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#0A7EA4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeText: {
    color: '#0A7EA4',
    fontSize: 14,
    textAlign: 'center',
  },
  profileHeader: {
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
    paddingLeft: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileDefaultAvatar: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileUsername: {
    fontSize: 24,
    fontWeight: '600',
  },
}); 