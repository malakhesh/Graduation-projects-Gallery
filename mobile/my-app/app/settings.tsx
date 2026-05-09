import React, { ReactNode, useEffect, useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";
import { auth, db } from "../backend/firebase";
import { getUser, updateUser } from "../backend/auth";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import Toast from "react-native-toast-message";

type AppColors = {
  bg: string;
  white: string;
  black: string;
  border: string;
  link: string;
  button: string;
  chip: string;
  error: string;
  errorBg: string;
};

type ToastType = "success" | "error" | "info";

type PendingActionType = {
  action: "email" | "password" | "delete";
  data?: unknown;
} | null;

type EditModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  loading: boolean;
  C: AppColors;
};

type ReauthModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void | Promise<void>;
  loading: boolean;
  C: AppColors;
  title: string;
  action: string;
};

type SettingRowProps = {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
  isLast?: boolean;
  C: AppColors;
};

type SectionProps = {
  title: string;
  children: ReactNode;
  C: AppColors;
};


function EditModal({
  visible,
  onClose,
  title,
  value,
  onChangeText,
  onSave,
  loading,
  C,
}: EditModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: C.white }]}>
          <Text style={[styles.modalTitle, { color: C.black }]}>{title}</Text>

          <TextInput
            style={[
              styles.modalInput,
              {
                borderColor: C.border,
                color: C.black,
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter new ${title.toLowerCase()}`}
            placeholderTextColor={C.link}
            autoCapitalize="none"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { backgroundColor: C.button },
              ]}
              onPress={onSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


function ReauthModal({
  visible,
  onClose,
  onConfirm,
  loading,
  C,
  title,
  action,
}: ReauthModalProps) {
  const [password, setPassword] = useState<string>("");

  const handleConfirm = () => {
    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter your password",
      });
      return;
    }

    onConfirm(password);
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: C.white }]}>
          <Text style={[styles.modalTitle, { color: C.black }]}>{title}</Text>

          <Text style={[styles.warningText, { color: C.black }]}>
            For security, please confirm your password to {action}
          </Text>

          <TextInput
            style={[
              styles.modalInput,
              {
                borderColor: C.border,
                color: C.black,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={C.link}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { backgroundColor: C.button },
              ]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  right,
  danger = false,
  isLast = false,
  C,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.85}
      style={[
        styles.row,
        { borderBottomColor: C.border },
        isLast && { borderBottomWidth: 0 },
        danger && { backgroundColor: C.errorBg },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: danger ? "#ffd6d6" : C.chip,
          },
        ]}
      >
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      <View style={styles.rowMid}>
        <Text style={[styles.rowLabel, { color: danger ? C.error : C.black }]}>
          {label}
        </Text>

        {!!sublabel && (
          <Text style={[styles.rowSub, { color: C.link }]}>{sublabel}</Text>
        )}
      </View>

      {right ? <View>{right}</View> : null}
    </TouchableOpacity>
  );
}

function Section({ title, children, C }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.button }]}>{title}</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: C.white,
            borderColor: C.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();

  const themeColors = Colors[theme] as any;

  const C: AppColors = {
    bg: themeColors.bg || "#F5ECE4",
    white: themeColors.white || "#FFFBF5",
    black: themeColors.black || "#2F1C0F",
    border: themeColors.border || "#E5D8CF",
    link: themeColors.link || "#A4846D",
    button: themeColors.button || "#68442A",
    chip: themeColors.chip || "#EFE3DA",
    error: themeColors.error || "#D9534F",
    errorBg: "#fff0f0",
  };

  const [currentName, setCurrentName] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [nameModal, setNameModal] = useState<boolean>(false);
  const [emailModal, setEmailModal] = useState<boolean>(false);
  const [passwordModal, setPasswordModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [reauthModal, setReauthModal] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [pendingAction, setPendingAction] = useState<PendingActionType>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong";
  };

  const toast = (type: ToastType, msg: string) => {
    Toast.show({
      type,
      text1: msg,
    });
  };

  const loadUserData = async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      setCurrentEmail(user.email || "");

      const userData = (await getUser(user.uid)) as any;

      if (userData?.name) {
        setCurrentName(userData.name);
        setNewName(userData.name);
      }

      if (user.email) {
        setNewEmail(user.email);
      }
    } catch (error) {
      toast("error", getErrorMessage(error));
    }
  };

  const reauthenticateUser = async (password: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user logged in");
    }

    if (!user.email) {
      throw new Error("No email found for this user");
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    return true;
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast("error", "Please enter a name");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      toast("error", "No user logged in");
      return;
    }

    setLoading(true);

    try {
      await updateUser(user.uid, {
        name: newName.trim(),
      });

      setCurrentName(newName.trim());
      setNameModal(false);

      toast("success", "Name updated successfully!");
    } catch (error) {
      toast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (password: string) => {
    if (!newEmail.trim()) {
      toast("error", "Please enter an email");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      toast("error", "No user logged in");
      return;
    }

    setLoading(true);

    try {
      await reauthenticateUser(password);

      await updateEmail(user, newEmail.trim());

      await updateUser(user.uid, {
        email: newEmail.trim(),
      });

      setCurrentEmail(newEmail.trim());
      setEmailModal(false);
      setReauthModal(false);

      toast("success", "Email updated successfully! Please sign in again.");

      setTimeout(() => {
        auth.signOut();
        router.replace("/login" as any);
      }, 2000);
    } catch (error) {
      toast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast("error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("error", "Passwords do not match");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      toast("error", "No user logged in");
      return;
    }

    setLoading(true);

    try {
      await reauthenticateUser(password);

      await updatePassword(user, newPassword);

      setPasswordModal(false);
      setReauthModal(false);
      setNewPassword("");
      setConfirmPassword("");

      toast("success", "Password updated successfully! Please sign in again.");

      setTimeout(() => {
        auth.signOut();
        router.replace("/login" as any);
      }, 2000);
    } catch (error) {
      toast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    const user = auth.currentUser;

    if (!user) {
      toast("error", "No user logged in");
      return;
    }

    setLoading(true);

    try {
      await reauthenticateUser(password);

      await deleteDoc(doc(db, "users", user.uid));

      await deleteUser(user);

      setDeleteModal(false);
      setReauthModal(false);

      toast("success", "Account deleted successfully");

      setTimeout(() => {
        router.replace("/login" as any);
      }, 1500);
    } catch (error) {
      toast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        onPress: async () => {
          await auth.signOut();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const openReauthModal = (
    action: "email" | "password" | "delete",
    data?: unknown
  ) => {
    setPendingAction({
      action,
      data,
    });

    setReauthModal(true);
  };

  const handleReauthConfirm = async (password: string) => {
    if (pendingAction?.action === "email") {
      await handleUpdateEmail(password);
    } else if (pendingAction?.action === "password") {
      await handleUpdatePassword(password);
    } else if (pendingAction?.action === "delete") {
      await handleDeleteAccount(password);
    }

    setPendingAction(null);
  };

  const Chevron = () => <Text style={{ fontSize: 22, color: C.link }}>›</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: C.black }]}>Settings</Text>
        </View>

        <Section title="Appearance" C={C}>
          <SettingRow
            icon="🌗"
            label="Theme"
            sublabel={String(themeMode)}
            C={C}
            isLast
            right={
              <View style={styles.themeActions}>
                <TouchableOpacity
                  onPress={() => setThemeMode("light")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.themeIcon}>☀️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setThemeMode("dark")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.themeIcon}>🌙</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </Section>

        <Section title="Projects" C={C}>
          <SettingRow
            icon="📁"
            label="Project Management"
            sublabel="Hide / Show your projects"
            onPress={() => router.push("/project-management" as any)}
            right={<Chevron />}
            C={C}
            isLast
          />
        </Section>

        <Section title="Account" C={C}>
          <SettingRow
            icon="👤"
            label="Name"
            sublabel={currentName || "Not set"}
            onPress={() => {
              setNewName(currentName);
              setNameModal(true);
            }}
            right={<Chevron />}
            C={C}
          />

          <SettingRow
            icon="📧"
            label="Email"
            sublabel={currentEmail || "Not set"}
            onPress={() => {
              setNewEmail(currentEmail);
              setEmailModal(true);
            }}
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
        onSave={() => openReauthModal("email")}
        loading={loading}
        C={C}
      />

      <Modal visible={passwordModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: C.white }]}>
            <Text style={[styles.modalTitle, { color: C.black }]}>
              Change Password
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: C.border,
                  color: C.black,
                },
              ]}
              placeholder="New Password (min 6 chars)"
              placeholderTextColor={C.link}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: C.border,
                  color: C.black,
                },
              ]}
              placeholder="Confirm New Password"
              placeholderTextColor={C.link}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { backgroundColor: C.button },
                ]}
                onPress={() => openReauthModal("password")}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={deleteModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: C.white }]}>
            <Text style={[styles.modalTitle, { color: C.error }]}>
              ⚠️ Delete Account
            </Text>

            <Text style={[styles.warningText, { color: C.black }]}>
              This action is irreversible! All your data will be permanently
              deleted.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: C.error }]}
                onPress={() => openReauthModal("delete")}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Delete Forever</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ReauthModal
        visible={reauthModal}
        onClose={() => {
          setReauthModal(false);
          setPendingAction(null);
        }}
        onConfirm={handleReauthConfirm}
        loading={loading}
        C={C}
        title="Confirm Password"
        action={
          pendingAction?.action === "email"
            ? "change your email"
            : pendingAction?.action === "password"
              ? "change your password"
              : "delete your account"
        }
      />

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "700",
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  row: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    borderBottomWidth: 1,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
  },

  rowSub: {
    fontSize: 12,
  },

  themeActions: {
    flexDirection: "row",
    gap: 6,
  },

  themeIcon: {
    fontSize: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#e0e0e0",
  },

  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: "#007AFF",
  },

  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },

  warningText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
});