import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Linking, Modal, TextInput } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabaseService, type Profile } from '../../src/services/supabase';
import EditProfileModal from './settings/edit-profile-modal';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabaseService.getProfile(user.id);
      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirmation = async () => {
    if (confirmationText !== 'CONFIRM') {
      Alert.alert('Error', 'Please type CONFIRM in all caps to delete your account');
      return;
    }

    try {
      await supabaseService.deleteAccount();
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleteModalVisible(false);
      setConfirmationText('');
    }
  };

  const handleTermsPrivacy = () => {
    Linking.openURL('https://www.freeprivacypolicy.com/live/031ebefd-631b-476e-9c7e-72f0a4883912');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setIsEditModalVisible(true)}
        >
          <MaterialCommunityIcons name="account-edit" size={24} color="#666" />
          <ThemedText style={styles.buttonText}>Edit Profile</ThemedText>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleTermsPrivacy}
        >
          <MaterialCommunityIcons name="file-document" size={24} color="#666" />
          <ThemedText style={styles.buttonText}>Terms & Privacy</ThemedText>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#666" />
          <ThemedText style={styles.buttonText}>Log Out</ThemedText>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
          <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
          <ThemedText style={[styles.buttonText, styles.deleteText]}>Delete Account</ThemedText>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {profile && (
        <EditProfileModal
          profile={profile}
          visible={isEditModalVisible}
          onClose={(updatedProfile) => {
            setIsEditModalVisible(false);
            if (updatedProfile) {
              setProfile(updatedProfile);
            }
          }}
        />
      )}

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Delete Account</ThemedText>
            <ThemedText style={styles.modalText}>
              This action cannot be undone. All your data will be permanently deleted.
            </ThemedText>
            <ThemedText style={styles.modalText}>
              Type CONFIRM in all caps to delete your account:
            </ThemedText>
            <TextInput
              style={styles.confirmationInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="Type CONFIRM here"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setConfirmationText('');
                }}
              >
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteConfirmation}
              >
                <ThemedText style={[styles.modalButtonText, styles.deleteText]}>
                  Delete Account
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 55,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
  },
  deleteText: {
    color: '#FF3B30',
  },
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
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  confirmationInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
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
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 