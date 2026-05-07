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

// ─── Modal Component for Edit ─────────────────────────
function EditModal({ visible, onClose, title, value, onChangeText, onSave, loading, C }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: C.white }]}>
          <Text style={[styles.modalTitle, { color: C.black }]}>{title}</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: C.border, color: C.black }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter new ${title.toLowerCase()}`}
            placeholderTextColor={C.link}
            autoCapitalize="none"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton, { backgroundColor: C.button }]} onPress={onSave} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [nameModal, setNameModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  
  // Input values
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      setCurrentEmail(user.email || '');
      const userData = await getUser(user.uid);
      if (userData?.name) setCurrentName(userData.name);
    }
  };

  const toast = (type, msg) =>
    Toast.show({ type, text1: msg });

  // ─── Update Name ─────────────────────────
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast('error', 'Please enter a name');
      return;
    }
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      await updateUser(user.uid, { name: newName });
      setCurrentName(newName);
      setNameModal(false);
      setNewName('');
      toast('success', 'Name updated successfully!');
    } catch (error) {
      toast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Email ─────────────────────────
  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast('error', 'Please enter an email');
      return;
    }
    
    setLoading(true);
    try {
      await updateUserEmail(newEmail);
      setCurrentEmail(newEmail);
      setEmailModal(false);
      setNewEmail('');
      toast('success', 'Email updated successfully! Please verify your new email.');
    } catch (error) {
      toast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Password ─────────────────────────
  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast('error', 'Please enter current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast('error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('error', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast('success', 'Password updated successfully!');
    } catch (error) {
      toast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete Account ─────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast('error', 'Please enter your password to confirm');
      return;
    }
    
    setLoading(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteModal(false);
      toast('success', 'Account deleted successfully');
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (error) {
      toast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

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
                  <Text style={{ fontSize: 20 }}>☀️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setThemeMode('dark')}>
                  <Text style={{ fontSize: 20 }}>🌙</Text>
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
            sublabel={currentName || 'Not set'}
            onPress={() => setNameModal(true)}
            right={<Chevron />}
            C={C}
          />
          <SettingRow
            icon="📧"
            label="Email"
            sublabel={currentEmail}
            onPress={() => setEmailModal(true)}
            right={<Chevron />}
            C={C}
          />
          <SettingRow
            icon="🔒"
            label="Change Password"
            onPress={() => setPasswordModal(true)}
            right={<Chevron />}
            C={C}
          />
          <SettingRow
            icon="🗑️"
            label="Delete Account"
            danger
            onPress={() => setDeleteModal(true)}
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

      {/* Modals */}
      <EditModal
        visible={nameModal}
        onClose={() => setNameModal(false)}
        title="Name"
        value={newName}
        onChangeText={setNewName}
        onSave={handleUpdateName}
        loading={loading}
        C={C}
      />

      <EditModal
        visible={emailModal}
        onClose={() => setEmailModal(false)}
        title="Email"
        value={newEmail}
        onChangeText={setNewEmail}
        onSave={handleUpdateEmail}
        loading={loading}
        C={C}
      />

      {/* Password Modal */}
      <Modal visible={passwordModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: C.white }]}>
            <Text style={[styles.modalTitle, { color: C.black }]}>Change Password</Text>
            
            <TextInput
              style={[styles.modalInput, { borderColor: C.border, color: C.black }]}
              placeholder="Current Password"
              placeholderTextColor={C.link}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            
            <TextInput
              style={[styles.modalInput, { borderColor: C.border, color: C.black }]}
              placeholder="New Password (min 6 chars)"
              placeholderTextColor={C.link}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            
            <TextInput
              style={[styles.modalInput, { borderColor: C.border, color: C.black }]}
              placeholder="Confirm New Password"
              placeholderTextColor={C.link}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                setPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton, { backgroundColor: C.button }]} onPress={handleUpdatePassword} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: C.white }]}>
            <Text style={[styles.modalTitle, { color: 'red' }]}>⚠️ Delete Account</Text>
            <Text style={[styles.warningText, { color: C.black }]}>
              This action is irreversible! All your data will be permanently deleted.
            </Text>
            
            <TextInput
              style={[styles.modalInput, { borderColor: C.border, color: C.black }]}
              placeholder="Enter your password to confirm"
              placeholderTextColor={C.link}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                setDeleteModal(false);
                setDeletePassword('');
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }]} onPress={handleDeleteAccount} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Delete Forever</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  warningText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
});