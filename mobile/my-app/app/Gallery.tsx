import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView
} from 'react-native';
import { router } from 'expo-router';

// ── Colors ────────────────────────────────────────
const C = {
  bg:     'rgb(223, 205, 192)',
  white:  'rgb(254, 251, 245)',
  black:  'rgb(47, 28, 15)',
  link:   'rgb(164, 132, 109)',
  button: 'rgb(104, 68, 42)',
  input:  'rgb(185, 174, 167)',
};

// ── Data ──────────────────────────────────────────
const mockProjects = [
  {
    id: '1',
    name: 'E-Commerce App',
    student: 'Ahmed Ali',
    category: 'Mobile',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
    year: '2024',
    description: 'A mobile e-commerce application for browsing products, adding them to cart, and completing orders in a simple and modern way.',
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
    description: 'A modern dashboard interface for analytics, reporting, and management tools with a clean user experience.',
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
    description: 'A food delivery app that allows users to browse restaurants, order meals, and track delivery.',
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
    description: 'A personal portfolio website to showcase projects, skills, and contact details in a professional format.',
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
    description: 'A fitness tracking app to monitor workouts, steps, calories, and progress over time.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['Flutter', 'Firebase', 'REST API']
  },
  {
    id: '6',
    name: 'Chat App',
    student: 'Mona Sayed',
    category: 'Mobile',
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400',
    year: '2024',
    description: 'A real-time chat application with messaging, user presence, and modern interface design.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['React Native', 'Socket.io', 'Node.js']
  },
  {
    id: '7',
    name: 'Blog Platform',
    student: 'Karim Adel',
    category: 'Web',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400',
    year: '2023',
    description: 'A blogging platform where users can write, publish, and manage posts with categories and comments.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['Laravel', 'MySQL', 'Blade']
  },
  {
    id: '8',
    name: 'Weather App',
    student: 'Layla Nasser',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=400',
    year: '2024',
    description: 'A smart weather application that displays forecasts and useful weather insights.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['React', 'API', 'Tailwind']
  },
  {
    id: '9',
    name: 'AI Chatbot',
    student: 'Youssef Tarek',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400',
    year: '2024',
    description: 'An AI chatbot project for answering questions and assisting users with basic tasks.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['Python', 'TensorFlow', 'Flask']
  },
  {
    id: '10',
    name: 'Network Scanner',
    student: 'Dina Walid',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
    year: '2023',
    description: 'A security project for scanning networks, detecting devices, and checking connection information.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['Python', 'Security Tools', 'Networking']
  },
  {
    id: '11',
    name: 'Sales Analysis',
    student: 'Hany Fathy',
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    year: '2024',
    description: 'A data science project for analyzing sales trends, charts, and performance insights.',
    github: 'https://github.com',
    pdf: 'https://example.com',
    techStack: ['Python', 'Pandas', 'Power BI']
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

  const filtered = useMemo(() => {
    return mockProjects.filter(p => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.student.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchFilter = activeFilter === 'All' || p.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🗂️ Projects Gallery</Text>

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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No projects found 😕</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 22, fontWeight: 'bold', color: C.black, padding: 16, paddingBottom: 10 },

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

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: C.link },
});