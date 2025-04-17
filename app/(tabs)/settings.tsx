import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
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
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabaseService.deleteAccount();
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
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
        <TouchableOpacity style={styles.button}>
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
}); 