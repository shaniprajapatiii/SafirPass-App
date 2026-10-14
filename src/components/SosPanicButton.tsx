import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafety } from "../context/SafetyContext";

interface SosPanicButtonProps {
  category?: "medical" | "crime" | "harassment" | "disaster" | "general";
  notes?: string;
  onSuccess?: () => void;
}

export const SosPanicButton: React.FC<SosPanicButtonProps> = ({
  category = "general",
  notes = "Emergency SOS button triggered from mobile.",
  onSuccess,
}) => {
  const { triggerSosAlert, isSosDispatching } = useSafety();
  const [holdingProgress, setHoldingProgress] = useState<number>(0);
  const [holding, setHolding] = useState<boolean>(false);
  const intervalRef = useRef<any>(null);
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const startHold = () => {
    if (isSosDispatching) return;
    setHolding(true);
    setHoldingProgress(0);

    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 5; // 20 ticks = 100% (approx 2 seconds for quick response)
      setHoldingProgress(progress);

      if (progress % 25 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }

      if (progress >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHolding(false);
        setHoldingProgress(0);

        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        executeSos();
      }
    }, 100);
  };

  const cancelHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHolding(false);
    setHoldingProgress(0);

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const executeSos = async () => {
    const res = await triggerSosAlert(category, notes);
    if (res.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={startHold}
          onPressOut={cancelHold}
          disabled={isSosDispatching}
          style={[styles.outerRing, holding && styles.outerRingActive]}
        >
          <View style={[styles.innerCircle, isSosDispatching && styles.dispatchingCircle]}>
            {isSosDispatching ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="warning" size={44} color="#ffffff" />
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.holdText}>
                  {holding ? `HOLDING ${holdingProgress}%` : "PRESS & HOLD"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.hintText}>
        {holding
          ? "Keep holding to notify Indian 112 emergency command..."
          : "Hold for 2 seconds to transmit live GPS telemetry & verified traveler dossier"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  outerRingActive: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.28)",
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  dispatchingCircle: {
    backgroundColor: "#991b1b",
  },
  sosText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 2,
    marginTop: 2,
  },
  holdText: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 1,
    marginTop: 2,
  },
  hintText: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    marginTop: 14,
    maxWidth: 280,
    lineHeight: 16,
  },
});
