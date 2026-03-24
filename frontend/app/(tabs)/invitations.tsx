import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { generateInvitation } from '../../utils/api';

const themes = [
  { id: 'royal', name: 'Royal', emoji: '👑', color: '#8B5CF6' },
  { id: 'minimal', name: 'Minimal', emoji: '✨', color: '#6B7280' },
  { id: 'traditional', name: 'Traditional', emoji: '🎉', color: '#EC4899' },
  { id: 'modern', name: 'Modern', emoji: '💎', color: '#3B82F6' },
];

export default function InvitationsScreen() {
  const [selectedTheme, setSelectedTheme] = useState('royal');
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!coupleNames || !venue) {
      Alert.alert('Required', 'Please fill in couple names and venue');
      return;
    }

    setLoading(true);
    try {
      const response = await generateInvitation({
        couple_names: coupleNames,
        wedding_date: weddingDate || new Date().toISOString(),
        venue,
        message: message || 'Join us to celebrate our special day!',
        theme: selectedTheme,
      });
      
      setGeneratedImage(response.image_base64);
      Alert.alert('Success', 'Invitation generated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate invitation');
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
            <Text style={styles.title}>AI Invitation Generator 💌</Text>
            <Text style={styles.subtitle}>Create beautiful wedding invitations with AI</Text>
          </View>

          {/* Theme Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Theme</Text>
            <View style={styles.themesContainer}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    selectedTheme === theme.id && styles.themeCardSelected,
                    { borderColor: theme.color },
                  ]}
                  onPress={() => setSelectedTheme(theme.id)}
                >
                  <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                  <Text style={styles.themeName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Input Form */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Couple Names *</Text>
              <TextInput
                style={styles.input}
                placeholder="John & Jane"
                placeholderTextColor="#9CA3AF"
                value={coupleNames}
                onChangeText={setCoupleNames}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wedding Date</Text>
              <TextInput
                style={styles.input}
                placeholder="December 25, 2025"
                placeholderTextColor="#9CA3AF"
                value={weddingDate}
                onChangeText={setWeddingDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Venue *</Text>
              <TextInput
                style={styles.input}
                placeholder="Grand Palace, Mumbai"
                placeholderTextColor="#9CA3AF"
                value={venue}
                onChangeText={setVenue}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Join us to celebrate our special day!"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="images" size={20} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate Invitation</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Generated Image */}
          {generatedImage && (
            <View style={styles.imageCard}>
              <Text style={styles.imageTitle}>Your Invitation</Text>
              <Image
                source={{ uri: `data:image/png;base64,${generatedImage}` }}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download" size={20} color="#8B5CF6" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social" size={20} color="#8B5CF6" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  themeCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeCardSelected: {
    backgroundColor: '#F3E8FF',
  },
  themeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
  },
  generateButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});