import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSafety } from "../../context/SafetyContext";
import { Header } from "../../components/Header";
import { SosPanicButton } from "../../components/SosPanicButton";
import { api } from "../../services/apiClient";
import { API_ENDPOINTS } from "../../config/api";
import { SosAlert } from "../../types";

type CategoryType = "medical" | "crime" | "harassment" | "disaster" | "general";

const CATEGORIES: {
  id: CategoryType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { id: "medical", label: "Medical Crisis", icon: "medkit", color: "#dc2626" },
  { id: "crime", label: "Assault / Crime", icon: "shield", color: "#b91c1c" },
  { id: "harassment", label: "Harassment", icon: "hand-left", color: "#d97706" },
  { id: "disaster", label: "Natural Hazard", icon: "rainy", color: "#2563eb" },
  { id: "general", label: "General 112", icon: "alert-circle", color: "#7c3aed" },
];

export default function SosScreen() {
  const { currentCoords } = useSafety();
  const [category, setCategory] = useState<CategoryType>("medical");
  const [notes, setNotes] = useState<string>("");
  const [recentAlerts, setRecentAlerts] = useState<SosAlert[]>([]);
  const [alertSuccess, setAlertSuccess] = useState<boolean>(false);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; alerts: SosAlert[] }>(API_ENDPOINTS.SOS);
      if (res.ok && res.data?.alerts) {
        setRecentAlerts(res.data.alerts);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAlerts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAlerts]);

  const handleDial = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert("Dial Error", `Could not launch dialer for ${number}`);
    });
  };

  const onSosTriggered = () => {
    setAlertSuccess(true);
    setNotes("");
    loadAlerts();
    setTimeout(() => setAlertSuccess(false), 8000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Emergency Incident Grid" subtitle="112 National Police &amp; Dispatch" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Success Alert Banner */}
        {alertSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.successBannerTitle}>EMERGENCY SOS TRANSMITTED</Text>
              <Text style={styles.successBannerText}>
                Telemetry transmitted to National 112 Control Room &amp; Local Police. Keep line
                open.
              </Text>
            </View>
          </View>
        )}

        {/* Live GPS Telemetry Box */}
        <View style={styles.telemetryCard}>
          <View style={styles.telemetryHeader}>
            <View style={styles.gpsPill}>
              <View style={styles.livePulseDot} />
              <Text style={styles.gpsPillText}>LIVE SATELLITE GPS LOCK</Text>
            </View>
            <Ionicons name="navigate" size={16} color="#059669" />
          </View>

          <View style={styles.coordsRow}>
            <View style={styles.coordCol}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue}>
                {currentCoords ? currentCoords.latitude.toFixed(6) : "Locking..."}
              </Text>
            </View>
            <View style={styles.coordCol}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue}>
                {currentCoords ? currentCoords.longitude.toFixed(6) : "Locking..."}
              </Text>
            </View>
            <View style={styles.coordCol}>
              <Text style={styles.coordLabel}>ACCURACY</Text>
              <Text style={styles.coordValue}>
                {currentCoords?.accuracy ? `±${Math.round(currentCoords.accuracy)}m` : "High"}
              </Text>
            </View>
          </View>
        </View>

        {/* Incident Classification Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT INCIDENT CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.categoryChip,
                    active && { backgroundColor: c.color, borderColor: c.color },
                  ]}
                  onPress={() => setCategory(c.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={c.icon}
                    size={16}
                    color={active ? "#ffffff" : "#475569"}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Optional Distress Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADDITIONAL DISTRESS NOTES (OPTIONAL)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Describe nature of crisis, landmark, or specific assistance needed..."
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Giant Hold-to-Trigger SOS Button */}
        <SosPanicButton
          category={category}
          notes={notes}
          onSuccess={onSosTriggered}
        />

        {/* Direct Helpline Calling Buttons */}
        <View style={styles.quickCallRow}>
          <TouchableOpacity
            style={[styles.quickCallBtn, { backgroundColor: "#dc2626" }]}
            onPress={() => handleDial("112")}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#ffffff" />
            <Text style={styles.quickCallBtnText}>Call 112 Police</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCallBtn, { backgroundColor: "#2563eb" }]}
            onPress={() => handleDial("1363")}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#ffffff" />
            <Text style={styles.quickCallBtnText}>Call 1363 Tourism</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Alerts Dossier */}
        {recentAlerts.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>RECENT INCIDENT DISPATCHES</Text>
            {recentAlerts.slice(0, 3).map((alert, idx) => (
              <View key={idx} style={styles.alertCard}>
                <View style={styles.alertCardHeader}>
                  <Text style={styles.alertRefText}>{alert.reference || "INC-EMERGENCY"}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          alert.status === "resolved" ? "#dcfce7" : "#fee2e2",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            alert.status === "resolved" ? "#166534" : "#991b1b",
                        },
                      ]}
                    >
                      {alert.status?.toUpperCase() || "ACTIVE"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.alertNotesText}>{alert.notes}</Text>
                <Text style={styles.alertResponderText}>
                  Responder: {alert.responder || "112 Central Command"}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    elevation: 4,
  },
  successBannerTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  successBannerText: {
    fontSize: 11,
    color: "#d1fae5",
    marginTop: 2,
    lineHeight: 15,
  },
  telemetryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  telemetryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  gpsPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  gpsPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.6,
  },
  coordsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordCol: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.6,
  },
  coordValue: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "monospace",
    color: "#0f172a",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  notesInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 12,
    fontSize: 12,
    color: "#0f172a",
    textAlignVertical: "top",
    minHeight: 56,
  },
  quickCallRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 8,
  },
  quickCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
  },
  quickCallBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  alertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  alertCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertRefText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
    color: "#0f172a",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "800",
  },
  alertNotesText: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
    lineHeight: 15,
  },
  alertResponderText: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
  },
});
