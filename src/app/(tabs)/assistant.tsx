import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { api } from "../../services/apiClient";
import { API_ENDPOINTS } from "../../config/api";
import { AssistantMessage } from "../../types";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
];

const SUGGESTIONS: Record<string, string[]> = {
  en: [
    "I need emergency help now",
    "How do I trigger an SOS alert?",
    "Is this area safe for tourists?",
    "I lost my passport in India",
  ],
  hi: [
    "मुझे तुरंत आपातकालीन मदद चाहिए",
    "SOS अलर्ट कैसे चालू करें?",
    "क्या यह क्षेत्र सुरक्षित है?",
    "मेरा पासपोर्ट खो गया है",
  ],
  es: [
    "Necesito ayuda de emergencia ahora",
    "¿Cómo activo una alerta SOS?",
    "¿Es segura esta zona para turistas?",
    "Perdí mi pasaporte",
  ],
  fr: [
    "J'ai besoin d'une aide d'urgence",
    "Comment déclencher une alerte SOS ?",
    "Cette zone est-elle sûre ?",
    "J'ai perdu mon passeport",
  ],
};

export default function AssistantScreen() {
  const [language, setLanguage] = useState<string>("en");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "initial",
      role: "assistant",
      text: "Hello! I am your SafirPass AI Safety Assistant powered by real-time safety services and Gemini intelligence. How can I assist your travels today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const counterRef = useRef<number>(1);

  const handleSend = useCallback(async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: AssistantMessage = {
      id: `user-${++counterRef.current}`,
      role: "user",
      text: textToSend,
      timestamp: "Now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(API_ENDPOINTS.ASSISTANT, {
        message: textToSend,
        language,
      });

      const replyText =
        res.data?.response ||
        res.data?.reply ||
        res.data?.message ||
        "If you are in immediate danger or need emergency assistance, dial 112 directly. You can also trigger the SOS panic button on your dashboard to notify Indian authorities.";

      const assistantMsg: AssistantMessage = {
        id: `assistant-${++counterRef.current}`,
        role: "assistant",
        text: replyText,
        timestamp: "Now",
        provider: res.data?.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AssistantMessage = {
        id: `assistant-${++counterRef.current}`,
        role: "assistant",
        text: "For immediate emergency support in India, dial 112 or contact the 24/7 Tourist Helpline at 1363.",
        timestamp: "Now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, language]);

  const currentSuggestions = SUGGESTIONS[language] || SUGGESTIONS.en;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="AI Safety Assistant" subtitle="Gemini &amp; FastAPI Multilingual Advisor" />

      {/* Language Selector Bar */}
      <View style={styles.langBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
          {LANGUAGES.map((lang) => {
            const active = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langChip, active && styles.langChipActive]}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.8}
              >
                <Text style={[styles.langChipText, active && styles.langChipTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <View
                key={msg.id}
                style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}
              >
                {!isUser && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="sparkles" size={14} color="#ffffff" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.timestampText, isUser && styles.userTimestampText]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={14} color="#ffffff" />
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.typingText}>Safety intelligence analyzing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {currentSuggestions.map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(s)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about local safety, scams, or SOS..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  langBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
  },
  langScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  langChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  langChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  langChipTextActive: {
    color: "#ffffff",
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  assistantRow: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9333ea",
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: "#64748b",
  },
  messageText: {
    fontSize: 13,
    color: "#1e293b",
    lineHeight: 18,
  },
  userMessageText: {
    color: "#ffffff",
  },
  timestampText: {
    fontSize: 9,
    color: "#94a3b8",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  userTimestampText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  suggestionsContainer: {
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  suggestionsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1e40af",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13,
    color: "#0f172a",
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#94a3b8",
  },
});
