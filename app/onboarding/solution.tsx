import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SolutionScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/features');
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
            <MaterialCommunityIcons name="lightbulb-on" size={48} color="#0A7EA4" />
            <ThemedText type="title" style={styles.title}>
              Introducing Loop
            </ThemedText>
          </View>

          <View style={styles.mainFeature}>
            <ThemedText type="defaultSemiBold" style={styles.mainTitle}>
              Your Personal Music Journal
            </ThemedText>
            <ThemedText style={styles.mainDescription}>
              A dedicated space to rate, review, and share your favorite songs with friends and fellow music enthusiasts.
            </ThemedText>
          </View>

          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#0A7EA4" />
              <ThemedText style={styles.benefitText}>
                Rate and review songs with a simple 5-star system
              </ThemedText>
            </View>
            <View style={styles.benefit}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#0A7EA4" />
              <ThemedText style={styles.benefitText}>
                Follow friends and discover their music taste
              </ThemedText>
            </View>
            <View style={styles.benefit}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#0A7EA4" />
              <ThemedText style={styles.benefitText}>
                Build your music profile and track your listening history
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Show Me How
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  mainFeature: {
    backgroundColor: '#0A7EA410',
    padding: 24,
    borderRadius: 20,
    gap: 8,
  },
  mainTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  mainDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefits: {
    gap: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0A7EA408',
    padding: 16,
    borderRadius: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
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