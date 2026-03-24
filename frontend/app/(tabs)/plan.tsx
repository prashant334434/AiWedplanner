import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { generateWeddingPlan } from '../../utils/api';
import { useWeddingStore } from '../../store/weddingStore';

export default function PlanScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const setup = useWeddingStore((state) => state.setup);

  const handleGeneratePlan = async () => {
    if (!input.trim()) {
      Alert.alert('Required', 'Please describe your wedding requirements');
      return;
    }

    setLoading(true);
    try {
      const response = await generateWeddingPlan({
        user_input: input,
        guest_count: setup.guest_count,
        budget: setup.budget,
        location: setup.location,
      });
      
      setRecommendations(response.recommendations);
      Alert.alert('Success', 'AI has generated personalized recommendations!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Wedding Planner 🤖</Text>
            <Text style={styles.subtitle}>
              Get personalized recommendations powered by AI
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Describe Your Dream Wedding</Text>
            <TextInput
              style={styles.textArea}
              placeholder="E.g., I want a royal themed wedding for 300 guests under ₹10 lakhs in Jaipur with traditional decorations and amazing food..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              value={input}
              onChangeText={setInput}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[styles.generateButton, loading && styles.buttonDisabled]}
              onPress={handleGeneratePlan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Recommendations */}
          {recommendations && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
              <Text style={styles.recommendationsText}>{recommendations}</Text>
            </View>
          )}

          {/* Quick Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Quick Planning Tips</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.tipText}>Book venues 6-12 months in advance</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.tipText}>Finalize guest list early for accurate planning</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.tipText}>Budget 10-15% extra for unforeseen expenses</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.tipText}>Book popular vendors 4-6 months ahead</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  inputCard: {
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationsCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  recommendationsText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
});