import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/Header";
import { DigitalIdCard } from "../../components/DigitalIdCard";
import { DynamicQrView } from "../../components/DynamicQrView";

const SELECTABLE_ATTRIBUTES = [
  { key: "full_name", label: "Full Name", default: true, required: true },
  { key: "nationality", label: "Nationality", default: true, required: true },
  { key: "tourist_id", label: "Tourist ID Number", default: true, required: true },
  { key: "passport_number", label: "Masked Passport (Last 4)", default: false },
  { key: "visa", label: "Visa Type & Ref", default: true },
  { key: "validity", label: "Stay Validity Dates", default: true },
  { key: "emergency_contact", label: "Emergency Contact", default: false },
];

export default function DigitalPassScreen() {
  const { kyc } = useAuth();
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    "full_name",
    "nationality",
    "tourist_id",
    "validity",
  ]);

  const isVerified = kyc?.status === "verified";

  const toggleKey = (key: string) => {
    if (key === "full_name" || key === "tourist_id") return; // Keep core identifier
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Digital Tourist Pass" subtitle="Zero-PII Dynamic Credential" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Verification Check */}
        {!isVerified && (
          <View style={styles.lockWarningBanner}>
            <Ionicons name="lock-closed" size={20} color="#b45309" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.lockWarningTitle}>Credentials Locked (Verification Pending)</Text>
              <Text style={styles.lockWarningText}>
                Your Digital Tourist Pass unlocks automatically once government authorities verify
                your submitted documents.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => router.push("/kyc" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyBtnText}>KYC</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Smart Tourist ID Card */}
        <DigitalIdCard kyc={kyc} />

        {/* Pass Mode Toggle (Dynamic vs Offline) */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeTab, !isOfflineMode && styles.modeTabActive]}
            onPress={() => setIsOfflineMode(false)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-circle"
              size={18}
              color={!isOfflineMode ? "#2563eb" : "#64748b"}
            />
            <Text style={[styles.modeTabText, !isOfflineMode && styles.modeTabTextActive]}>
              Dynamic QR (45s TTL)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, isOfflineMode && styles.modeTabActive]}
            onPress={() => setIsOfflineMode(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cloud-offline"
              size={18}
              color={isOfflineMode ? "#2563eb" : "#64748b"}
            />
            <Text style={[styles.modeTabText, isOfflineMode && styles.modeTabTextActive]}>
              Offline Transit Pass
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Rolling QR Code Component */}
        <DynamicQrView
          kyc={kyc}
          selectedKeys={selectedKeys}
          isOfflineMode={isOfflineMode}
        />

        {/* Privacy Selective Disclosure Controls */}
        <View style={styles.disclosureSection}>
          <View style={styles.disclosureHeader}>
            <View>
              <Text style={styles.disclosureTitle}>Selective Data Disclosure</Text>
              <Text style={styles.disclosureSub}>
                Share only what is necessary with vendors &amp; hotels
              </Text>
            </View>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          </View>

          <View style={styles.attributeList}>
            {SELECTABLE_ATTRIBUTES.map((attr) => {
              const active = selectedKeys.includes(attr.key);
              return (
                <View key={attr.key} style={styles.attributeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attributeLabel}>{attr.label}</Text>
                    {attr.required && (
                      <Text style={styles.requiredTag}>Required identifier</Text>
                    )}
                  </View>
                  <Switch
                    value={active}
                    onValueChange={() => toggleKey(attr.key)}
                    disabled={attr.required}
                    trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                    thumbColor={active ? "#2563eb" : "#f1f5f9"}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Regulatory Protection Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={16} color="#64748b" />
          <Text style={styles.disclaimerText}>
            SafirPass Digital ID is authorized under international privacy frameworks. Hoteliers and
            service operators verify this dynamic token without storing raw passport copies.
          </Text>
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
  lockWarningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fde68a",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
  },
  lockWarningTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#b45309",
  },
  lockWarningText: {
    fontSize: 10,
    color: "#92400e",
    marginTop: 2,
    lineHeight: 14,
  },
  verifyBtn: {
    backgroundColor: "#d97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifyBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  modeTabTextActive: {
    color: "#2563eb",
  },
  disclosureSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  disclosureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
  },
  disclosureTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  disclosureSub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  attributeList: {
    gap: 8,
  },
  attributeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  attributeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  requiredTag: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: "#64748b",
    lineHeight: 14,
  },
});
