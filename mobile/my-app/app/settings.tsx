import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { auth } from '../backend/firebase';
import { getUser, updateUser } from '../backend/auth';
import {
  updateUserEmail,
  updateUserPassword,
  deleteAccount,
} from '../backend/Dashsettings';
import Toast from 'react-native-toast-message';

// ─── Animated Row ─────────────────────────
function SettingRow({ icon, label, sublabel, onPress, right, danger = false, isLast = false, C }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.row,
          { borderBottomColor: C.border },
          isLast && { borderBottomWidth: 0 },
          danger && { backgroundColor: C.errorBg },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: danger ? '#ffd6d6' : C.chip }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.rowMid}>
          <Text style={[styles.rowLabel, { color: danger ? C.error : C.black }]}>{label}</Text>
          {sublabel && <Text style={[styles.rowSub, { color: C.link }]}>{sublabel}</Text>}
        </View>
        <View>{right}</View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Section ─────────────────────────
function Section({ title, children, C }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.button }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: C.white, borderColor: C.border }]}>
        {children}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────
export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const C = { ...Colors[theme], errorBg: '#fff0f0' };

  const [currentName, setCurrentName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentEmail(user.email || '');
      getUser(user.uid).then((d) => {
        if (d?.name) setCurrentName(d.name);
      });
    }
  }, []);

  const toast = (type, msg) =>
    Toast.show({ type, text1: msg });

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Log Out',
        onPress: async () => {
          await auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const Chevron = () => <Text style={{ fontSize: 22, color: C.link }}>›</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Theme */}
        <Section title="Appearance" C={C}>
          <SettingRow
            icon="🌗"
            label="Theme"
            sublabel={themeMode}
            C={C}
            isLast
            right={
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={() => setThemeMode('light')}>
                  <Text>☀️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setThemeMode('dark')}>
                  <Text>🌙</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </Section>

        {/* Project Management */}
        <Section title="Projects" C={C}>
          <SettingRow
            icon="📁"
            label="Project Management"
            sublabel="Hide / Show your projects"
            onPress={() => router.push('/project-management')}
            right={<Chevron />}
            C={C}
            isLast
          />
        </Section>

        {/* Account */}
        <Section title="Account" C={C}>
          <SettingRow
            icon="👤"
            label="Name"
            sublabel={currentName}
            C={C}
          />
          <SettingRow
            icon="📧"
            label="Email"
            sublabel={currentEmail}
            C={C}
          />
          <SettingRow
            icon="🔒"
            label="Change Password"
            onPress={() => toast('info', 'Coming soon')}
            C={C}
          />
          <SettingRow
            icon="🗑️"
            label="Delete Account"
            danger
            onPress={() => toast('info', 'Coming soon')}
            C={C}
            isLast
          />
        </Section>

        {/* Logout */}
        <Section title="Security" C={C}>
          <SettingRow
            icon="🚪"
            label="Log Out"
            onPress={handleLogout}
            danger
            isLast
            C={C}
          />
        </Section>

      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────
const styles = StyleSheet.create({
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  rowMid: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
  },
});