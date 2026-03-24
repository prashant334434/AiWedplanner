import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWeddingStore } from '../store/weddingStore';
import { useAuthStore } from '../store/authStore';
import { createWeddingSetup } from '../utils/api';
import Slider from '@react-native-community/slider';

export default function WeddingSetupScreen() {
  const [step, setStep] = useState(1);
  const [weddingType, setWeddingType] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [budget, setBudget] = useState(500000);
  const [weddingDate, setWeddingDate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateSetup = useWeddingStore((state) => state.updateSetup);

  const handleNext = () => {
    if (step === 1 && !weddingType) {
      Alert.alert('Required', 'Please select a wedding type');
      return;
    }
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!location) {
      Alert.alert('Required', 'Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const setupData = {
        user_id: user?.id || '',
        wedding_type: weddingType,
        guest_count: guestCount,
        budget: budget,
        wedding_date: weddingDate || new Date().toISOString(),
        location: location,
      };

      await createWeddingSetup(setupData);
      updateSetup(setupData);
      Alert.alert('Success', 'Wedding setup completed!');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save setup');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Wedding Type</Text>
            <Text style={styles.stepSubtitle}>Choose your wedding style</Text>
            
            <TouchableOpacity
              style={[
                styles.card,
                weddingType === 'local' && styles.cardSelected,
              ]}
              onPress={() => setWeddingType('local')}
            >
              <Ionicons name="home" size={40} color={weddingType === 'local' ? '#8B5CF6' : '#6B7280'} />
              <Text style={[styles.cardTitle, weddingType === 'local' && styles.cardTitleSelected]}>
                Local Wedding
              </Text>
              <Text style={styles.cardDescription}>
                Traditional wedding in your hometown
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                weddingType === 'destination' && styles.cardSelected,
              ]}
              onPress={() => setWeddingType('destination')}
            >
              <Ionicons name="airplane" size={40} color={weddingType === 'destination' ? '#8B5CF6' : '#6B7280'} />
              <Text style={[styles.cardTitle, weddingType === 'destination' && styles.cardTitleSelected]}>
                Destination Wedding
              </Text>
              <Text style={styles.cardDescription}>
                Celebrate at an exotic location
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Guest Count</Text>
            <Text style={styles.stepSubtitle}>How many guests are you expecting?</Text>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.valueText}>{guestCount} Guests</Text>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={1000}
                step={10}
                value={guestCount}
                onValueChange={setGuestCount}
                minimumTrackTintColor="#8B5CF6"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#8B5CF6"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>50</Text>
                <Text style={styles.sliderLabel}>1000</Text>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Budget</Text>
            <Text style={styles.stepSubtitle}>Set your wedding budget</Text>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.valueText}>₹{(budget / 100000).toFixed(1)} Lakhs</Text>
              <Slider
                style={styles.slider}
                minimumValue={200000}
                maximumValue={10000000}
                step={100000}
                value={budget}
                onValueChange={setBudget}
                minimumTrackTintColor="#8B5CF6"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#8B5CF6"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>₹2L</Text>
                <Text style={styles.sliderLabel}>₹1Cr</Text>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Wedding Date</Text>
            <Text style={styles.stepSubtitle}>When is the big day? (Optional)</Text>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => Alert.alert('Date Picker', 'Date picker integration coming soon')}
            >
              <Ionicons name="calendar" size={24} color="#8B5CF6" />
              <Text style={styles.dateButtonText}>
                {weddingDate || 'Select Wedding Date'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.hint}>You can set this later from your profile</Text>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Location</Text>
            <Text style={styles.stepSubtitle}>Where will the wedding take place?</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={24} color="#8B5CF6" />
              <Text
                style={styles.input}
                onPress={() => {
                  Alert.prompt(
                    'Enter Location',
                    'City or venue location',
                    (text) => setLocation(text)
                  );
                }}
              >
                {location || 'Tap to enter location'}
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[
                styles.progressStep,
                s <= step && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepIndicator}>Step {step} of 5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : step === 5 ? 'Complete' : 'Next'}
          </Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#8B5CF6',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  card: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: '#8B5CF6',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  sliderContainer: {
    marginTop: 40,
  },
  valueText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});