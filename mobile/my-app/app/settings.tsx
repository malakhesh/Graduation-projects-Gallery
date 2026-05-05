import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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

// ─── Animated Row ────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  right,
  danger = false,
  disabled = false,
  isLast = false,
  C,
}: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
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
          {sublabel ? (
            <Text style={[styles.rowSub, { color: C.link }]} numberOfLines={1}>
              {sublabel}
            </Text>
          ) : null}
        </View>
        <View style={styles.rowRight}>{right}</View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, children, C }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.button }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: C.white, borderColor: C.border }]}>
        {children}
      </View>
    </View>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────
function ModalShell({ visible, onClose, title, children, C }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: C.white }]}>
          <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
          <Text style={[styles.modalTitle, { color: C.black }]}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const C = { ...Colors[theme], errorBg: theme === 'dark' ? '#3a1a1a' : '#fff0f0' };

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  // user data
  const [currentName, setCurrentName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  // modals
  const [nameModal, setNameModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  // fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // loading
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // show/hide password toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeletePw, setShowDeletePw] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentEmail(user.email || '');
      getUser(user.uid).then((data: any) => {
        if (data?.name) { setCurrentName(data.name); setNewName(data.name); }
      });
    }
  }, []);

  // ── handlers ──
  const handleChangeName = async () => {
    if (!newName.trim()) return toast('error', 'Name cannot be empty');
    setLoadingName(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error();
      const res = await updateUser(user.uid, { name: newName.trim() });
      if (res === 'update-ok') {
        setCurrentName(newName.trim());
        setNameModal(false);
        toast('success', 'Name updated successfully');
      } else throw new Error();
    } catch { toast('error', 'Could not update name'); }
    finally { setLoadingName(false); }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !emailPassword) return toast('error', 'Fill all fields');
    setLoadingEmail(true);
    try {
      const res = await updateUserEmail(newEmail.trim(), emailPassword);
      if (res === 'email-updated') {
        setCurrentEmail(newEmail.trim());
        setEmailModal(false);
        setEmailPassword('');
        toast('success', 'Email updated successfully');
      } else throw new Error();
    } catch { toast('error', 'Could not update email. Check your password.'); }
    finally { setLoadingEmail(false); }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword)
      return toast('error', 'Fill all fields');
    if (newPassword !== confirmPassword)
      return toast('error', 'Passwords do not match');
    if (newPassword.length < 6)
      return toast('error', 'Password must be at least 6 characters');
    setLoadingPassword(true);
    try {
      const res = await updateUserPassword(oldPassword, newPassword);
      if (res === 'password-updated') {
        setPasswordModal(false);
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        toast('success', 'Password updated successfully');
      } else throw new Error();
    } catch { toast('error', 'Could not update password. Check your current password.'); }
    finally { setLoadingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast('error', 'Enter your password to confirm');
    setLoadingDelete(true);
    try {
      const res = await deleteAccount(deletePassword);
      if (res === 'account-deleted') {
        router.replace('/login');
      } else throw new Error();
    } catch { toast('error', 'Could not delete account. Check your password.'); }
    finally { setLoadingDelete(false); }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          await auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const toast = (type: string, msg: string) =>
    Toast.show({ type, text1: msg, position: 'top' });

  // ── theme pill ──
  const ThemePill = ({ mode, label }: { mode: string; label: string }) => (
    <TouchableOpacity
      onPress={() => setThemeMode(mode as any)}
      style={[
        styles.themePill,
        { backgroundColor: themeMode === mode ? C.button : C.chip },
      ]}
    >
      <Text style={[styles.themePillText, { color: themeMode === mode ? C.white : C.link }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ChevronRight = () => (
    <Text style={[styles.chevron, { color: C.link }]}>›</Text>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.black }]}>Settings</Text>
          <Text style={[styles.headerSub, { color: C.link }]}>Manage your account & preferences</Text>
        </View>

        {/* ── Appearance ── */}
        <Section title="🎨  Appearance" C={C}>
          <SettingRow
            icon="🌗"
            label="Theme"
            sublabel={themeMode === 'light' ? 'Light mode' : themeMode === 'dark' ? 'Dark mode' : 'System default'}
            C={C}
            isLast
            right={
              <View style={styles.themeRow}>
                <ThemePill mode="light" label="☀️" />
                <ThemePill mode="dark" label="🌙" />
                <ThemePill mode="system" label="⚙️" />
              </View>
            }
          />
        </Section>

        {/* ── Account ── */}
        <Section title="👤  Account" C={C}>
          <SettingRow
            icon="✏️" label="Change Name"
            sublabel={currentName || 'Not set'}
            onPress={() => { setNewName(currentName); setNameModal(true); }}
            right={<ChevronRight />} C={C}
          />
          <SettingRow
            icon="📧" label="Change Email"
            sublabel={currentEmail || 'Not set'}
            onPress={() => { setNewEmail(currentEmail); setEmailModal(true); }}
            right={<ChevronRight />} C={C}
          />
          <SettingRow
            icon="🔒" label="Change Password"
            sublabel="Update your password"
            onPress={() => setPasswordModal(true)}
            right={<ChevronRight />} C={C}
          />
          <SettingRow
            icon="🗑️" label="Delete Account"
            sublabel="Permanently remove your account"
            onPress={() => setDeleteModal(true)}
            danger isLast C={C}
            right={<ChevronRight />}
          />
        </Section>

        {/* ── Preferences ── */}
        <Section title="⚙️  Preferences" C={C}>
          <SettingRow
            icon="🔔" label="Notifications"
            sublabel={notifications ? 'Enabled' : 'Disabled'}
            C={C}
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: C.input, true: C.button }}
                thumbColor={C.white}
              />
            }
          />
          <SettingRow
            icon="🌐" label="Language"
            sublabel="App display language"
            C={C} isLast
            right={
              <TouchableOpacity
                onPress={() => setLanguage(l => l === 'English' ? 'العربية' : 'English')}
                style={[styles.badge, { backgroundColor: C.chip }]}
              >
                <Text style={[styles.badgeText, { color: C.button }]}>{language}</Text>
              </TouchableOpacity>
            }
          />
        </Section>

        {/* ── Security ── */}
        <Section title="🔐  Security" C={C}>
          <SettingRow
            icon="🚪" label="Log Out"
            sublabel="Sign out of your account"
            onPress={handleLogout}
            danger isLast C={C}
            right={<ChevronRight />}
          />
        </Section>

        {/* ── About ── */}
        <Section title="ℹ️  About" C={C}>
          <SettingRow
            icon="📱" label="App Version"
            sublabel="GradHub Mobile"
            C={C} isLast
            right={<Text style={[styles.versionText, { color: C.link }]}>v1.0.0</Text>}
          />
        </Section>
      </ScrollView>

      {/* ══ MODALS ══ */}

      {/* Change Name */}
      <ModalShell visible={nameModal} onClose={() => setNameModal(false)} title="Change Name" C={C}>
        <InputField label="Full Name" value={newName} onChangeText={setNewName} placeholder="Enter new name" C={C} />
        <ModalActions
          onCancel={() => setNameModal(false)}
          onSave={handleChangeName}
          loading={loadingName} C={C}
        />
      </ModalShell>

      {/* Change Email */}
      <ModalShell visible={emailModal} onClose={() => setEmailModal(false)} title="Change Email" C={C}>
        <InputField label="New Email" value={newEmail} onChangeText={setNewEmail} placeholder="Enter new email" keyboardType="email-address" C={C} />
        <InputField label="Current Password" value={emailPassword} onChangeText={setEmailPassword} placeholder="Confirm with password" secure C={C} />
        <ModalActions
          onCancel={() => { setEmailModal(false); setEmailPassword(''); }}
          onSave={handleChangeEmail}
          loading={loadingEmail} C={C}
        />
      </ModalShell>

      {/* Change Password */}
      <ModalShell visible={passwordModal} onClose={() => setPasswordModal(false)} title="Change Password" C={C}>
        <PasswordField label="Current Password" value={oldPassword} onChange={setOldPassword} show={showOld} toggleShow={() => setShowOld(v => !v)} C={C} />
        <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} toggleShow={() => setShowNew(v => !v)} C={C} />
        <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} toggleShow={() => setShowConfirm(v => !v)} C={C} />
        <ModalActions
          onCancel={() => { setPasswordModal(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
          onSave={handleChangePassword}
          loading={loadingPassword} C={C}
        />
      </ModalShell>

      {/* Delete Account */}
      <ModalShell visible={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account" C={C}>
        <Text style={[styles.deleteWarning, { color: C.error }]}>
          ⚠️ This action is permanent and cannot be undone. All your data will be deleted.
        </Text>
        <PasswordField label="Enter Password to Confirm" value={deletePassword} onChange={setDeletePassword} show={showDeletePw} toggleShow={() => setShowDeletePw(v => !v)} C={C} />
        <ModalActions
          onCancel={() => { setDeleteModal(false); setDeletePassword(''); }}
          onSave={handleDeleteAccount}
          loading={loadingDelete}
          saveLabel="Delete"
          danger C={C}
        />
      </ModalShell>

      <Toast />
    </SafeAreaView>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function InputField({ label, value, onChangeText, placeholder, keyboardType, secure, C }: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: C.link }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: C.input, color: C.black }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.link}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

function PasswordField({ label, value, onChange, show, toggleShow, C }: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: C.link }]}>{label}</Text>
      <View style={[styles.pwRow, { backgroundColor: C.input }]}>
        <TextInput
          style={[styles.pwInput, { color: C.black }]}
          value={value}
          onChangeText={onChange}
          placeholder="••••••••"
          placeholderTextColor={C.link}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
          <Text style={[styles.eyeText, { color: C.button }]}>{show ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ModalActions({ onCancel, onSave, loading, saveLabel = 'Save', danger = false, C }: any) {
  return (
    <View style={styles.modalActions}>
      <TouchableOpacity
        style={[styles.modalBtn, { backgroundColor: C.chip }]}
        onPress={onCancel}
      >
        <Text style={[styles.modalBtnText, { color: C.black }]}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modalBtn, { backgroundColor: danger ? C.error : C.button }]}
        onPress={onSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator size="small" color={C.white} />
          : <Text style={[styles.modalBtnText, { color: C.white }]}>{saveLabel}</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, marginTop: 2 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
  rowMid: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 1 },
  rowRight: { alignItems: 'flex-end' },
  chevron: { fontSize: 22, fontWeight: '300' },

  themeRow: { flexDirection: 'row', gap: 6 },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  themePillText: { fontSize: 14 },

  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  versionText: { fontSize: 14, fontWeight: '600' },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  fieldInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  pwRow: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
  },
  pwInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  eyeBtn: { paddingLeft: 8 },
  eyeText: { fontSize: 13, fontWeight: '700' },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '700' },

  deleteWarning: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
  },
});
