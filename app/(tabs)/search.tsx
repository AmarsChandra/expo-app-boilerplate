import { StyleSheet, View, FlatList, Image, TouchableOpacity, TextInput, Animated } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService, type Profile } from '../../src/services/supabase';
import { useState, useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileModal } from './profile-modal';

function ProfileCard({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <MaterialCommunityIcons name="account" size={24} color="#666" />
            </View>
          )}
          <ThemedText style={styles.username}>{profile.username}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showArrow, setShowArrow] = useState(true);
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showArrow) {
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
    }
  }, [showArrow]);

  const searchProfiles = async (query: string) => {
    if (!query.trim()) {
      setProfiles([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await supabaseService.searchProfiles(query);
      setProfiles(results);
      setShowArrow(false);
    } catch (err) {
      console.error('Error searching profiles:', err);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchProfiles(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleProfilePress = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  const arrowStyle = {
    transform: [
      {
        translateY: arrowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        rotate: '180deg',
      },
    ],
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search profiles..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
          
          {searchQuery && (
            <View style={styles.dropdownContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ThemedText>Searching...</ThemedText>
                </View>
              ) : profiles.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <ThemedText>No profiles found</ThemedText>
                </View>
              ) : (
                <FlatList
                  data={profiles}
                  renderItem={({ item }) => (
                    <ProfileCard
                      profile={item}
                      onPress={() => handleProfilePress(item)}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.dropdownContent}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          )}
        </View>

        {showArrow && !searchQuery && (
          <View style={styles.arrowContainer}>
            <Animated.View style={[styles.arrow, arrowStyle]}>
              <MaterialCommunityIcons name="arrow-down" size={32} color="#0A7EA4" />
            </Animated.View>
            <ThemedText style={styles.arrowText}>Search for other users here</ThemedText>
          </View>
        )}

        {selectedProfile && (
          <ProfileModal
            profile={selectedProfile}
            visible={!!selectedProfile}
            onClose={() => setSelectedProfile(null)}
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
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownContent: {
    padding: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -100 }],
  },
  arrow: {
    marginBottom: 8,
  },
  arrowText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
}); 