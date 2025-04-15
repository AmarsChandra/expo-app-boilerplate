import { StyleSheet, View, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity as GestureTouchableOpacity } from 'react-native-gesture-handler';
import { useSuperwall } from '@/hooks/useSuperwall';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SUPERWALL_TRIGGERS } from '@/config/superwall';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialCommunityIcons as IconType } from '@expo/vector-icons';
import { useState } from 'react';

export default function FinalScreen() {
  const { showPaywall } = useSuperwall();
  const { setIsOnboarded } = useOnboarding();
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGetStarted = async () => {
    try {
      setIsSignUpModalVisible(true);
    } catch (error) {
      console.error('Failed to open sign-up modal:', error);
    }
  };

  const handleSignUp = () => {
    // Here you would typically handle the sign-up logic with your backend
    console.log('Sign up with:', email, password);
    setIsSignUpModalVisible(false);
    setIsOnboarded(true);
  };

  const handleLogin = () => {
    // Here you would typically handle the login logic with your backend
    console.log('Login with:', email, password);
    setIsSignUpModalVisible(false);
    setIsOnboarded(true);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="play-circle" size={48} color="#0A7EA4" />
            <ThemedText type="title" style={styles.title}>
              Start Your Music Journey
            </ThemedText>
            <ThemedText style={styles.description}>
              Join a community of music lovers sharing their passion for songs and discovering new tracks together.
            </ThemedText>
          </View>

          <View style={styles.benefits}>
            <Benefit icon="music" text="Rate your favorite songs" />
            <Benefit icon="account-plus" text="Connect with friends" />
            <Benefit icon="playlist-star" text="Build your music profile" />
          </View>

          <GestureTouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <ThemedText style={styles.buttonText}>Start Listening</ThemedText>
          </GestureTouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isSignUpModalVisible}
        onRequestClose={() => setIsSignUpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={isLoginMode ? handleLogin : handleSignUp}
            >
              <ThemedText style={styles.buttonText}>
                {isLoginMode ? 'Login' : 'Sign Up'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
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

function Benefit({ icon, text }: { icon: keyof typeof IconType.glyphMap; text: string }) {
  return (
    <View style={styles.benefitContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color="#0A7EA4" />
      </View>
      <ThemedText style={styles.benefitText}>{text}</ThemedText>
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
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 28,
    opacity: 0.7,
  },
  benefits: {
    gap: 16,
    paddingBottom: 24,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#0A7EA410',
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A7EA420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 17,
  },
  button: {
    backgroundColor: '#0A7EA4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  signUpButton: {
    backgroundColor: '#0A7EA4',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  switchModeText: {
    marginTop: 10,
    color: '#0A7EA4',
  },
}); 