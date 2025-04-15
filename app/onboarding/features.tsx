import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialCommunityIcons as IconType } from '@expo/vector-icons';

export default function FeaturesScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/final');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons name="music-box-multiple" size={48} color="#0A7EA4" />
            <ThemedText type="title" style={styles.title}>
              Key Features
            </ThemedText>
          </View>

          <View style={styles.features}>
            <Feature
              icon="star"
              title="Rate & Review"
              description="Share your thoughts on songs with a simple 5-star rating system and optional comments"
            />
            <Feature
              icon="account-group"
              title="Follow & Discover"
              description="Connect with friends and discover new music through their reviews and ratings"
            />
            <Feature
              icon="playlist-music"
              title="Music Profile"
              description="Build your personal music profile with your favorite songs and artists"
            />
            <Feature
              icon="history"
              title="Listening History"
              description="Track your music journey and see how your taste evolves over time"
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Almost There
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Feature({ icon, title, description }: { 
  icon: keyof typeof IconType.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color="#0A7EA4" />
        </View>
        <View style={styles.featureText}>
          <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
            {title}
          </ThemedText>
          <ThemedText style={styles.featureDescription}>{description}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
  },
  features: {
    gap: 16,
  },
  feature: {
    backgroundColor: '#0A7EA410',
    padding: 16,
    borderRadius: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A7EA420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 17,
  },
  featureDescription: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: '#0A7EA4',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
}); 