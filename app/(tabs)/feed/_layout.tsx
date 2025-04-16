import { Stack } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReviewModal from './review-modal';

export default function FeedLayout() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('latest');
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'latest') {
      router.push('/(tabs)/feed/latest');
    } else {
      router.push('/(tabs)/feed/following');
    }
    
    // Animate the indicator
    Animated.timing(indicatorAnim, {
      toValue: tab === 'latest' ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const indicatorStyle = {
    transform: [{
      translateX: indicatorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_WIDTH / 2, 0],
      }),
    }],
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('following')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'following' && styles.activeTabText,
              ]}
            >
              Following
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('latest')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'latest' && styles.activeTabText,
              ]}
            >
              Latest
            </ThemedText>
          </TouchableOpacity>
          <Animated.View style={[styles.indicator, indicatorStyle]} />
        </View>
      </SafeAreaView>

      <Stack>
        <Stack.Screen 
          name="latest" 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="following" 
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsReviewModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      <ReviewModal
        visible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
      />
    </View>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#0A7EA4',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: SCREEN_WIDTH / 2,
    backgroundColor: '#0A7EA4',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A7EA4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 