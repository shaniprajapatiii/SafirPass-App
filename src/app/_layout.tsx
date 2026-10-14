import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { SafetyProvider } from "../context/SafetyContext";
import { ConsentProvider } from "../context/ConsentContext";
import { ConsentModal } from "../components/ConsentModal";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafetyProvider>
          <ConsentProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="kyc/index" options={{ headerShown: false }} />
              <Stack.Screen name="complaints/index" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            </Stack>
            <ConsentModal />
          </ConsentProvider>
        </SafetyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
