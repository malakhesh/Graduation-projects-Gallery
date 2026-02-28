import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProject = ({ item }) => (
    <TouchableOpacity style={styles.projectCard}>
      <Text style={styles.projectTitle}>{item.title}</Text>
      <Text style={styles.projectAuthor}>by {item.author || 'Unknown'}</Text>
      <View style={styles.projectFooter}>
        <Text style={styles.projectYear}>{item.year || 'N/A'}</Text>
        {item.technologies && (
          <View style={styles.techBadge}>
            <Text style={styles.techText}>{item.technologies[0]}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#68442A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#68442A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={50} color="#B9AEA7" />
            <Text style={styles.emptyText}>No projects found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFCDD0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFBF5',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B9AEA7',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#2F1C0F',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  projectCard: {
    backgroundColor: '#FEFBF5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B9AEA7',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F1C0F',
    marginBottom: 5,
  },
  projectAuthor: {
    fontSize: 14,
    color: '#68442A',
    marginBottom: 10,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectYear: {
    fontSize: 12,
    color: '#A4846D',
  },
  techBadge: {
    backgroundColor: '#DFCDD0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  techText: {
    fontSize: 12,
    color: '#68442A',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#68442A',
  },
});
