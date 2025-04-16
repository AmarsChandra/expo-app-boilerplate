import { StyleSheet, View, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService, type Profile } from '../../src/services/supabase';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  const searchProfiles = async (query: string) => {
    if (!query.trim()) {
      setProfiles([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabaseService.searchProfiles(query);
      
      if (error) throw error;
      
      if (data) {
        setProfiles(data);
      }
    } catch (err) {
      console.error('Error searching profiles:', err);
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
    router.push({
      pathname: '/profile/[id]',
      params: { id: profile.id }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search profiles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedText>Searching...</ThemedText>
          </View>
        ) : profiles.length === 0 && searchQuery ? (
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
            contentContainerStyle={styles.listContent}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  profileCard: {
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 