import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

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
  { id: '1', name: 'E-Commerce App', student: 'Ahmed Ali', category: 'Mobile', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400' },
  { id: '2', name: 'Dashboard UI', student: 'Sara Omar', category: 'Web', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400' },
  { id: '3', name: 'Food Delivery', student: 'Omar Khaled', category: 'Mobile', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
  { id: '4', name: 'Portfolio Site', student: 'Nour Hassan', category: 'Web', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400' },
  { id: '5', name: 'Fitness Tracker', student: 'Ali Mahmoud', category: 'Mobile', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' },
  { id: '6', name: 'Chat App', student: 'Mona Sayed', category: 'Mobile', image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400' },
  { id: '7', name: 'Blog Platform', student: 'Karim Adel', category: 'Web', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400' },
  { id: '8', name: 'AI Chatbot', student: 'Youssef Tarek', category: 'AI', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400' },
];

const CATEGORIES = ['All', 'Mobile', 'Web', 'AI', 'Security', 'Data Science'];

// ── Project Card ───────────────────────────────────
function ProjectCard({ item, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image
        source={{
          uri: typeof item.image === 'string'
            ? item.image
            : 'https://via.placeholder.com/300'
        }}
        style={styles.cardImage}
        resizeMode="cover"
      />

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.cardStudent} numberOfLines={1}>
          {item.student}
        </Text>

        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────
export default function GalleryScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(() => {
    return mockProjects.filter(p => {
      const q = search.toLowerCase();

      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.student.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchFilter =
        activeFilter === 'All' || p.category === activeFilter;

      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  return (
    <SafeAreaView style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>🗂️ Projects Gallery</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={C.link}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ProjectCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/project-details' as any, // ✅ FIX PATHNAME ERROR
                params: {
                  title: item.name,
                  year: '2024',
                  image: item.image,
                  description: `${item.name} by ${item.student}`
                }
              })
            }
          />
        )}
      />

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 16,
    color: C.black
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.input,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44
  },

  searchIcon: {   // ✅ FIXED ERROR
    marginRight: 6,
    fontSize: 14
  },

  searchInput: {
    flex: 1,
    color: C.black
  },

  chip: {
    padding: 10,
    margin: 5,
    backgroundColor: C.white,
    borderRadius: 20
  },

  chipActive: {
    backgroundColor: C.button
  },

  chipText: {
    color: C.black
  },

  chipTextActive: {
    color: C.white
  },

  card: {
    flex: 1,
    margin: 8,
    backgroundColor: C.white,
    borderRadius: 10,
    overflow: 'hidden'
  },

  cardImage: {
    width: '100%',
    height: 100
  },

  cardBody: {
    padding: 8
  },

  cardName: {
    fontWeight: 'bold',
    color: C.black
  },

  cardStudent: {
    fontSize: 12,
    color: C.link
  },

  cardBadge: {
    marginTop: 5,
    backgroundColor: C.input,
    padding: 4,
    borderRadius: 5,
    alignSelf: 'flex-start'
  },

  cardBadgeText: {
    fontSize: 10
  }
});