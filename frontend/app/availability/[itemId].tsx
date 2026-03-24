import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { api } from '../../utils/api';

export default function AvailabilityScreen() {
  const { itemId, itemType } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const response = await api.get(`/availability/${itemId}`);
      const data = response.data;

      const marked: any = {};

      // Mark available dates (green)
      data.available_dates?.forEach((date: string) => {
        marked[date] = {
          marked: true,
          dotColor: '#10B981',
          selected: false,
          selectedColor: '#10B981',
        };
      });

      // Mark booked dates (red)
      data.booked_dates?.forEach((date: string) => {
        marked[date] = {
          marked: true,
          dotColor: '#EF4444',
          disabled: true,
          disableTouchEvent: true,
        };
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day: any) => {
    const dateString = day.dateString;

    // Check if date is already booked
    if (markedDates[dateString]?.disabled) {
      Alert.alert('Unavailable', 'This date is already booked');
      return;
    }

    setSelectedDate(dateString);

    // Update marked dates to show selection
    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach((key) => {
      newMarked[key] = { ...newMarked[key], selected: false };
    });
    if (newMarked[dateString]) {
      newMarked[dateString] = { ...newMarked[dateString], selected: true };
    } else {
      newMarked[dateString] = { selected: true, selectedColor: '#8B5CF6' };
    }
    setMarkedDates(newMarked);
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book for ${selectedDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Date reserved!');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Availability</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDateSelect}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#1F2937',
              selectedDayBackgroundColor: '#8B5CF6',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#8B5CF6',
              dayTextColor: '#1F2937',
              textDisabledColor: '#D1D5DB',
              dotColor: '#8B5CF6',
              selectedDotColor: '#FFFFFF',
              arrowColor: '#8B5CF6',
              monthTextColor: '#1F2937',
              textMonthFontWeight: '600',
              textMonthFontSize: 18,
            }}
          />
        </View>

        {/* Selected Date Info */}
        {selectedDate && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <Ionicons name="calendar" size={24} color="#8B5CF6" />
              <Text style={styles.selectedTitle}>Selected Date</Text>
            </View>
            <Text style={styles.selectedDate}>{selectedDate}</Text>
            <Text style={styles.selectedNote}>
              This date is available for booking
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Booking Information</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Advance payment required</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Free cancellation up to 30 days</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Confirmation within 24 hours</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      {selectedDate && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      )}
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  selectedCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  selectedDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  selectedNote: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});