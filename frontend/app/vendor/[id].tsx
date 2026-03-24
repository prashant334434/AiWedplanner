import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorById } from '../../utils/api';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadVendor();
  }, [id]);

  const loadVendor = async () => {
    try {
      const data = await getVendorById(id as string);
      setVendor(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vendor details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    Alert.alert('Book Vendor', `Book ${vendor.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Proceed', onPress: () => Alert.alert('Success', 'Booking request sent!') },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!vendor) return null;

  const categoryIcons: any = {
    photographer: 'camera',
    dj: 'musical-notes',
    makeup: 'brush',
    planner: 'clipboard',
    pandit: 'book',
    band: 'musical-note',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <View style={styles.headerPlaceholder}>
            <Text style={styles.headerEmoji}>📸</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Vendor Info */}
          <View style={styles.vendorCard}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={categoryIcons[vendor.category] || 'person'}
                size={32}
                color="#8B5CF6"
              />
            </View>
            <Text style={styles.name}>{vendor.name}</Text>
            <Text style={styles.category}>{vendor.category.toUpperCase()}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.rating}>{vendor.rating} Rating</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{vendor.description}</Text>
          </View>

          {/* Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesContainer}>
              {vendor.services?.map((service: string, index: number) => (
                <View key={index} style={styles.serviceChip}>
                  <Ionicons name="checkmark-circle" size={16} color="#8B5CF6" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Portfolio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vendor.portfolio_images?.map((img: string, index: number) => (
                <View key={index} style={styles.portfolioItem}>
                  <View style={styles.portfolioPlaceholder}>
                    <Text style={styles.portfolioEmoji}>🖼️</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="call" size={20} color="#8B5CF6" />
              <Text style={styles.contactText}>{vendor.contact}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Price Range</Text>
          <Text style={styles.price}>{vendor.price_range}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  headerContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 80,
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
  content: {
    padding: 20,
  },
  vendorCard: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '500',
  },
  portfolioItem: {
    marginRight: 12,
  },
  portfolioPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioEmoji: {
    fontSize: 40,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 12,
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
    fontSize: 18,
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