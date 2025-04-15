import { Redirect } from 'expo-router';

export default function FeedIndex() {
  return <Redirect href="/(tabs)/feed/latest" />;
} 