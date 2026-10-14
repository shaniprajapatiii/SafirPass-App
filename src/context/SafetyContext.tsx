import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { GeofenceCheckResult, SosAlert } from "../types";
import { api } from "../services/apiClient";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "./AuthContext";

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
}

interface SafetyContextType {
  currentCoords: Coordinates | null;
  geofenceResult: GeofenceCheckResult | null;
  isLocationLoading: boolean;
  locationPermission: Location.PermissionStatus | null;
  isSosDispatching: boolean;
  rescanLocation: () => Promise<void>;
  triggerSosAlert: (
    category: "medical" | "crime" | "harassment" | "disaster" | "general",
    notes?: string
  ) => Promise<{ success: boolean; alert?: SosAlert; error?: string }>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceCheckResult | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isSosDispatching, setIsSosDispatching] = useState<boolean>(false);
  const previousAlertLevel = useRef<string | null>(null);

  const evaluateGeofence = useCallback(async (coords: Coordinates) => {
    try {
      const res = await api.post<GeofenceCheckResult>(API_ENDPOINTS.GEOFENCES_CHECK, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed_kph: coords.speed ? Math.round(coords.speed * 3.6) : 0,
      });

      if (res.ok && res.data) {
        setGeofenceResult(res.data);

        // Haptic feedback trigger on critical or warning boundaries
        const currentLevel = res.data.activeAlert?.level;
        if (currentLevel && currentLevel !== previousAlertLevel.current) {
          if (currentLevel === "CRITICAL") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          } else if (currentLevel === "HIGH") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          }
          previousAlertLevel.current = currentLevel;
        }
      }
    } catch (e) {
      console.warn("[Geofence check note]:", e);
    }
  }, []);

  const rescanLocation = useCallback(async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setIsLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        speed: loc.coords.speed,
      };

      setCurrentCoords(coords);
      await evaluateGeofence(coords);
    } catch (err) {
      console.warn("[Location fetch note]:", err);
    } finally {
      setIsLocationLoading(false);
    }
  }, [evaluateGeofence]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        rescanLocation();
      }, 0);
      const interval = setInterval(() => {
        rescanLocation();
      }, 45000); // 45-second background radar interval
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, rescanLocation]);

  const triggerSosAlert = async (
    category: "medical" | "crime" | "harassment" | "disaster" | "general",
    notes?: string
  ): Promise<{ success: boolean; alert?: SosAlert; error?: string }> => {
    setIsSosDispatching(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

      let lat = currentCoords?.latitude;
      let lng = currentCoords?.longitude;

      if (!lat || !lng) {
        try {
          const quickLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          lat = quickLoc.coords.latitude;
          lng = quickLoc.coords.longitude;
        } catch {}
      }

      const res = await api.post(API_ENDPOINTS.SOS, {
        category,
        latitude: lat || null,
        longitude: lng || null,
        notes: notes || "Emergency SOS panic button triggered on mobile app.",
        responder: "112 Central Command & Local Tourist Police",
        reference: `APP-${Math.floor(10000 + Math.random() * 90000)}`,
      });

      if (!res.ok) {
        return { success: false, error: res.error || "Failed to transmit SOS alert." };
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return { success: true, alert: res.data?.alert };
    } catch (err: any) {
      return { success: false, error: err?.message || "SOS dispatch failed." };
    } finally {
      setIsSosDispatching(false);
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        currentCoords,
        geofenceResult,
        isLocationLoading,
        locationPermission,
        isSosDispatching,
        rescanLocation,
        triggerSosAlert,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error("useSafety must be used within a SafetyProvider");
  }
  return context;
};
