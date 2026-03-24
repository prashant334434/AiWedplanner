import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashWelcome() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FFF8F3', '#FFE8DC', '#FFF0E6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Illustration Area */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationEmoji}>💍</Text>
          <Text style={styles.decorFlower}>🌸</Text>
          <Text style={styles.decorHeart}>💕</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Plan Your Wedding</Text>
          <Text style={styles.title}>Events Easily</Text>
          
          <Text style={styles.subtitle}>
            Plan your perfect day with ease. Everything
          </Text>
          <Text style={styles.subtitle}>
            you need, all in one place.
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/onboarding')}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
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
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationEmoji: {
    fontSize: 180,
  },
  decorFlower: {
    fontSize: 40,
    position: 'absolute',
    top: 80,
    left: 40,
  },
  decorHeart: {
    fontSize: 40,
    position: 'absolute',
    bottom: 100,
    right: 50,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#E97597',
    borderRadius: 30,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#E97597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4D4D4',
  },
  dotActive: {
    backgroundColor: '#E97597',
  },
});