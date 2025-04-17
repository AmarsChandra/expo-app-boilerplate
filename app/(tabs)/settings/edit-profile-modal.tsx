import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { supabaseService, type Profile } from '../../../src/services/supabase';
import { ThemedText } from '../../../components/ThemedText';

type EditProfileModalProps = {
  profile: Profile;
  visible: boolean;
  onClose: (updatedProfile?: Profile) => void;
};

export default function EditProfileModal({ profile, visible, onClose }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUsername(profile.username);
  }, [profile]);

  const handleSave = async () => {
    const formattedUsername = username.trim().toLowerCase();
    
    if (!formattedUsername) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabaseService.updateProfile(profile.id, {
        username: formattedUsername,
        avatar_url: profile.avatar_url,
        display_name: profile.display_name,
        bio: profile.bio,
      });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      onClose({
        ...profile,
        username: formattedUsername,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => onClose()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <ThemedText type="title" style={styles.modalTitle}>Edit Profile</ThemedText>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => onClose()}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '50%',
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#0A7EA4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
  },
}); 