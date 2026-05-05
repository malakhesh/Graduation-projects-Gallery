import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { auth } from '../backend/firebase';
import { getUser, updateUser } from '../backend/auth';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const C = Colors[theme];

  // States
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Medium');
  
  // Change Name States
  const [changeNameModal, setChangeNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userData = await getUser(user.uid);
        if (userData && typeof userData === 'object' && userData.name) {
          setCurrentName(userData.name);
          setNewName(userData.name);
        }
      }
    };
    loadUserData();
  }, []);

  const handleChangeName = async () => {
    if (!newName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Name cannot be empty',
        position: 'top',
      });
      return;
    }

    setUpdatingName(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const result = await updateUser(user.uid, { name: newName.trim() });
      
      if (result === 'update-ok') {
        setCurrentName(newName.trim());
        setChangeNameModal(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your name has been updated',
          position: 'top',
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update name. Please try again.',
        position: 'top',
      });
    } finally {
      setUpdatingName(false);
    }
  };

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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: C.white,
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxWidth: 320,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: C.black,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalInput: {
      backgroundColor: C.input,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: C.black,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: C.input,
    },
    modalButtonSave: {
      backgroundColor: C.button,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    modalButtonCancelText: {
      color: C.black,
    },
    modalButtonSaveText: {
      color: C.white,
    },
    nameValue: {
      color: C.button,
      fontWeight: '600',
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

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            
            {/* Change Name */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setNewName(currentName);
                setChangeNameModal(true);
              }}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>✏️</Text>
                <View>
                  <Text style={styles.menuText}>Change Name</Text>
                  <Text style={styles.menuSubtext}>
                    Current: <Text style={styles.nameValue}>{currentName || 'Not set'}</Text>
                  </Text>
                </View>
              </View>
              <Text style={[styles.menuText, { color: C.button }]}>›</Text>
            </TouchableOpacity>

            {/* Change Email (coming soon) */}
            <TouchableOpacity style={styles.menuItem} disabled>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>📧</Text>
                <View>
                  <Text style={styles.menuText}>Change Email</Text>
                  <Text style={styles.menuSubtext}>Coming soon</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Change Password (coming soon) */}
            <TouchableOpacity style={styles.menuItem} disabled>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🔒</Text>
                <View>
                  <Text style={styles.menuText}>Change Password</Text>
                  <Text style={styles.menuSubtext}>Coming soon</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Delete Account (coming soon) */}
            <TouchableOpacity 
              style={[styles.menuItem, styles.lastMenuItem]}
              disabled
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>🗑️</Text>
                <View>
                  <Text style={[styles.menuText, { color: C.error }]}>Delete Account</Text>
                  <Text style={styles.menuSubtext}>Coming soon</Text>
                </View>
              </View>
            </TouchableOpacity>
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

        {/* Logout Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
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

      {/* Change Name Modal */}
      <Modal
        visible={changeNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setChangeNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter new name"
              placeholderTextColor={C.link}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setChangeNameModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleChangeName}
                disabled={updatingName}
              >
                {updatingName ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonSaveText]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}