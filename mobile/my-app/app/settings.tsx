import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { auth } from '../backend/firebase';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const C = Colors[theme];

  // States للإعدادات المستقبلية
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Medium');

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'You have been logged out successfully.',
              });
              router.replace('/login');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to log out. Please try again.',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: C.black,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: C.link,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: C.white,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
      shadowColor: C.black,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuIcon: {
      fontSize: 20,
    },
    menuText: {
      fontSize: 16,
      color: C.black,
      fontWeight: '500',
    },
    menuSubtext: {
      fontSize: 14,
      color: C.link,
      marginTop: 2,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    themeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: C.input,
    },
    themeButtonActive: {
      backgroundColor: C.button,
    },
    themeButtonText: {
      fontSize: 13,
      color: C.black,
    },
    themeButtonTextActive: {
      color: C.white,
      fontWeight: '600',
    },
    dangerButton: {
      backgroundColor: '#ffeeee',
    },
    dangerText: {
      color: '#d32f2f',
    },
  });

  const ThemeSelector = () => (
    <View style={styles.themeOption}>
      <TouchableOpacity
        style={[styles.themeButton, themeMode === 'light' && styles.themeButtonActive]}
        onPress={() => setThemeMode('light')}
      >
        <Text style={[styles.themeButtonText, themeMode === 'light' && styles.themeButtonTextActive]}>
          ☀️ Light
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.themeButton, themeMode === 'dark' && styles.themeButtonActive]}
        onPress={() => setThemeMode('dark')}
      >
        <Text style={[styles.themeButtonText, themeMode === 'dark' && styles.themeButtonTextActive]}>
          🌙 Dark
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.themeButton, themeMode === 'system' && styles.themeButtonActive]}
        onPress={() => setThemeMode('system')}
      >
        <Text style={[styles.themeButtonText, themeMode === 'system' && styles.themeButtonTextActive]}>
          ⚙️ System
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🎨</Text>
                <View>
                  <Text style={styles.menuText}>Theme</Text>
                  <Text style={styles.menuSubtext}>
                    {themeMode === 'light' ? 'Light mode' : themeMode === 'dark' ? 'Dark mode' : 'Follow system'}
                  </Text>
                </View>
              </View>
              <ThemeSelector />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🔔</Text>
                <Text style={styles.menuText}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: C.input, true: C.button }}
                thumbColor={C.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🌐</Text>
                <Text style={styles.menuText}>Language</Text>
              </View>
              <TouchableOpacity onPress={() => setLanguage(language === 'English' ? 'العربية' : 'English')}>
                <Text style={[styles.menuText, { color: C.button }]}>{language}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.menuItem, styles.lastMenuItem]}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🔤</Text>
                <Text style={styles.menuText}>Font Size</Text>
              </View>
              <TouchableOpacity onPress={() => setFontSize(fontSize === 'Medium' ? 'Large' : 'Medium')}>
                <Text style={[styles.menuText, { color: C.button }]}>{fontSize}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.menuItem, styles.lastMenuItem, styles.dangerButton]}
              onPress={handleLogout}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🚪</Text>
                <Text style={[styles.menuText, styles.dangerText]}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={[styles.menuItem, styles.lastMenuItem]}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>ℹ️</Text>
                <Text style={styles.menuText}>Version</Text>
              </View>
              <Text style={[styles.menuText, { color: C.link }]}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}