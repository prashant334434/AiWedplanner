import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getVenues, getVendors } from '../../utils/api';

const categories = [
  { id: 'venues', title: 'Venues', icon: 'business', color: '#8B5CF6' },
  { id: 'decorations', title: 'Decorations', icon: 'color-palette', color: '#EC4899' },
  { id: 'caterers', title: 'Catering', icon: 'restaurant', color: '#F59E0B' },
  { id: 'photographer', title: 'Photographers', icon: 'camera', color: '#10B981' },
  { id: 'dj', title: 'DJs & Music', icon: 'musical-notes', color: '#3B82F6' },
  { id: 'makeup', title: 'Makeup Artists', icon: 'brush', color: '#EF4444' },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [venuesData, vendorsData] = await Promise.all([
        getVenues(),
        getVendors(),
      ]);
      setVenues(venuesData.slice(0, 3));
      setVendors(vendorsData.slice(0, 3));
    } catch (error) {
      console.error('Error loading explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Discover venues, vendors & more</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues, vendors..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => console.log('Navigate to', category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Ionicons name={category.icon as any} size={28} color={category.color} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Venues</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {venues.map((venue) => (
                <TouchableOpacity
                  key={venue._id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/venue/${venue._id}`)}
                >
                  <View style={styles.featuredImage}>
                    <Text style={styles.featuredEmoji}>🏰</Text>
                  </View>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle}>{venue.name}</Text>
                    <View style={styles.featuredRow}>
                      <Ionicons name="location" size={14} color="#6B7280" />
                      <Text style={styles.featuredLocation}>{venue.location}</Text>
                    </View>
                    <View style={styles.featuredRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.featuredRating}>{venue.rating}</Text>
                    </View>
                    <Text style={styles.featuredPrice}>{venue.price_range}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Top Vendors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Vendors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            vendors.map((vendor) => (
              <TouchableOpacity
                key={vendor._id}
                style={styles.vendorCard}
                onPress={() => router.push(`/vendor/${vendor._id}`)}
              >
                <View style={styles.vendorIcon}>
                  <Text style={styles.vendorEmoji}>📸</Text>
                </View>
                <View style={styles.vendorContent}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <Text style={styles.vendorCategory}>{vendor.category.toUpperCase()}</Text>
                  <View style={styles.vendorRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.vendorRating}>{vendor.rating} rating</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  featuredCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    height: 140,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 60,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  featuredLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  featuredRating: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 8,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorEmoji: {
    fontSize: 28,
  },
  vendorContent: {
    flex: 1,
    marginLeft: 16,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  vendorCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vendorRating: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});