import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useConsent } from "../../context/ConsentContext";

export default function TabLayout() {
  const { pendingRequest } = useConsent();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pass"
        options={{
          title: "Digital Pass",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: "SOS Panic",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning" size={size - 1} color="#dc2626" />
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "800",
            color: "#dc2626",
          },
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: "Safety Grid",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate-circle" size={size - 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI Safety",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size - 2} color={color} />
          ),
          tabBarBadge: pendingRequest ? "!" : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#f59e0b",
            fontSize: 10,
            fontWeight: "800",
          },
        }}
      />
    </Tabs>
  );
}
