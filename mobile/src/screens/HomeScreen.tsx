import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  // Features from your web app
  const features = [
    { icon: 'search', title: 'Smart Search', desc: 'Search projects by name or technology' },
    { icon: 'funnel', title: 'Filter by Year', desc: 'Filter projects by year and tech stack' },
    { icon: 'star', title: 'Faculty Reviews', desc: 'View faculty ratings and comments' },
    { icon: 'document-text', title: 'Documentation', desc: 'Access PDF files and GitHub links' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Hero Section - from your web App.js */}
        <View style={styles.heroContainer}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Explore Graduation Projects in One Place</Text>
            <Text style={styles.heroText}>
              Discover inspiring graduation projects, explore technologies used,
              and learn from previous students' work in one organized platform.
            </Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Projects')}
              >
                <Text style={styles.primaryButtonText}>Browse Projects</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Upload Your Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Features Section - from your web App.js */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Platform Features</Text>
          <Text style={styles.sectionSubtitle}>
            The platform helps students and faculty explore projects easily.
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Ionicons name={feature.icon} size={30} color="#68442A" />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Section - from your web App.js */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About the Platform</Text>
          <Text style={styles.aboutText}>
            Graduation Projects Gallery Portal is a centralized platform to
            showcase graduation projects for Computer Science students. It helps
            preserve project work, inspire new students, and support faculty
            evaluation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFCDD0',
  },
  heroContainer: {
    backgroundColor: '#DFCDD0',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F1C0F',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 16,
    color: '#68442A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#68442A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
  },
  primaryButtonText: {
    color: '#FEFBF5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FEFBF5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#68442A',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#68442A',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: 'rgba(254, 251, 245, 0.35)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F1C0F',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#68442A',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FEFBF5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F1C0F',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#68442A',
    textAlign: 'center',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: '#FEFBF5',
  },
  aboutText: {
    fontSize: 16,
    color: '#68442A',
    textAlign: 'center',
    lineHeight: 24,
  },
});
