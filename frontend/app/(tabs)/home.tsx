import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { getUserBudget, getWeddingSetup } from '../../utils/api';

export default function HomeScreen() {
  const [budget, setBudget] = useState<any>(null);
  const [setup, setSetup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      const [budgetData, setupData] = await Promise.all([
        getUserBudget(user.id),
        getWeddingSetup(user.id),
      ]);
      setBudget(budgetData);
      setSetup(setupData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressCards = [
    {
      id: 'venue',
      title: 'Venue',
      icon: 'business',
      completed: false,
      route: '/venues',
    },
    {
      id: 'decoration',
      title: 'Decoration',
      icon: 'color-palette',
      completed: false,
      route: '/decorations',
    },
    {
      id: 'catering',
      title: 'Catering',
      icon: 'restaurant',
      completed: false,
      route: '/caterers',
    },
    {
      id: 'vendors',
      title: 'Vendors',
      icon: 'people',
      completed: false,
      route: '/vendors',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back! 👋</Text>
            <Text style={styles.subtitle}>Let's plan your perfect wedding</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Wedding Info Card */}
        {setup && (
          <View style={styles.weddingCard}>
            <Text style={styles.weddingCardTitle}>Your Wedding</Text>
            <View style={styles.weddingInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>{setup.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>{setup.guest_count} Guests</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>₹{(setup.budget / 100000).toFixed(1)}L Budget</Text>
              </View>
            </View>
          </View>
        )}

        {/* Budget Overview */}
        {budget && (
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Budget Overview</Text>
              <TouchableOpacity>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.budgetAmount}>₹{(budget.total / 100000).toFixed(2)}L</Text>
            <Text style={styles.budgetSubtext}>Total Spent</Text>
          </View>
        )}

        {/* Progress Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wedding Progress</Text>
          <View style={styles.progressGrid}>
            {progressCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.progressCard}
                onPress={() => router.push(card.route as any)}
              >
                <View style={[styles.iconCircle, card.completed && styles.iconCircleCompleted]}>
                  <Ionicons
                    name={card.icon as any}
                    size={24}
                    color={card.completed ? '#FFFFFF' : '#8B5CF6'}
                  />
                </View>
                <Text style={styles.progressCardTitle}>{card.title}</Text>
                {card.completed && (
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/plan')}
          >
            <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>AI Wedding Planner</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/invitations')}
          >
            <Ionicons name="mail" size={24} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Create Invitation</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weddingCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  weddingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  weddingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  budgetSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  progressCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircleCompleted: {
    backgroundColor: '#8B5CF6',
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionButton: {
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
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
});