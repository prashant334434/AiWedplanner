import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../../store/authStore';
import { createPaymentOrder } from '../../utils/api';

const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER';

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [amount] = useState(50000); // Sample amount
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create payment order
      const orderData = await createPaymentOrder({
        user_id: user?.id || '',
        booking_id: bookingId as string,
        amount: amount,
      });

      // Razorpay options
      const options = {
        description: 'Wedding Booking Payment',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: RAZORPAY_KEY,
        amount: amount * 100, // Amount in paise
        name: 'WedPlanner AI',
        order_id: orderData.order_id,
        prefill: {
          email: 'user@example.com',
          contact: user?.phone || '',
          name: user?.name || 'User',
        },
        theme: { color: '#8B5CF6' },
      };

      RazorpayCheckout.open(options)
        .then((data: any) => {
          Alert.alert('Payment Success', `Payment ID: ${data.razorpay_payment_id}`);
          router.back();
        })
        .catch((error: any) => {
          Alert.alert('Payment Failed', error.description || 'Something went wrong');
        })
        .finally(() => setLoading(false));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Booking Advance</Text>
            <Text style={styles.summaryValue}>₹{amount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>₹{(amount * 0.18).toLocaleString()}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{(amount * 1.18).toLocaleString()}</Text>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.securityTitle}>Secure Payment</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment is secured by Razorpay with 256-bit encryption
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsCard}>
          <Text style={styles.methodsTitle}>Available Payment Methods</Text>
          
          <View style={styles.methodItem}>
            <Ionicons name="card" size={20} color="#8B5CF6" />
            <Text style={styles.methodText}>Credit/Debit Cards</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          
          <View style={styles.methodItem}>
            <Ionicons name="phone-portrait" size={20} color="#8B5CF6" />
            <Text style={styles.methodText}>UPI</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          
          <View style={styles.methodItem}>
            <Ionicons name="wallet" size={20} color="#8B5CF6" />
            <Text style={styles.methodText}>Net Banking</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          
          <View style={styles.methodItem}>
            <Ionicons name="cash" size={20} color="#8B5CF6" />
            <Text style={styles.methodText}>Wallets</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By proceeding, you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
          <Text style={styles.termsLink}>Refund Policy</Text>
        </Text>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Pay ₹{(amount * 1.18).toLocaleString()}
              </Text>
            </>
          )}
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
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  securityCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#047857',
  },
  methodsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  methodText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  terms: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});