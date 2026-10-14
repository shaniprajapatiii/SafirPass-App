import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import { ConsentRequest } from "../types";
import { api } from "../services/apiClient";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "./AuthContext";

interface ConsentContextType {
  requests: ConsentRequest[];
  pendingRequest: ConsentRequest | null;
  activeModalRequest: ConsentRequest | null;
  isProcessing: boolean;
  openConsentModal: (req: ConsentRequest) => void;
  closeConsentModal: () => void;
  approveConsent: (id: string) => Promise<{ success: boolean; error?: string }>;
  denyConsent: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchConsentRequests: () => Promise<void>;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [activeModalRequest, setActiveModalRequest] = useState<ConsentRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchConsentRequests = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const res = await api.get<{ success: boolean; requests: ConsentRequest[] }>(API_ENDPOINTS.CONSENT);
      if (res.ok && res.data?.requests) {
        setRequests(res.data.requests);

        const pending = res.data.requests.find((r) => r.status === "pending");
        if (pending && (!activeModalRequest || activeModalRequest.id !== pending.id)) {
          setActiveModalRequest(pending);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
      }
    } catch (e) {
      console.warn("[Consent fetch note]:", e);
    }
  }, [isAuthenticated, user?.id, activeModalRequest]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchConsentRequests();
      }, 0);
      const interval = setInterval(fetchConsentRequests, 6000); // 6-second polling
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, fetchConsentRequests]);

  const approveConsent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setIsProcessing(true);
    try {
      // Prompt native biometric Face ID / Fingerprint verification
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const bioResult = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authorize Tourist Identity Disclosure",
          cancelLabel: "Cancel",
          fallbackLabel: "Enter Passcode",
        });

        if (!bioResult.success) {
          setIsProcessing(false);
          return { success: false, error: "Biometric authentication cancelled." };
        }
      }

      const res = await api.patch(API_ENDPOINTS.CONSENT, {
        id,
        status: "approved",
      });

      if (!res.ok) {
        return { success: false, error: res.error || "Failed to approve request." };
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setActiveModalRequest(null);
      await fetchConsentRequests();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to approve consent." };
    } finally {
      setIsProcessing(false);
    }
  };

  const denyConsent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setIsProcessing(true);
    try {
      const res = await api.patch(API_ENDPOINTS.CONSENT, {
        id,
        status: "denied",
      });

      if (!res.ok) {
        return { success: false, error: res.error || "Failed to deny request." };
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setActiveModalRequest(null);
      await fetchConsentRequests();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to deny consent." };
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRequest = requests.find((r) => r.status === "pending") || null;

  return (
    <ConsentContext.Provider
      value={{
        requests,
        pendingRequest,
        activeModalRequest,
        isProcessing,
        openConsentModal: (req) => setActiveModalRequest(req),
        closeConsentModal: () => setActiveModalRequest(null),
        approveConsent,
        denyConsent,
        fetchConsentRequests,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
