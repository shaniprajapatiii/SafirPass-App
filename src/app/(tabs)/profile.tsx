import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/Header";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  STORAGE_KEYS,
  API_ENDPOINTS,
} from "../../config/api";
import { api } from "../../services/apiClient";

export default function ProfileScreen() {
  const { user, kyc, isAuthenticated, signOut } = useAuth();
  const [apiUrl, setApiUrlState] = useState<string>("");
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);

  useEffect(() => {
    getApiBaseUrl().then(setApiUrlState);
    AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_PREF).then((val) => {
      if (val !== null) setBiometricsEnabled(val === "true");
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) return;
    await setApiBaseUrl(apiUrl.trim());
    Alert.alert("Server URL Updated", `Backend URL set to:\n${apiUrl.trim()}`);
    testConnection();
  };

  const handleResetApiUrl = async () => {
    const def = await resetApiBaseUrl();
    setApiUrlState(def);
    Alert.alert("Reset Complete", `Reset to default:\n${def}`);
    testConnection();
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await api.get(API_ENDPOINTS.SESSION);
      if (res.status === 200 || res.status === 401 || res.status === 404) {
        setConnectionStatus("Connected (HTTP 200)");
      } else {
        setConnectionStatus(`Connected (Status ${res.status})`);
      }
    } catch {
      setConnectionStatus("Connection Failed");
    } finally {
      setTestingConnection(false);
    }
  };

  const toggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val);
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_PREF, String(val));
  };

  const handleClearCache = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_CREDENTIAL);
    await AsyncStorage.removeItem(STORAGE_KEYS.KYC_CACHE);
    Alert.alert("Cache Cleared", "Offline passes and local caches cleared.");
  };

  const isVerified = kyc?.status === "verified";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Account &amp; Settings" subtitle="System Configuration" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color="#2563eb" />
          </View>
          <View style={styles.userMetaCol}>
            <Text style={styles.userName}>
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest Tourist"}
            </Text>
            <Text style={styles.userEmail}>{user?.email || "No active account session"}</Text>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isVerified ? "#10b981" : "#f59e0b" },
                ]}
              />
              <Text style={styles.statusText}>
                {isVerified ? "Verified Tourist Pass" : "KYC Verification Needed"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Navigation Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>TOURIST SERVICES</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/kyc" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="document-text" size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Document &amp; Face e-KYC</Text>
              <Text style={styles.menuSub}>Upload passport, visa and take live selfie</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/complaints" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#fff1f2" }]}>
              <Ionicons name="alert-circle" size={18} color="#e11d48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Tourist Grievances &amp; Scam Reports</Text>
              <Text style={styles.menuSub}>Report overcharging, taxi fraud, counterfeit goods</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Backend Server Connection Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>BACKEND SERVER CONNECTIVITY</Text>
          <Text style={styles.settingsDesc}>
            Connects to the same Next.js backend, MongoDB, PostgreSQL, and FastAPI Python ML
            services:
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.urlInput}
              value={apiUrl}
              onChangeText={setApiUrlState}
              placeholder="http://10.0.2.2:3000 or http://192.168.x.x:3000"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveApiUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save URL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testBtn}
              onPress={testConnection}
              disabled={testingConnection}
              activeOpacity={0.8}
            >
              {testingConnection ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.testBtnText}>Test Ping</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetApiUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {connectionStatus && (
            <View style={styles.pingResultBox}>
              <Ionicons
                name={
                  connectionStatus.includes("Connected")
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={
                  connectionStatus.includes("Connected") ? "#059669" : "#dc2626"
                }
              />
              <Text
                style={[
                  styles.pingResultText,
                  {
                    color: connectionStatus.includes("Connected")
                      ? "#059669"
                      : "#dc2626",
                  },
                ]}
              >
                {connectionStatus}
              </Text>
            </View>
          )}
        </View>

        {/* Security & Offline Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SECURITY &amp; CACHE</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Biometric Verification (Face ID / Passkey)</Text>
              <Text style={styles.switchSub}>Require biometrics before approving check-in requests</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
              thumbColor={biometricsEnabled ? "#2563eb" : "#f1f5f9"}
            />
          </View>

          <TouchableOpacity
            style={styles.clearCacheBtn}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#475569" />
            <Text style={styles.clearCacheText}>Clear Offline Pass Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Actions */}
        <View style={styles.authSection}>
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              <Text style={styles.signOutText}>Sign Out of SafirPass</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.authBtnRow}>
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push("/auth/login" as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpBtn}
                onPress={() => router.push("/auth/register" as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpText}>Register Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  userMetaCol: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  userEmail: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  menuSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  settingsDesc: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 8,
    lineHeight: 16,
  },
  inputRow: {
    marginBottom: 8,
  },
  urlInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: "#0f172a",
  },
  btnRow: {
    flexDirection: "row",
    gap: 8,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  testBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
  },
  resetBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  pingResultBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  pingResultText: {
    fontSize: 11,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  switchSub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  clearCacheBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  clearCacheText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  authSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#dc2626",
  },
  authBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  signInBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
  },
  signInText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  signUpBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
  },
  signUpText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563eb",
  },
});
