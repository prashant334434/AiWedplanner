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
import { getDecorationById } from '../../utils/api';

export default function DecorationCustomizeScreen() {
  const { id } = useLocalSearchParams();
  const [decoration, setDecoration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    loadDecoration();
  }, [id]);

  const loadDecoration = async () => {
    try {
      const data = await getDecorationById(id as string);
      setDecoration(data);
      // Initialize with first option of each category
      if (data.customization_options) {
        const initial: any = {};
        Object.keys(data.customization_options).forEach((key) => {
          initial[key] = data.customization_options[key][0];
        });
        setSelectedOptions(initial);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load decoration details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (category: string, value: string) => {
    setSelectedOptions((prev: any) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Customization',
      'Save these customization options?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Customization saved!');
            router.back();
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

  if (!decoration) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Decoration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Theme Header */}
        <View style={styles.themeCard}>
          <Text style={styles.themeName}>{decoration.theme_name}</Text>
          <Text style={styles.themeDesc}>{decoration.description}</Text>
          <View style={styles.priceRow}>
            <Ionicons name="pricetag" size={16} color="#FFFFFF" />
            <Text style={styles.priceText}>
              ₹{(decoration.price / 100000).toFixed(2)}L
            </Text>
          </View>
        </View>

        {/* Live Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Live Preview</Text>
          <View style={styles.previewContainer}>
            <Text style={styles.previewEmoji}>🎉</Text>
            <Text style={styles.previewText}>Your customized decoration preview</Text>
            {Object.entries(selectedOptions).map(([key, value]) => (
              <View key={key} style={styles.previewItem}>
                <Text style={styles.previewKey}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </Text>
                <Text style={styles.previewValue}> {value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Customization Options */}
        {decoration.customization_options &&
          Object.entries(decoration.customization_options).map(([category, options]: any) => (
            <View key={category} style={styles.optionSection}>
              <Text style={styles.optionTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <View style={styles.optionsContainer}>
                {options.map((option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionChip,
                      selectedOptions[category] === option && styles.optionChipSelected,
                    ]}
                    onPress={() => selectOption(category, option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOptions[category] === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {selectedOptions[category] === option && (
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

        {/* Includes Section */}
        <View style={styles.includesSection}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {decoration.includes?.map((item: string, index: number) => (
            <View key={index} style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            ₹{(decoration.price / 100000).toFixed(2)}L
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
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
  themeCard: {
    backgroundColor: '#EC4899',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  themeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  themeDesc: {
    fontSize: 14,
    color: '#FCE7F3',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  previewEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  previewKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  previewValue: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  optionSection: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 6,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  includesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  includeText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
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
    color: '#EC4899',
  },
  confirmButton: {
    backgroundColor: '#EC4899',
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