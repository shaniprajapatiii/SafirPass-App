import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConsent } from "../context/ConsentContext";

export const ConsentModal: React.FC = () => {
  const {
    activeModalRequest,
    isProcessing,
    approveConsent,
    denyConsent,
    closeConsentModal,
  } = useConsent();

  if (!activeModalRequest) return null;

  const attributesList = activeModalRequest.attributes || [
    "Full Name",
    "Nationality",
    "Masked Passport",
  ];

  return (
    <Modal
      transparent
      animationType="fade"
      visible={Boolean(activeModalRequest)}
      onRequestClose={closeConsentModal}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="business" size={24} color="#d97706" />
            </View>
            <View style={styles.headerTitleBox}>
              <Text style={styles.badgeText}>CHECK-IN SCAN DETECTED</Text>
              <Text style={styles.titleText}>{activeModalRequest.requester}</Text>
            </View>
          </View>

          <Text style={styles.bodyText}>
            {activeModalRequest.requester} is requesting verified credentials for{" "}
            <Text style={styles.boldText}>{activeModalRequest.purpose}</Text>.
          </Text>

          {/* Disclosed Attributes Box */}
          <View style={styles.attributesContainer}>
            <Text style={styles.attributesHeader}>
              SELECTIVE ATTRIBUTES TO BE SHARED:
            </Text>
            <View style={styles.tagsRow}>
              {attributesList.map((attr, idx) => (
                <View key={idx} style={styles.tag}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.tagText}>{attr.replace(/_/g, " ")}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.privacyNote}>
              * Raw passport and home address remain shielded under SafirPass Zero-PII protocol.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.denyBtn}
              onPress={() => denyConsent(activeModalRequest.id)}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              <Text style={styles.denyBtnText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => approveConsent(activeModalRequest.id)}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="scan" size={16} color="#ffffff" />
                  <Text style={styles.approveBtnText}>Approve (Face ID)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 2,
  },
  bodyText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 14,
  },
  boldText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  attributesContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  attributesHeader: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    textTransform: "capitalize",
  },
  privacyNote: {
    fontSize: 10,
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 8,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  denyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  denyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  approveBtn: {
    flex: 1.6,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 2,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
