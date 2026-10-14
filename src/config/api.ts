import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@safirpass_auth_token",
  USER: "@safirpass_user",
  KYC_CACHE: "@safirpass_kyc_cache",
  CUSTOM_API_URL: "@safirpass_custom_api_url",
  OFFLINE_CREDENTIAL: "@safirpass_offline_credential",
  BIOMETRIC_PREF: "@safirpass_biometric_enabled",
};

/**
 * Returns the default API base URL depending on device platform.
 * - Android Emulator uses 10.0.2.2 to reach host machine localhost:3000
 * - iOS Simulator / Web uses localhost:3000
 * - Physical devices can configure their PC's LAN IP or production deployment via Settings.
 */
export function getDefaultApiBaseUrl(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
}

let cachedBaseUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  try {
    const custom = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_API_URL);
    if (custom && custom.trim()) {
      cachedBaseUrl = custom.trim().replace(/\/+$/, "");
      return cachedBaseUrl;
    }
  } catch {
    // ignore
  }
  cachedBaseUrl = getDefaultApiBaseUrl();
  return cachedBaseUrl;
}

export async function setApiBaseUrl(newUrl: string): Promise<void> {
  const clean = newUrl.trim().replace(/\/+$/, "");
  cachedBaseUrl = clean;
  await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_API_URL, clean);
}

export async function resetApiBaseUrl(): Promise<string> {
  const def = getDefaultApiBaseUrl();
  cachedBaseUrl = def;
  await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_API_URL);
  return def;
}

export const API_ENDPOINTS = {
  SIGN_IN: "/api/auth/signin",
  SIGN_UP: "/api/auth/signup",
  SESSION: "/api/auth/session",
  SIGN_OUT: "/api/auth/signout",
  KYC_STATUS: "/api/kyc/status",
  KYC_SUBMIT: "/api/kyc/submit",
  KYC_OCR_MRZ: "/api/kyc/ocr-mrz",
  KYC_FACE_MATCH: "/api/kyc/face-match",
  KYC_DOC_VERIFY: "/api/kyc/document-verify",
  CREDENTIAL_QR: "/api/credentials/qr",
  CREDENTIAL_VERIFY: "/api/credentials/verify",
  GEOFENCES_CHECK: "/api/geofences/check",
  GEOFENCES_ALL: "/api/geofences",
  SOS: "/api/sos",
  CONSENT: "/api/consent",
  COMPLAINTS: "/api/complaints",
  ASSISTANT: "/api/assistant",
};
