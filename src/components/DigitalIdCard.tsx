import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UnifiedKyc } from "../types";

const { width } = Dimensions.get("window");

interface DigitalIdCardProps {
  kyc: UnifiedKyc | null;
  onFlip?: () => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ kyc }) => {
  const [side, setSide] = useState<"front" | "back">("front");

  const isVerified = kyc?.status === "verified";
  const fullName = kyc?.full_name || "International Tourist";
  const touristId = kyc?.tourist_id || "IND-2026-TMP-00000";
  const nationality = kyc?.nationality || "Visitor";
  const passportNumber = kyc?.passport_number
    ? `${"•".repeat(Math.max(0, kyc.passport_number.length - 4))}${kyc.passport_number.slice(-4)}`
    : "••••••••";
  const visaInfo = [kyc?.visa_type, kyc?.visa_number].filter(Boolean).join(" · ") || "Tourist e-Visa";
  const validity =
    kyc?.entry_date && kyc?.exit_date
      ? `${kyc.entry_date} → ${kyc.exit_date}`
      : "Valid for Travel";
  const photoUri = kyc?.biometrics?.face_snapshot || kyc?.profile_photo_url;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setSide((s) => (s === "front" ? "back" : "front"))}
        style={[
          styles.card,
          isVerified ? styles.verifiedCard : styles.unverifiedCard,
        ]}
      >
        {/* Hologram / Guilloche decorative lines */}
        <View style={styles.topPattern}>
          <View style={styles.goldStripe} />
          <View style={styles.tricolorStripe}>
            <View style={{ flex: 1, backgroundColor: "#FF9933" }} />
            <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
            <View style={{ flex: 1, backgroundColor: "#138808" }} />
          </View>
        </View>

        {side === "front" ? (
          /* FRONT SIDE */
          <View style={styles.cardBody}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.govTitleCol}>
                <Text style={styles.govCountryText}>REPUBLIC OF INDIA</Text>
                <Text style={styles.govSubText}>
                  BUREAU OF IMMIGRATION • SMART TOURIST PASS
                </Text>
              </View>
              <View style={styles.chipSeal}>
                <Ionicons name="shield-checkmark" size={18} color="#f59e0b" />
              </View>
            </View>

            {/* Main Details Row */}
            <View style={styles.detailsRow}>
              {/* Photo */}
              <View style={styles.photoWrapper}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoFallback}>
                    <Ionicons name="person" size={40} color="#94a3b8" />
                  </View>
                )}
                <View style={styles.photoStatusBadge}>
                  <Text style={styles.photoStatusText}>
                    {isVerified ? "VERIFIED" : "PENDING"}
                  </Text>
                </View>
              </View>

              {/* Text Info */}
              <View style={styles.infoCol}>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>TRAVELER NAME</Text>
                  <Text style={styles.infoValueName} numberOfLines={1}>
                    {fullName}
                  </Text>
                </View>

                <View style={styles.twoColField}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>NATIONALITY</Text>
                    <Text style={styles.infoValueText} numberOfLines={1}>
                      {nationality}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>PASSPORT</Text>
                    <Text style={styles.infoValueText} numberOfLines={1}>
                      {passportNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>VISA / PERMIT</Text>
                  <Text style={styles.infoValueSmall} numberOfLines={1}>
                    {visaInfo}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Footer Row */}
            <View style={styles.bottomRow}>
              <View>
                <Text style={styles.idNumberLabel}>DIGITAL IDENTITY NUMBER</Text>
                <Text style={styles.idNumberText}>{touristId}</Text>
              </View>
              <View style={styles.flipHint}>
                <Ionicons name="swap-horizontal" size={14} color="#94a3b8" />
                <Text style={styles.flipHintText}>Tap to Flip</Text>
              </View>
            </View>
          </View>
        ) : (
          /* BACK SIDE */
          <View style={styles.cardBody}>
            <View style={styles.headerRow}>
              <View style={styles.govTitleCol}>
                <Text style={styles.govCountryText}>EMERGENCY &amp; TRANSIT SPECIFICATIONS</Text>
                <Text style={styles.govSubText}>
                  AUTHORITY CONTACT &amp; SELECTIVE DISCLOSURE
                </Text>
              </View>
              <Ionicons name="medical" size={18} color="#ef4444" />
            </View>

            <View style={styles.backDetailsContainer}>
              <View style={styles.backInfoRow}>
                <Text style={styles.backLabel}>EMERGENCY CONTACT</Text>
                <Text style={styles.backValue}>
                  {kyc?.emergency_contact || "112 Emergency Dispatch"}
                </Text>
              </View>

              <View style={styles.backInfoRow}>
                <Text style={styles.backLabel}>BLOOD GROUP</Text>
                <Text style={styles.backValue}>{kyc?.blood_group || "Unknown"}</Text>
              </View>

              <View style={styles.backInfoRow}>
                <Text style={styles.backLabel}>LOCAL RESIDENCE / HOTEL</Text>
                <Text style={styles.backValue} numberOfLines={2}>
                  {kyc?.stay_address || "Registered Hotel in India"}
                </Text>
              </View>

              <View style={styles.backInfoRow}>
                <Text style={styles.backLabel}>AUTHORIZED STAY DURATION</Text>
                <Text style={styles.backValue}>{validity}</Text>
              </View>
            </View>

            {/* Simulated Code-128 Barcode Strip */}
            <View style={styles.barcodeBox}>
              <View style={styles.barcodeBars}>
                {Array.from({ length: 48 }).map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: idx % 3 === 0 ? 3 : idx % 5 === 0 ? 1 : 2,
                      height: 28,
                      backgroundColor: "#1e293b",
                      marginRight: 2,
                    }}
                  />
                ))}
              </View>
              <Text style={styles.barcodeNumber}>{touristId}</Text>
            </View>

            <View style={styles.flipHintBack}>
              <Ionicons name="swap-horizontal" size={14} color="#94a3b8" />
              <Text style={styles.flipHintText}>Tap to return to front</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  card: {
    width: Math.min(width - 32, 380),
    minHeight: 220,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  verifiedCard: {
    backgroundColor: "#0f172a", // Deep Midnight Navy
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  unverifiedCard: {
    backgroundColor: "#1e293b",
    borderWidth: 1.5,
    borderColor: "#475569",
  },
  topPattern: {
    height: 8,
    width: "100%",
  },
  goldStripe: {
    height: 3,
    backgroundColor: "#f59e0b",
  },
  tricolorStripe: {
    height: 5,
    flexDirection: "row",
  },
  cardBody: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 8,
  },
  govTitleCol: {
    flex: 1,
  },
  govCountryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: 1.2,
  },
  govSubText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  chipSeal: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  photoWrapper: {
    width: 82,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f59e0b",
    backgroundColor: "#1e293b",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  photoStatusBadge: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#059669",
    paddingVertical: 2,
    alignItems: "center",
  },
  photoStatusText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  infoField: {
    marginBottom: 4,
  },
  twoColField: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  infoValueName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: -0.2,
  },
  infoValueText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  infoValueSmall: {
    fontSize: 10,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  idNumberLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#f59e0b",
    letterSpacing: 0.8,
  },
  idNumberText: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: "monospace",
    color: "#ffffff",
    letterSpacing: 1,
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flipHintBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    gap: 4,
  },
  flipHintText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  backDetailsContainer: {
    marginTop: 8,
    gap: 6,
  },
  backInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
  },
  backValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f1f5f9",
    textAlign: "right",
    maxWidth: "60%",
  },
  barcodeBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    marginTop: 10,
  },
  barcodeBars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  barcodeNumber: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
});
