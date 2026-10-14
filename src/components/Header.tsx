import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = "SafirPass",
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const { kyc } = useAuth();
  const isVerified = kyc?.status === "verified";
  const isUnderReview = kyc?.status === "under_review";

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1e293b" />
          </TouchableOpacity>
        ) : (
          <View style={styles.shieldIconWrapper}>
            <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
          </View>
        )}
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isVerified
                      ? "#10b981"
                      : isUnderReview
                      ? "#f59e0b"
                      : "#94a3b8",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isVerified
                  ? "ID Verified"
                  : isUnderReview
                  ? "Under Review"
                  : "Unverified"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push("/(tabs)/profile" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={32} color="#475569" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  shieldIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  rightCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBtn: {
    padding: 2,
  },
});
