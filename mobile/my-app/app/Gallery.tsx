import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import UploadProjectModal from '../components/modals/UploadProjectModal';

// ── Colors ────────────────────────────────────────
const C = {
  bg:     'rgb(223, 205, 192)',
  white:  'rgb(254, 251, 245)',
  black:  'rgb(47, 28, 15)',
  link:   'rgb(164, 132, 109)',
  button: 'rgb(104, 68, 42)',
  input:  'rgb(185, 174, 167)',
};

// ── Mock Data ──────────────────────────────────────────
const mockProjects = [
  {
    id: '1',
    name: 'E-Commerce App',
    student: 'Ahmed Ali',
    category: 'Mobile',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
    year: '2024',
    description: 'A mobile e-commerce application...',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['React Native', 'Firebase', 'Expo']
  },
  {
    id: '2',
    name: 'Dashboard UI',
    student: 'Sara Omar',
    category: 'Web',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    year: '2024',
    description: 'A modern dashboard interface...',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['React', 'Chart.js', 'CSS']
  },
  {
    id: '3',
    name: 'Food Delivery',
    student: 'Omar Khaled',
    category: 'Mobile',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    year: '2023',
    description: 'A food delivery app...',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['React Native', 'Node.js', 'MongoDB']
  },
  {
    id: '4',
    name: 'Portfolio Site',
    student: 'Nour Hassan',
    category: 'Web',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400',
    year: '2024',
    description: 'A personal portfolio website...',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['HTML', 'CSS', 'JavaScript']
  },
  {
    id: '5',
    name: 'Fitness Tracker',
    student: 'Ali Mahmoud',
    category: 'Mobile',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    year: '2022',
    description: 'A fitness tracking app...',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['Flutter', 'Firebase', 'REST API']
  },
];

const CATEGORIES = ['All', 'Mobile', 'Web', 'AI', 'Security', 'Data Science'];

// ── ProjectCard ───────────────────────────────────
function ProjectCard({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardStudent} numberOfLines={1}>{item.student}</Text>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────
export default function GalleryScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState(mockProjects);

  // Filter projects
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.student.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchFilter = activeFilter === 'All' || p.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter, projects]);

  // Pull to Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // هنا هنضيف جلب البيانات من Firebase بعدين
    setTimeout(() => {
      setRefreshing(false);
      Toast.show({
        type: 'success',
        text1: 'تم التحديث',
        text2: 'تم تحديث المشاريع بنجاح',
        position: 'top',
        visibilityTime: 2000,
      });
    }, 1000);
  }, []);

  // Handle successful upload
  const handleUploadSuccess = useCallback(() => {
    Toast.show({
      type: 'success',
      text1: '✅ تم رفع المشروع!',
      text2: 'سينتظر موافقة الأدمن',
      position: 'top',
      visibilityTime: 3000,
    });
  }, []);

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>No projects yet</Text>
      <Text style={styles.emptyText}>Be the first to upload a project!</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.emptyButtonText}>+ Upload Project</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🗂️ Projects Gallery</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, student, or category..."
          placeholderTextColor={C.link}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeFilter === cat && styles.chipActive]}
            onPress={() => setActiveFilter(cat)}
          >
            <Text style={[styles.chipText, activeFilter === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.count}>
        {filtered.length} project{filtered.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[C.button]}
            tintColor={C.button}
          />
        }
        renderItem={({ item }) => (
          <ProjectCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/project-details',
                params: {
                  id: item.id,
                  title: item.name,
                  student: item.student,
                  category: item.category,
                  image: item.image,
                  year: item.year,
                  description: item.description,
                  github: item.github,
                  pdf: item.pdf,
                  techStack: JSON.stringify(item.techStack),
                },
              })
            }
          />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />

      <UploadProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      <Toast />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: C.black, padding: 16, paddingBottom: 10 },
  uploadButton: {
    backgroundColor: C.button,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: C.white,
    fontWeight: '600',
    fontSize: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.input,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 44
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, height: 44, color: C.black },
  clearBtn: { fontSize: 14, padding: 4, color: C.black },

  filtersScroll: { maxHeight: 44, marginBottom: 8 },
  filtersContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: C.white },
  chipActive: { backgroundColor: C.button },
  chipText: { fontSize: 13, color: C.black, fontWeight: '500' },
  chipTextActive: { color: C.white },

  count: { paddingHorizontal: 16, fontSize: 12, color: C.link, marginBottom: 4 },

  list: { paddingHorizontal: 8, paddingBottom: 24 },

  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    backgroundColor: C.white,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: C.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  cardImage: { width: '100%', height: 110 },
  cardBody: { padding: 8 },
  cardName: { fontWeight: 'bold', fontSize: 13, color: C.black, marginBottom: 2 },
  cardStudent: { fontSize: 11, color: C.link, marginBottom: 6 },
  cardBadge: { alignSelf: 'flex-start', backgroundColor: C.input, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  cardBadgeText: { fontSize: 10, color: C.button, fontWeight: '600' },

  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: C.black,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: C.link,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: C.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: C.white,
    fontWeight: '600',
    fontSize: 16,
  },
});