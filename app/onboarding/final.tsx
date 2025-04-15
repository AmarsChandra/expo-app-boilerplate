import { StyleSheet, View, ScrollView, Modal, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
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
import { supabaseService } from '@/services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FinalScreen() {
  const { showPaywall } = useSuperwall();
  const { setIsOnboarded } = useOnboarding();
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    try {
      setIsSignUpModalVisible(true);
    } catch (error) {
      console.error('Failed to open sign-up modal:', error);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabaseService.signUp(email, password);
      
      if (error) {
        Alert.alert('Sign Up Error', error.message);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        Alert.alert('Error', 'An account with this email already exists');
        return;
      }

      Alert.alert(
        'Success',
        'Please check your email for a confirmation link to complete your registration.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsSignUpModalVisible(false);
              setIsOnboarded(true);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseService.signIn(email, password);
      
      if (error) {
        Alert.alert('Login Error', error.message);
        return;
      }

      setIsSignUpModalVisible(false);
      setIsOnboarded(true);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              editable={!isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={isLoginMode ? handleLogin : handleSignUp}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Sign Up')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} disabled={isLoading}>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2, // 3/5 of screen height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#0A7EA4',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  switchModeText: {
    marginTop: 20,
    color: '#0A7EA4',
    fontSize: 16,
  },
}); 