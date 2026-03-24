import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Venue3DPreviewScreen() {
  const { id } = useLocalSearchParams();
  const [selectedView, setSelectedView] = useState('stage');
  const router = useRouter();

  const views = [
    { id: 'stage', label: 'Stage', icon: 'desktop' },
    { id: 'seating', label: 'Seating', icon: 'people' },
    { id: 'decoration', label: 'Decoration', icon: 'color-palette' },
    { id: 'aerial', label: 'Aerial View', icon: 'airplane' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3D Venue Preview</Text>
        <TouchableOpacity>
          <Ionicons name="share-social" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* 3D Viewer Area */}
      <View style={styles.viewerContainer}>
        <View style={styles.viewer3D}>
          <Text style={styles.viewer3DEmoji}>🏰</Text>
          <Text style={styles.viewer3DText}>3D Interactive Preview</Text>
          <Text style={styles.viewer3DSubtext}>Rotate • Zoom • Pan</Text>
          
          {/* Simulated 3D controls */}
          <View style={styles.controlsOverlay}>
            <View style={styles.controlButton}>
              <Ionicons name="expand" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.controlButton}>
              <Ionicons name="sync" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.controlButton}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* View selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.viewSelector}
          contentContainerStyle={styles.viewSelectorContent}
        >
          {views.map((view) => (
            <TouchableOpacity
              key={view.id}
              style={[
                styles.viewTab,
                selectedView === view.id && styles.viewTabActive,
              ]}
              onPress={() => setSelectedView(view.id)}
            >
              <Ionicons
                name={view.icon as any}
                size={20}
                color={selectedView === view.id ? '#8B5CF6' : '#6B7280'}
              />
              <Text
                style={[
                  styles.viewTabText,
                  selectedView === view.id && styles.viewTabTextActive,
                ]}
              >
                {view.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Info Section */}
      <ScrollView style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Interactive Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="hand-left" size={20} color="#8B5CF6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Touch & Drag</Text>
              <Text style={styles.featureDesc}>Rotate 360° view</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="resize" size={20} color="#8B5CF6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Pinch to Zoom</Text>
              <Text style={styles.featureDesc}>Get closer details</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="layers" size={20} color="#8B5CF6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Multiple Views</Text>
              <Text style={styles.featureDesc}>Stage, seating, decoration</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Venue Specifications</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Total Area:</Text>
            <Text style={styles.specValue}>15,000 sq ft</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Stage Size:</Text>
            <Text style={styles.specValue}>800 sq ft</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Ceiling Height:</Text>
            <Text style={styles.specValue}>25 ft</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradeButton}>
          <Ionicons name="cube" size={20} color="#FFFFFF" />
          <Text style={styles.upgradeButtonText}>View Full VR Experience</Text>
        </TouchableOpacity>
      </ScrollView>
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
  viewerContainer: {
    backgroundColor: '#1F2937',
  },
  viewer3D: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  viewer3DEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  viewer3DText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  viewer3DSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewSelector: {
    backgroundColor: '#1F2937',
  },
  viewSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  viewTabActive: {
    backgroundColor: '#F3E8FF',
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  viewTabTextActive: {
    color: '#8B5CF6',
  },
  infoSection: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  featureDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  upgradeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});