import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafety } from "../context/SafetyContext";
import { router } from "expo-router";

export const GeofenceRadarCard: React.FC = () => {
  const { geofenceResult, isLocationLoading, rescanLocation } = useSafety();

  const activeAlert = geofenceResult?.activeAlert;
  const isCritical = activeAlert?.level === "CRITICAL";
  const isWarning = activeAlert?.level === "HIGH";
  const nearest = geofenceResult?.nearestGeofence;

  const handleCallEmergency = (phone: string = "112") => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  if (activeAlert) {
    return (
      <View
        style={[
          styles.container,
          isCritical
            ? styles.criticalCard
            : isWarning
            ? styles.warningCard
            : styles.advisoryCard,
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.alertIconWrapper}>
            <Ionicons
              name={isCritical ? "warning" : "shield-half"}
              size={22}
              color={isCritical ? "#dc2626" : "#d97706"}
            />
          </View>
          <View style={styles.alertTitleCol}>
            <Text style={styles.alertLevelBadge}>
              {activeAlert.level} PRIORITY GEOFENCE ALERT
            </Text>
            <Text style={styles.alertTitleText} numberOfLines={1}>
              {activeAlert.title}
            </Text>
          </View>
        </View>

        <Text style={styles.alertMsgText}>{activeAlert.message}</Text>

        <View style={styles.alertActionRow}>
          <TouchableOpacity
            style={styles.helplineBtn}
            onPress={() => handleCallEmergency(activeAlert.emergencyNumber || "1363")}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={14} color="#0f172a" />
            <Text style={styles.helplineBtnText}>Dial 1363</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sosActionBtn}
            onPress={() => router.push("/(tabs)/sos" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={14} color="#ffffff" />
            <Text style={styles.sosActionBtnText}>Trigger SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeContainer}>
      <View style={styles.safeHeaderRow}>
        <View style={styles.radarIconBox}>
          <Ionicons name="radio" size={18} color="#059669" />
        </View>
        <View style={styles.safeTitleCol}>
          <View style={styles.safeStatusPillRow}>
            <Text style={styles.safeTitle}>Spatial Safety Radar</Text>
            <View style={styles.safeBadge}>
              <Text style={styles.safeBadgeText}>Status: Safe</Text>
            </View>
          </View>
          <Text style={styles.safeSubtitle} numberOfLines={1}>
            {nearest
              ? `Nearest zone: ${nearest.name} (${nearest.distanceKm || "1.2"} km)`
              : "Continuous GPS boundary surveillance active. No hazards nearby."}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.rescanBtn}
        onPress={rescanLocation}
        disabled={isLocationLoading}
        activeOpacity={0.7}
      >
        {isLocationLoading ? (
          <ActivityIndicator size="small" color="#059669" />
        ) : (
          <Ionicons name="navigate-outline" size={15} color="#047857" />
        )}
        <Text style={styles.rescanBtnText}>
          {isLocationLoading ? "Scanning..." : "Rescan GPS"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1.5,
  },
  criticalCard: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  warningCard: {
    backgroundColor: "#fffbeb",
    borderColor: "#f59e0b",
  },
  advisoryCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    elevation: 2,
  },
  alertTitleCol: {
    flex: 1,
  },
  alertLevelBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.8,
  },
  alertTitleText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 1,
  },
  alertMsgText: {
    fontSize: 12,
    color: "#334155",
    marginTop: 10,
    lineHeight: 18,
  },
  alertActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  helplineBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  helplineBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  sosActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  sosActionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  safeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  safeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  radarIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  safeTitleCol: {
    flex: 1,
  },
  safeStatusPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  safeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#065f46",
  },
  safeBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  safeBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#047857",
  },
  safeSubtitle: {
    fontSize: 11,
    color: "#047857",
    marginTop: 2,
  },
  rescanBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#86efac",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  rescanBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
});
