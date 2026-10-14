import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UnifiedKyc } from "../types";
import { api, setAuthToken, removeAuthToken, getAuthToken } from "../services/apiClient";
import { API_ENDPOINTS, STORAGE_KEYS } from "../config/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  kyc: UnifiedKyc | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshKyc: () => Promise<UnifiedKyc | null>;
  refreshSession: () => Promise<void>;
  updateKycState: (kyc: UnifiedKyc | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [kyc, setKyc] = useState<UnifiedKyc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshKyc = useCallback(async (): Promise<UnifiedKyc | null> => {
    try {
      const res = await api.get(API_ENDPOINTS.KYC_STATUS);
      if (res.ok && res.data?.kyc) {
        setKyc(res.data.kyc);
        await AsyncStorage.setItem(STORAGE_KEYS.KYC_CACHE, JSON.stringify(res.data.kyc));
        return res.data.kyc;
      }
    } catch {
      // offline fallback to cached KYC
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.KYC_CACHE);
        if (cached) {
          const parsed = JSON.parse(cached);
          setKyc(parsed);
          return parsed;
        }
      } catch {}
    }
    return null;
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const storedToken = await getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      // Check stored user cache first for instant responsive UI
      const cachedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      const cachedKyc = await AsyncStorage.getItem(STORAGE_KEYS.KYC_CACHE);
      if (cachedKyc) {
        setKyc(JSON.parse(cachedKyc));
      }

      // Verify active session with backend
      const res = await api.get(API_ENDPOINTS.SESSION);
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
        await refreshKyc();
      } else if (res.status === 401 || !res.data?.user) {
        // If session expired
        await removeAuthToken();
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
        setToken(null);
      }
    } catch {
      // Keep cached session if offline
    } finally {
      setIsLoading(false);
    }
  }, [refreshKyc]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshSession();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.SIGN_IN, { email, password });
      if (!res.ok) {
        return { success: false, error: res.error || "Sign in failed" };
      }

      const returnedUser = res.data?.user;
      const returnedToken = res.data?.token;

      if (returnedToken) {
        await setAuthToken(returnedToken);
        setToken(returnedToken);
      }

      if (returnedUser) {
        setUser(returnedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(returnedUser));
      }

      await refreshKyc();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Sign in failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.SIGN_UP, { email, password, fullName });
      if (!res.ok) {
        return { success: false, error: res.error || "Sign up failed" };
      }

      const returnedUser = res.data?.user;
      const returnedToken = res.data?.token;

      if (returnedToken) {
        await setAuthToken(returnedToken);
        setToken(returnedToken);
      }

      if (returnedUser) {
        setUser(returnedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(returnedUser));
      }

      await refreshKyc();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Sign up failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await api.post(API_ENDPOINTS.SIGN_OUT);
    } catch {}
    await removeAuthToken();
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.KYC_CACHE);
    setUser(null);
    setToken(null);
    setKyc(null);
  };

  const updateKycState = (newKyc: UnifiedKyc | null) => {
    setKyc(newKyc);
    if (newKyc) {
      AsyncStorage.setItem(STORAGE_KEYS.KYC_CACHE, JSON.stringify(newKyc)).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        kyc,
        isLoading,
        isAuthenticated: Boolean(user && token),
        signIn,
        signUp,
        signOut,
        refreshKyc,
        refreshSession,
        updateKycState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
