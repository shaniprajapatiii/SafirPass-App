import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/apiClient";
import { API_ENDPOINTS, STORAGE_KEYS } from "../config/api";
import { DynamicQrResponse, UnifiedKyc } from "../types";

interface DynamicQrViewProps {
  kyc: UnifiedKyc | null;
  selectedKeys?: string[];
  isOfflineMode?: boolean;
}

export const DynamicQrView: React.FC<DynamicQrViewProps> = ({
  kyc,
  selectedKeys = ["full_name", "nationality", "tourist_id", "validity"],
  isOfflineMode = false,
}) => {
  const [token, setToken] = useState<string>("");
  const [nonce, setNonce] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const [loading, setLoading] = useState<boolean>(true);
  const [liveClock, setLiveClock] = useState<string>("");
  const timerRef = useRef<any>(null);

  // Live ticking IST clock to prevent screenshot replay fraud
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const fetchToken = useCallback(async () => {
    if (!kyc?.tourist_id) return;
    setLoading(true);

    try {
      if (isOfflineMode) {
        // Check offline credential cache first
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CREDENTIAL);
        if (cached) {
          const parsed = JSON.parse(cached);
          setToken(parsed.token);
          setNonce(parsed.nonce || "OFFLINE");
          setShareUrl(parsed.shareUrl || "");
          setSecondsRemaining(parsed.ttlSeconds || 86400 * 7);
          setLoading(false);
          return;
        }
      }

      const res = await api.post<DynamicQrResponse>(API_ENDPOINTS.CREDENTIAL_QR, {
        keys: selectedKeys,
        isOffline: isOfflineMode,
      });

      if (res.ok && res.data?.token) {
        setToken(res.data.token);
        setNonce(res.data.nonce);
        setShareUrl(res.data.shareUrl);
        setSecondsRemaining(res.data.ttlSeconds || 45);

        if (isOfflineMode) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.OFFLINE_CREDENTIAL,
            JSON.stringify(res.data)
          );
        }
      } else {
        // Fallback local token if network unreachable
        const fallbackToken = `SAFIRPASS-OFFLINE:${kyc.tourist_id}:${Date.now()}`;
        setToken(fallbackToken);
      }
    } catch {
      const fallbackToken = `SAFIRPASS-OFFLINE:${kyc?.tourist_id || "IND-TMP"}:${Date.now()}`;
      setToken(fallbackToken);
    } finally {
      setLoading(false);
    }
  }, [kyc, selectedKeys, isOfflineMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchToken();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchToken]);

  // Countdown timer for 45s dynamic rotation
  useEffect(() => {
    if (isOfflineMode) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((sec) => {
        if (sec <= 1) {
          fetchToken();
          return 45;
        }
        return sec - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchToken, isOfflineMode]);

  const handleManualRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    fetchToken();
  };

  const handleShare = async () => {
    if (!shareUrl && !token) return;
    try {
      await Share.share({
        message: shareUrl || `SafirPass Digital Tourist Token: ${token}`,
        title: "SafirPass Verification Token",
      });
    } catch {}
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 45) * 100));

  return (
    <View style={styles.container}>
      {/* Dynamic Security Indicator Banner */}
      <View style={styles.watermarkHeader}>
        <View style={styles.watermarkDot} />
        <Text style={styles.watermarkText}>
          {isOfflineMode
            ? "OFFLINE CRYPTOGRAPHIC PASS (7-DAY TTL)"
            : `DYNAMIC ROLLING QR • ANTI-REPLAY (${liveClock})`}
        </Text>
      </View>

      {/* QR Code Container */}
      <View style={styles.qrCard}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Issuing cryptographic token...</Text>
          </View>
        ) : token ? (
          <View style={styles.qrWrapper}>
            <QRCode
              value={token}
              size={210}
              color="#0f172a"
              backgroundColor="#ffffff"
            />
          </View>
        ) : (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={36} color="#ef4444" />
            <Text style={styles.errorText}>No QR token issued</Text>
          </View>
        )}

        {/* Live Countdown Bar (Dynamic Mode) */}
        {!isOfflineMode && (
          <View style={styles.countdownContainer}>
            <View style={styles.countdownTrack}>
              <View
                style={[
                  styles.countdownFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor:
                      secondsRemaining > 15
                        ? "#2563eb"
                        : secondsRemaining > 5
                        ? "#f59e0b"
                        : "#ef4444",
                  },
                ]}
              />
            </View>
            <View style={styles.countdownRow}>
              <Text style={styles.countdownText}>
                Regenerating in <Text style={styles.boldText}>{secondsRemaining}s</Text>
              </Text>
              {nonce ? (
                <Text style={styles.nonceText}>NONCE: {nonce.slice(0, 8)}</Text>
              ) : null}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleManualRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color="#1e293b" />
          <Text style={styles.actionBtnText}>Refresh QR</Text>
        </TouchableOpacity>

        {shareUrl ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={16} color="#ffffff" />
            <Text style={styles.primaryBtnText}>Share Link</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 14,
  },
  watermarkHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  watermarkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
    marginRight: 6,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1e40af",
    letterSpacing: 0.5,
  },
  qrCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 16,
  },
  loadingBox: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 10,
    fontWeight: "600",
  },
  errorBox: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
    fontWeight: "600",
  },
  countdownContainer: {
    width: "100%",
    marginTop: 16,
  },
  countdownTrack: {
    height: 5,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  countdownFill: {
    height: "100%",
    borderRadius: 3,
  },
  countdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  countdownText: {
    fontSize: 11,
    color: "#64748b",
  },
  boldText: {
    fontWeight: "800",
    color: "#0f172a",
  },
  nonceText: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#94a3b8",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
