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
import { LinearGradient } from 'expo-linear-gradient';
import { getVenues, getVendors } from '../../utils/api';

const categories = [
  { id: 'vendor', title: 'Vendor', icon: 'people' },
  { id: 'venue', title: 'Venue', icon: 'business' },
  { id: 'dress', title: 'Dress', icon: 'shirt' },
  { id: 'makeup', title: 'Make up', icon: 'brush' },
];

export default function ExploreScreenNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('vendor');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const venuesData = await getVenues();
      setVenues(venuesData.slice(0, 3));
    } catch (error) {
      console.error('Error loading explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF8F3', '#FFE8DC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="grid-outline" size={24} color="#2D2D2D" />
          </View>
          <View style={styles.headerCenter}>
            <Ionicons name="location" size={18} color="#E97597" />
            <Text style={styles.location}>New Delhi</Text>
            <Ionicons name="chevron-down" size={16} color="#2D2D2D" />
          </View>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="notifications-outline" size={24} color="#2D2D2D" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Perfect Weddings,</Text>
            <Text style={styles.mainTitle}>Personalized</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Here.."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.searchButton}>
              <Ionicons name="options" size={20} color="#FFFFFF" />
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Featured Card */}
          {loading ? (
            <ActivityIndicator size="large" color="#E97597" style={{ marginTop: 40 }} />
          ) : (
            venues.map((venue) => (
              <TouchableOpacity
                key={venue._id}
                style={styles.venueCard}
                onPress={() => router.push(`/venue/${venue._id}`)}
              >
                {/* Image Placeholder */}
                <View style={styles.venueImage}>
                  <Text style={styles.venueEmoji}>🏰</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{venue.rating}</Text>
                  </View>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Ionicons name="arrow-forward" size={20} color="#2D2D2D" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.venueContent}>
                  <Text style={styles.venueTitle}>{venue.name}</Text>
                  <View style={styles.venueLocation}>
                    <Ionicons name="flag" size={14} color="#E97597" />
                    <Text style={styles.venueLocationText}>{venue.location}</Text>
                  </View>
                  <Text style={styles.venueDescription} numberOfLines={2}>
                    {venue.description}
                  </Text>
                  <Text style={styles.venueDate}>15 June — 12 May</Text>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.seeDetailsButton}>
                  <Text style={styles.seeDetailsText}>See Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
    marginHorizontal: 6,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#2D2D2D',
    lineHeight: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#2D2D2D',
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E97597',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#2D2D2D',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  venueImage: {
    height: 220,
    borderRadius: 20,
    backgroundColor: '#FFE8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  venueEmoji: {
    fontSize: 80,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
    marginLeft: 4,
  },
  arrowButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueContent: {
    marginBottom: 16,
  },
  venueTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  venueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  venueLocationText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  venueDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
    marginBottom: 12,
  },
  venueDate: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  seeDetailsButton: {
    backgroundColor: '#E97597',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  seeDetailsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});