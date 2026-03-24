import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getVenueById } from '../../utils/api';

const { width } = Dimensions.get('window');

export default function VenueDetailNew() {
  const { id } = useLocalSearchParams();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadVenue();
  }, [id]);

  const loadVenue = async () => {
    try {
      const data = await getVenueById(id as string);
      setVenue(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load venue details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFF8F3', '#FFE8DC']} style={styles.container}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#E97597" />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!venue) return null;

  return (
    <LinearGradient colors={['#C8E6C9', '#FFE8DC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#2D2D2D" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="heart-outline" size={22} color="#E97597" />
            </TouchableOpacity>
          </View>

          {/* Image Area */}
          <View style={styles.imageContainer}>
            <Text style={styles.venueIllustration}>🏰</Text>
          </View>

          {/* Content Card */}
          <View style={styles.contentCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.titleLeft}>
                <Text style={styles.venueTitle}>{venue.name}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={14} color="#666666" />
                  <Text style={styles.infoText}>15 June, 12 May</Text>
                  <Ionicons name="location" size={14} color="#666666" style={{ marginLeft: 12 }} />
                  <Text style={styles.infoText}>{venue.location}</Text>
                </View>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceAmount}>₹{(venue.price_per_event / 100000).toFixed(0)}L</Text>
                <Text style={styles.priceLabel}>/Day</Text>
              </View>
            </View>

            {/* Attendees */}
            <View style={styles.attendeesSection}>
              <View style={styles.avatarGroup}>
                <View style={[styles.avatar, { backgroundColor: '#E97597' }]}>
                  <Text style={styles.avatarText}>A</Text>
                </View>
                <View style={[styles.avatar, { backgroundColor: '#8B5CF6', marginLeft: -12 }]}>
                  <Text style={styles.avatarText}>B</Text>
                </View>
                <View style={[styles.avatar, { backgroundColor: '#10B981', marginLeft: -12 }]}>
                  <Text style={styles.avatarText}>+4</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{venue.rating} | Rating</Text>
              </View>
              <View style={styles.guestContainer}>
                <Ionicons name="people" size={16} color="#666666" />
                <Text style={styles.guestText}>{venue.capacity} Guest</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Wonderful Wedding Party</Text>
              <Text style={styles.descriptionText} numberOfLines={4}>
                {venue.description}...
                <Text style={styles.readMore}>Read More</Text>
              </Text>
            </View>

            {/* Book Button */}
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => Alert.alert('Booking', 'Proceed to booking?')}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -40,
  },
  venueIllustration: {
    fontSize: 160,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 32,
    paddingHorizontal: 24,
    minHeight: 500,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleLeft: {
    flex: 1,
  },
  venueTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E97597',
  },
  priceLabel: {
    fontSize: 13,
    color: '#999999',
  },
  attendeesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 20,
  },
  avatarGroup: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  ratingText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  guestText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  readMore: {
    color: '#E97597',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#E97597',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#E97597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
