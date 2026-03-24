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
import { getCatererById, saveMenuSelection } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useWeddingStore } from '../../store/weddingStore';

export default function MenuBuilderScreen() {
  const { id } = useLocalSearchParams();
  const [caterer, setCaterer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setup } = useWeddingStore();

  useEffect(() => {
    loadCaterer();
  }, [id]);

  useEffect(() => {
    calculateTotal();
  }, [selectedItems, caterer]);

  const loadCaterer = async () => {
    try {
      const data = await getCatererById(id as string);
      setCaterer(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load caterer details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const calculateTotal = () => {
    if (!caterer || !caterer.menu_items) return;
    
    let total = 0;
    caterer.menu_items.forEach((item: any) => {
      if (selectedItems.has(item.name)) {
        total += item.price_per_plate * (setup.guest_count || 100);
      }
    });
    setTotalPrice(total);
  };

  const handleConfirm = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }

    try {
      await saveMenuSelection({
        user_id: user?.id || '',
        caterer_id: id as string,
        selected_items: Array.from(selectedItems),
        total_guests: setup.guest_count || 100,
        total_price: totalPrice,
      });
      Alert.alert('Success', 'Menu selection saved!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save menu selection');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!caterer) return null;

  const categories = ['starter', 'main', 'dessert', 'drinks'];
  const itemsByCategory = categories.reduce((acc: any, cat) => {
    acc[cat] = caterer.menu_items?.filter((item: any) => item.category === cat) || [];
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Builder</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Caterer Info */}
        <View style={styles.catererCard}>
          <Text style={styles.catererName}>{caterer.name}</Text>
          <Text style={styles.catererDesc}>{caterer.description}</Text>
          <View style={styles.guestRow}>
            <Ionicons name="people" size={16} color="#8B5CF6" />
            <Text style={styles.guestText}>
              {setup.guest_count || 100} Guests
            </Text>
          </View>
        </View>

        {/* Menu Categories */}
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}s
            </Text>
            {itemsByCategory[category].map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  selectedItems.has(item.name) && styles.menuItemSelected,
                ]}
                onPress={() => toggleItem(item.name)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedItems.has(item.name) && styles.checkboxSelected,
                    ]}
                  >
                    {selectedItems.has(item.name) && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <View style={styles.menuItemDetails}>
                      <Text style={styles.cuisineType}>{item.cuisine_type}</Text>
                      {item.is_vegetarian && (
                        <View style={styles.vegBadge}>
                          <Text style={styles.vegText}>VEG</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.itemPrice}>
                  ₹{item.price_per_plate * (setup.guest_count || 100)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>{selectedItems.size} items selected</Text>
          <Text style={styles.totalPrice}>₹{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 16,
  },
  catererCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  catererName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  catererDesc: {
    fontSize: 14,
    color: '#F3E8FF',
    marginBottom: 12,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  menuItemSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cuisineType: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  vegBadge: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  vegText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  confirmButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});