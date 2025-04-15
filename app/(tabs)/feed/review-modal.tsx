import { StyleSheet, View, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabaseService } from '@/services/supabase';

type ReviewModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ReviewModal({ visible, onClose }: ReviewModalProps) {
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateReview = async () => {
    if (!albumName || !artistName || !rating || !reviewText) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      Alert.alert('Error', 'Rating must be a number between 0 and 10');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseService.createReview({
        song_id: `${artistName} - ${albumName}`, // Using a simple ID for now
        rating: ratingNum,
        content: reviewText,
      });

      if (error) throw error;

      Alert.alert('Success', 'Review created successfully!');
      onClose();
      // Reset form
      setAlbumName('');
      setArtistName('');
      setRating('');
      setReviewText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <ThemedText type="title" style={styles.modalTitle}>
            Create Review
          </ThemedText>
          
          <TextInput
            style={styles.input}
            placeholder="Album Name"
            value={albumName}
            onChangeText={setAlbumName}
            editable={!isLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Artist Name"
            value={artistName}
            onChangeText={setArtistName}
            editable={!isLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Rating (0-10)"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            editable={!isLoading}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Review"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.buttonDisabled]}
            onPress={handleCreateReview}
            disabled={isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Review'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
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
    width: '100%',
    height: '80%',
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  createButton: {
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
}); 