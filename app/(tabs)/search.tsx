import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Profile } from '@/src/services/supabase';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';

type SearchResult = Profile & {
  isFollowing: boolean;
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const [arrowAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const searchProfiles = async (query: string) => {
    if (!query.trim()) {
      setProfiles([]);
      setShowArrow(true);
      return;
    }

    setLoading(true);
    setShowArrow(false);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, created_at, updated_at')
        .ilike('username', `%${query}%`)
        .order('username');

      if (error) throw error;

      if (data) {
        // Check following status for each profile
        const profilesWithFollowing = await Promise.all(
          data.map(async (profile) => {
            const { data: followingData } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', user?.id)
              .eq('following_id', profile.id)
              .single();

            return {
              ...profile,
              isFollowing: !!followingData,
            };
          })
        );

        setProfiles(profilesWithFollowing);
      }
    } catch (error) {
      console.error('Error searching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchProfiles(text);
  };

  const handleProfilePress = (profile: SearchResult) => {
    router.push({
      pathname: '/profile-modal',
      params: { profileId: profile.id }
    });
  };

  const handleFollow = async (profile: SearchResult) => {
    if (!user) return;

    try {
      if (profile.isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
      } else {
        await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: profile.id }]);
      }

      // Update the local state
      setProfiles(profiles.map(p => 
        p.id === profile.id 
          ? { ...p, isFollowing: !p.isFollowing }
          : p
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>

        {showArrow && (
          <View style={styles.arrowContainer}>
            <Animated.View
              style={[
                styles.arrow,
                {
                  transform: [
                    {
                      translateY: arrowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="arrow-up" size={24} color="#666" />
            </Animated.View>
            <ThemedText style={styles.arrowText}>Search for other users here</ThemedText>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.profileItem}
                onPress={() => handleProfilePress(item)}
              >
                <Image
                  source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }}
                  style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                  <ThemedText style={styles.username}>{item.username}</ThemedText>
                  {item.display_name && (
                    <ThemedText style={styles.displayName}>{item.display_name}</ThemedText>
                  )}
                </View>
                {user?.id !== item.id && (
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      item.isFollowing && styles.followingButton
                    ]}
                    onPress={() => handleFollow(item)}
                  >
                    <ThemedText style={[
                      styles.followButtonText,
                      item.isFollowing && styles.followingButtonText
                    ]}>
                      {item.isFollowing ? 'Following' : 'Follow'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
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
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    width: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  arrowContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  arrow: {
    marginBottom: 10,
  },
  arrowText: {
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    width: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
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
}); 

