import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSafety } from "../../context/SafetyContext";
import { Header } from "../../components/Header";
import { GeofenceRadarCard } from "../../components/GeofenceRadarCard";

type FilterType = "all" | "restricted" | "high_risk" | "scam_hotspot" | "safe_corridor";

export default function SafetyScreen() {
  const { geofenceResult, isLocationLoading, rescanLocation } = useSafety();
  const [filter, setFilter] = useState<FilterType>("all");

  const proximityZones = geofenceResult?.proximityGeofences || [];

  const filteredZones = proximityZones.filter((zone) => {
    if (filter === "all") return true;
    return zone.category === filter;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "restricted":
        return "#ef4444";
      case "high_risk":
        return "#f59e0b";
      case "scam_hotspot":
        return "#dc2626";
      case "safe_corridor":
      default:
        return "#10b981";
    }
  };

  const getCategoryIcon = (cat: string): keyof typeof Ionicons.glyphMap => {
    switch (cat) {
      case "restricted":
        return "ban";
      case "high_risk":
        return "warning";
      case "scam_hotspot":
        return "alert-circle";
      case "safe_corridor":
      default:
        return "shield-checkmark";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Safety Grid &amp; Radar" subtitle="PostGIS Autonomous Surveillance" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLocationLoading}
            onRefresh={rescanLocation}
            colors={["#2563eb"]}
          />
        }
      >
        {/* Main Radar Card */}
        <GeofenceRadarCard />

        {/* Real-time Telemetry Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TELEMETRY STATUS</Text>
            <Text style={styles.statValue}>
              {geofenceResult?.overallStatus || "SURVEILLANCE ACTIVE"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SPEED ANOMALY</Text>
            <Text
              style={[
                styles.statValue,
                { color: geofenceResult?.anomalyDetected ? "#dc2626" : "#059669" },
              ]}
            >
              {geofenceResult?.anomalyDetected ? "HIGH (>130km/h)" : "NORMAL"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MONITORED ZONES</Text>
            <Text style={styles.statValue}>{proximityZones.length || 0} Nearby</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>GEOFENCE BOUNDARY FILTERS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[
              { id: "all", label: "All Perimeters" },
              { id: "restricted", label: "Restricted / Defense" },
              { id: "high_risk", label: "High Hazard" },
              { id: "scam_hotspot", label: "Scam Hotspots" },
              { id: "safe_corridor", label: "Safe Corridors" },
            ].map((f) => {
              const active = filter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilter(f.id as FilterType)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Monitored Zones List */}
        <View style={styles.zonesSection}>
          <Text style={styles.sectionHeaderTitle}>NEARBY GEOGRAPHICAL PERIMETERS</Text>
          {filteredZones.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="map-outline" size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No matching perimeters in radius</Text>
              <Text style={styles.emptyText}>
                No restricted or scam zones detected within your immediate proximity.
              </Text>
            </View>
          ) : (
            filteredZones.map((zone) => {
              const catColor = getCategoryColor(zone.category);
              const catIcon = getCategoryIcon(zone.category);

              return (
                <View key={zone.id} style={styles.zoneCard}>
                  <View style={styles.zoneTopRow}>
                    <View style={[styles.zoneIconBox, { backgroundColor: `${catColor}15` }]}>
                      <Ionicons name={catIcon} size={18} color={catColor} />
                    </View>
                    <View style={styles.zoneTitleCol}>
                      <Text style={styles.zoneName}>{zone.name}</Text>
                      <Text style={[styles.zoneCategory, { color: catColor }]}>
                        {zone.category.replace(/_/g, " ").toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{zone.distanceKm || "—"} km</Text>
                    </View>
                  </View>

                  <Text style={styles.zoneAdvisoryText}>
                    {zone.safetyAdvisory || zone.description}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* India Travel Safety Best Practices */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#2563eb" />
            <Text style={styles.advisoryTitle}>Official Tourist Safety Rules</Text>
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • Always use prepaid taxi booths inside airport terminals or verified ride-hailing apps.
            </Text>
            <Text style={styles.bulletItem}>
              • Beware of touts claiming national monuments or ticket windows are &apos;closed today&apos;.
            </Text>
            <Text style={styles.bulletItem}>
              • Avoid unguided remote trekking near high-altitude border perimeters without permits.
            </Text>
            <Text style={styles.bulletItem}>
              • Never hand over physical passports to souvenir shops, SIM sellers, or rental agencies.
            </Text>
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
    paddingBottom: 40,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 3,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  filterSectionTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filterRow: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  zonesSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  zoneCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  zoneTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  zoneIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  zoneTitleCol: {
    flex: 1,
  },
  zoneName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  zoneCategory: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  zoneAdvisoryText: {
    fontSize: 11,
    color: "#475569",
    marginTop: 8,
    lineHeight: 16,
  },
  advisoryCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  advisoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    fontSize: 11,
    color: "#1e40af",
    lineHeight: 16,
  },
});
