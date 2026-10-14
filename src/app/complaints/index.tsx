import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { useSafety } from "../../context/SafetyContext";
import { api } from "../../services/apiClient";
import { API_ENDPOINTS } from "../../config/api";
import { Complaint } from "../../types";

const CATEGORIES = [
  { id: "taxi_overcharging", label: "Taxi Overcharging", icon: "car" },
  { id: "fake_tour_guide", label: "Fake Guide Scam", icon: "pricetag" },
  { id: "hotel_fraud", label: "Hotel Repudiation", icon: "business" },
  { id: "counterfeit_goods", label: "Counterfeit Gem/Silk", icon: "bag-handle" },
  { id: "theft", label: "Theft / Lost Bags", icon: "briefcase" },
  { id: "other_scam", label: "General Extortion", icon: "alert-circle" },
];

export default function ComplaintsScreen() {
  const { currentCoords } = useSafety();
  const [activeTab, setActiveTab] = useState<"report" | "track">("report");

  // Form State
  const [category, setCategory] = useState<string>("taxi_overcharging");
  const [vendorName, setVendorName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("INR");
  const [locationName, setLocationName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Complaints List
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  const loadComplaints = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get<{ success: boolean; complaints: Complaint[] }>(
        API_ENDPOINTS.COMPLAINTS
      );
      if (res.ok && res.data?.complaints) {
        setComplaints(res.data.complaints);
      }
    } catch {}
    setLoadingList(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComplaints();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadComplaints]);

  const handleSubmit = async () => {
    if (!description.trim() || description.trim().length < 10) {
      Alert.alert("Description Required", "Please provide at least 10 characters describing the incident.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        vendorName: vendorName.trim(),
        amount: amount.trim(),
        currency,
        location: locationName.trim() || "India",
        latitude: currentCoords?.latitude || null,
        longitude: currentCoords?.longitude || null,
        description: description.trim(),
      };

      const res = await api.post(API_ENDPOINTS.COMPLAINTS, payload);

      if (!res.ok) {
        Alert.alert("Submission Failed", res.error || "Could not file complaint.");
        return;
      }

      Alert.alert(
        "Grievance Lodged",
        `Complaint reference ${res.data?.complaint?.reference_no || "REF-COMPLAINT"} forwarded to Tourist Police Cell.`,
        [
          {
            text: "View Status",
            onPress: () => {
              setActiveTab("track");
              loadComplaints();
            },
          },
        ]
      );

      // Reset form
      setVendorName("");
      setAmount("");
      setDescription("");
      setLocationName("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to lodge complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Tourist Grievance Portal" subtitle="Police &amp; Consumer Liaison" showBack />

      {/* Tabs Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "report" && styles.tabBtnActive]}
          onPress={() => setActiveTab("report")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={activeTab === "report" ? "#2563eb" : "#64748b"}
          />
          <Text style={[styles.tabBtnText, activeTab === "report" && styles.tabBtnTextActive]}>
            File Scam Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "track" && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab("track");
            loadComplaints();
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={activeTab === "track" ? "#2563eb" : "#64748b"}
          />
          <Text style={[styles.tabBtnText, activeTab === "track" && styles.tabBtnTextActive]}>
            Track Complaints ({complaints.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === "report" ? (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Lodge Incident or Fraud Report</Text>
            <Text style={styles.formDesc}>
              Submissions are directly routed to the Ministry of Tourism Incident Liaison Cell and
              State Tourist Police.
            </Text>

            {/* Category Select */}
            <Text style={styles.inputLabel}>SCAM / FRAUD CLASSIFICATION</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={15}
                      color={active ? "#ffffff" : "#475569"}
                    />
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Merchant Details */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OPERATOR / DRIVER / HOTEL NAME</Text>
              <TextInput
                style={styles.input}
                value={vendorName}
                onChangeText={setVendorName}
                placeholder="e.g. Yellow Taxi DL-1T-4932 or Emporium name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Amount Extorted */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.inputLabel}>EXTORTED / OVERCHARGED AMOUNT</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 2500"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CURRENCY</Text>
                <TextInput
                  style={styles.input}
                  value={currency}
                  onChangeText={setCurrency}
                  placeholder="INR"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>INCIDENT LOCATION / LANDMARK</Text>
              <TextInput
                style={styles.input}
                value={locationName}
                onChangeText={setLocationName}
                placeholder="e.g. New Delhi Railway Station Paharganj Exit"
                placeholderTextColor="#94a3b8"
              />
              {currentCoords && (
                <Text style={styles.gpsAutoTag}>
                  ✓ Auto-tagged coordinates: {currentCoords.latitude.toFixed(4)},{" "}
                  {currentCoords.longitude.toFixed(4)}
                </Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DETAILED ACCOUNT OF INCIDENT</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Explain what transpired, vehicle license plates, witness remarks, or fake documents presented..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Submit Complaint to Authority</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* TRACK COMPLAINTS TAB */
          <View style={styles.trackSection}>
            <Text style={styles.formTitle}>Your Active Grievances</Text>
            {loadingList ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 24 }} />
            ) : complaints.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="document-text-outline" size={40} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No filed complaints</Text>
                <Text style={styles.emptyDesc}>
                  You have not submitted any grievance reports yet.
                </Text>
              </View>
            ) : (
              complaints.map((c, idx) => (
                <View key={idx} style={styles.complaintCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.refCode}>{c.reference_no || "TID-GRIEVANCE"}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            c.status === "resolved"
                              ? "#dcfce7"
                              : c.status === "action_taken"
                              ? "#e0e7ff"
                              : "#fef3c7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              c.status === "resolved"
                                ? "#166534"
                                : c.status === "action_taken"
                                ? "#3730a3"
                                : "#92400e",
                          },
                        ]}
                      >
                        {c.status?.replace(/_/g, " ").toUpperCase() || "SUBMITTED"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardCategory}>
                    Category: {c.category?.replace(/_/g, " ").toUpperCase()}
                  </Text>
                  {c.vendor_name ? (
                    <Text style={styles.cardVendor}>Operator: {c.vendor_name}</Text>
                  ) : null}
                  <Text style={styles.cardDesc}>{c.description}</Text>

                  {c.amount ? (
                    <Text style={styles.cardAmount}>
                      Reported loss: {c.currency || "INR"} {c.amount}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  tabBtnTextActive: {
    color: "#2563eb",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formSection: {
    gap: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  formDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  inputGroup: {
    gap: 4,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  gpsAutoTag: {
    fontSize: 10,
    fontWeight: "600",
    color: "#059669",
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  trackSection: {
    gap: 12,
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  complaintCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refCode: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
    color: "#0f172a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 6,
  },
  cardVendor: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 16,
    marginTop: 6,
  },
  cardAmount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#e11d48",
    marginTop: 6,
  },
});
