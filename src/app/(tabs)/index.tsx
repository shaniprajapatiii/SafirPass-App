import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useSafety } from "../../context/SafetyContext";
import { useConsent } from "../../context/ConsentContext";
import { Header } from "../../components/Header";
import { DigitalIdCard } from "../../components/DigitalIdCard";
import { GeofenceRadarCard } from "../../components/GeofenceRadarCard";

export default function HomeScreen() {
  const { user, kyc, refreshKyc } = useAuth();
  const { rescanLocation } = useSafety();
  const { pendingRequest, openConsentModal } = useConsent();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const isVerified = kyc?.status === "verified";
  const isUnderReview = kyc?.status === "under_review";

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshKyc(), rescanLocation()]);
    setRefreshing(false);
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeBox}>
          <Text style={styles.greetingText}>
            Welcome, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveler"}
          </Text>
          <Text style={styles.welcomeSub}>
            Smart Tourist Digital Identity &amp; Autonomous Safety Grid
          </Text>
        </View>

        {/* Incoming Consent Request Banner */}
        {pendingRequest && (
          <TouchableOpacity
            style={styles.consentAlertBanner}
            onPress={() => openConsentModal(pendingRequest)}
            activeOpacity={0.85}
          >
            <View style={styles.consentIconBox}>
              <Ionicons name="radio" size={22} color="#b45309" />
            </View>
            <View style={styles.consentTextBox}>
              <Text style={styles.consentAlertTitle}>
                CHECK-IN SCAN DETECTED • ACTION REQUIRED
              </Text>
              <Text style={styles.consentAlertDesc} numberOfLines={1}>
                {pendingRequest.requester} requested your credentials
              </Text>
            </View>
            <View style={styles.reviewBtn}>
              <Text style={styles.reviewBtnText}>Review</Text>
              <Ionicons name="chevron-forward" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Identity Status Card or Prompt */}
        {isVerified ? (
          <View style={styles.idCardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Digital Tourist Identity</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/pass" as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionLink}>View Full Pass →</Text>
              </TouchableOpacity>
            </View>
            <DigitalIdCard kyc={kyc} />
          </View>
        ) : isUnderReview ? (
          <View style={styles.underReviewCard}>
            <View style={styles.reviewHeaderRow}>
              <Ionicons name="time" size={24} color="#d97706" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.underReviewBadge}>UNDER GOVERNMENT REVIEW</Text>
                <Text style={styles.underReviewTitle}>Application {kyc?.tourist_id}</Text>
              </View>
            </View>
            <Text style={styles.underReviewText}>
              Your documents and live biometric face scan are under verification by the Immigration
              Bureau. Digital ID unlocks automatically once approved.
            </Text>
            <TouchableOpacity
              style={styles.checkStatusBtn}
              onPress={() => router.push("/kyc" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.checkStatusBtnText}>View KYC Dossier</Text>
              <Ionicons name="arrow-forward" size={14} color="#b45309" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.unverifiedCtaCard}>
            <View style={styles.ctaIconBox}>
              <Ionicons name="finger-print" size={28} color="#2563eb" />
            </View>
            <View style={styles.ctaTextBox}>
              <Text style={styles.ctaTitle}>Complete Tourist e-KYC</Text>
              <Text style={styles.ctaDesc}>
                Verify your passport and take a live face scan to generate your official Digital
                Tourist Identity Pass.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.startKycBtn}
              onPress={() => router.push("/kyc" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.startKycBtnText}>Begin e-KYC</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Spatial Safety Radar */}
        <View style={styles.radarSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spatial Safety Surveillance</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/safety" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLink}>Open Grid →</Text>
            </TouchableOpacity>
          </View>
          <GeofenceRadarCard />
        </View>

        {/* Quick Emergency SOS Banner */}
        <TouchableOpacity
          style={styles.quickSosBanner}
          onPress={() => router.push("/(tabs)/sos" as any)}
          activeOpacity={0.85}
        >
          <View style={styles.sosBannerIconBox}>
            <Ionicons name="warning" size={24} color="#ffffff" />
          </View>
          <View style={styles.sosBannerTextBox}>
            <Text style={styles.sosBannerTitle}>Emergency SOS Panic Protocol</Text>
            <Text style={styles.sosBannerDesc}>
              Hold to trigger instant GPS telemetry &amp; 112 Police Dispatch
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fca5a5" />
        </TouchableOpacity>

        {/* Services & Utilities Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>Tourist Services &amp; Digital Utilities</Text>

          <View style={styles.utilitiesGrid}>
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push("/(tabs)/pass" as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.gridIconBox, { backgroundColor: "#eff6ff" }]}>
                <Ionicons name="qr-code" size={22} color="#2563eb" />
              </View>
              <Text style={styles.gridCardTitle}>Dynamic QR ID</Text>
              <Text style={styles.gridCardDesc}>Anti-screenshot 45s rotating pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push("/(tabs)/safety" as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.gridIconBox, { backgroundColor: "#f0fdf4" }]}>
                <Ionicons name="navigate" size={22} color="#059669" />
              </View>
              <Text style={styles.gridCardTitle}>Geofence Radar</Text>
              <Text style={styles.gridCardDesc}>Restricted &amp; safe zone alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push("/complaints" as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.gridIconBox, { backgroundColor: "#fff1f2" }]}>
                <Ionicons name="alert-circle" size={22} color="#e11d48" />
              </View>
              <Text style={styles.gridCardTitle}>Scam Grievance</Text>
              <Text style={styles.gridCardDesc}>Report taxi / guide extortion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push("/(tabs)/assistant" as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.gridIconBox, { backgroundColor: "#faf5ff" }]}>
                <Ionicons name="sparkles" size={22} color="#9333ea" />
              </View>
              <Text style={styles.gridCardTitle}>AI Safety Bot</Text>
              <Text style={styles.gridCardDesc}>Multilingual travel advisor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Helplines Direct Dial */}
        <View style={styles.helplineSection}>
          <Text style={styles.helplineHeader}>OFFICIAL NATIONAL TOURIST HELPLINES</Text>
          <View style={styles.helplineRow}>
            <TouchableOpacity
              style={styles.helplineCard}
              onPress={() => handleCall("112")}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#dc2626" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.helplineNumber}>112</Text>
                <Text style={styles.helplineLabel}>Police &amp; Medical Emergency</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              onPress={() => handleCall("1363")}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#2563eb" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.helplineNumber}>1363</Text>
                <Text style={styles.helplineLabel}>Ministry of Tourism 24/7</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 32,
  },
  welcomeBox: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  consentAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  consentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  consentTextBox: {
    flex: 1,
  },
  consentAlertTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: 0.5,
  },
  consentAlertDesc: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 2,
  },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d97706",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  idCardSection: {
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 6,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },
  underReviewCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fcd34d",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  underReviewBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: 0.8,
  },
  underReviewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#78350f",
  },
  underReviewText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 17,
    marginTop: 8,
  },
  checkStatusBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    gap: 4,
  },
  checkStatusBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  unverifiedCtaCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  ctaTextBox: {
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  ctaDesc: {
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 17,
    marginTop: 4,
  },
  startKycBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  startKycBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  radarSection: {
    marginVertical: 4,
  },
  quickSosBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 3,
  },
  sosBannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sosBannerTextBox: {
    flex: 1,
  },
  sosBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  sosBannerDesc: {
    fontSize: 11,
    color: "#fee2e2",
    marginTop: 2,
  },
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  utilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gridIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  gridCardDesc: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 3,
    lineHeight: 14,
  },
  helplineSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  helplineHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  helplineRow: {
    flexDirection: "row",
    gap: 10,
  },
  helplineCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  helplineNumber: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  helplineLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748b",
  },
});
