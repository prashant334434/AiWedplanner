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
import { getVenueById } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

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

  const handleBook = () => {
    Alert.alert(
      'Book Venue',
      `Book ${venue.name} for ₹${(venue.price_per_event / 100000).toFixed(2)}L?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            Alert.alert('Success', 'Booking request sent!');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!venue) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>🏰</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1} / {venue.images?.length || 3}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{venue.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.rating}>{venue.rating}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Ionicons name="heart-outline" size={24} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text style={styles.location}>{venue.location}</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
              <Text style={styles.infoLabel}>Capacity</Text>
              <Text style={styles.infoValue}>{venue.capacity}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="home" size={20} color="#8B5CF6" />
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{venue.venue_type}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="cash" size={20} color="#8B5CF6" />
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>{venue.price_range}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {venue.amenities?.map((amenity: string, index: number) => (
                <View key={index} style={styles.amenityChip}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewsComingSoon}>Reviews coming soon</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Price per event</Text>
          <Text style={styles.price}>₹{(venue.price_per_event / 100000).toFixed(2)}L</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>Book Venue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 100,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoCards: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewsComingSoon: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  bookButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});