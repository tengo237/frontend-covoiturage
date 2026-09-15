import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

/**
 * ========================================
 * ADMIN LOGIN SCREEN
 * ========================================
 * Connecte un admin et redirige vers /(admin)
 */

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { user, login, error, clearError } = useUser();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  
  // ✅ Utiliser useRef pour tracker si on a déjà redirigé
  const hasRedirectedRef = useRef(false);

  const isValid = email.length > 3 && password.length >= 6;

  // ✅ Vérifier si l'utilisateur est admin et rediriger
  useEffect(() => {
    if (user && !hasRedirectedRef.current) {
      if (user.is_admin) {
        // ✅ Admin détecté → Rediriger UNE SEULE FOIS
        hasRedirectedRef.current = true;
        router.replace("/(admin)");
      } else {
        // ❌ Pas admin → Afficher erreur
        setLocalError("Accès refusé - Ce compte n'a pas les droits administrateur.");
      }
    }
  }, [user]);

  // ✅ Gérer la connexion
  const handleLogin = async () => {
    setLoading(true);
    setLocalError(null);
    clearError();
    hasRedirectedRef.current = false;  // Reset la ref

    try {
      await login({ email: email.trim(), password });
      // ✅ Le useEffect ci-dessus va vérifier si c'est un admin
    } catch (err: any) {
      const errorMessage = err.message ?? "Connexion impossible.";
      setLocalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
          {/* Bouton retour */}
          <Pressable onPress={() => router.back()} className="mb-8" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
          </Pressable>

          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-brun items-center justify-center mb-4">
              <Ionicons name="shield-outline" size={30} color="#FF8A6B" />
            </View>
            <Text className="font-display-bold text-brun text-xl mb-1">
              Espace administrateur
            </Text>
            <Text className="font-body text-brun-muted text-sm">
              Réservé au personnel autorisé de RIDE+
            </Text>
          </View>

          {/* Info de test */}
          <View className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-6">
            <Text className="font-body-semibold text-xs text-blue-900 mb-2">
              📌 Identifiants de test:
            </Text>
            <Text className="font-body text-xs text-blue-900 mb-1">
              • Email: admin@example.com
            </Text>
            <Text className="font-body text-xs text-blue-900">
              • Mot de passe: admin123
            </Text>
          </View>

          {/* Champ Email */}
          <Text className="font-body-medium text-xs text-brun-muted mb-1.5">
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="admin@rideplus.cm"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#8C7A6B80"
            editable={!loading}
            className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 mb-4 text-sm text-brun"
          />

          {/* Champ Mot de passe */}
          <Text className="font-body-medium text-xs text-brun-muted mb-1.5">
            Mot de passe
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            placeholderTextColor="#8C7A6B80"
            editable={!loading}
            className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 mb-6 text-sm text-brun"
          />

          {/* Afficher les erreurs locales */}
          {localError && (
            <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
              <View className="flex-row">
                <Ionicons name="alert-circle" size={16} color="#991B1B" />
                <Text className="font-body text-xs text-red-900 ml-2 flex-1">
                  {localError}
                </Text>
              </View>
            </View>
          )}

          {/* Afficher les erreurs du context */}
          {error && !localError && (
            <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
              <View className="flex-row">
                <Ionicons name="alert-circle" size={16} color="#991B1B" />
                <Text className="font-body text-xs text-red-900 ml-2 flex-1">
                  {error}
                </Text>
              </View>
            </View>
          )}

          {/* Bouton connexion */}
          <AnimatedPressable
            onPress={handleLogin}
            disabled={!isValid || loading}
            className={`rounded-2xl py-4 items-center ${
              isValid && !loading ? "bg-brun" : "bg-brun/10"
            }`}
          >
            <Text
              className={`font-body-semibold text-base ${
                isValid && !loading ? "text-creme" : "text-brun-muted"
              }`}
            >
              {loading ? "Vérification…" : "Se connecter"}
            </Text>
          </AnimatedPressable>

          {/* Retour */}
          <Pressable onPress={() => router.back()} className="mt-6">
            <Text className="font-body text-center text-sm text-brun-muted">
              ← Retour
            </Text>
          </Pressable>

          {/* DEBUG INFO */}
          {process.env.NODE_ENV === "development" && (
            <View className="mt-8 p-3 bg-gray-100 rounded-lg">
              <Text className="font-body text-xs text-gray-600 mb-1">🐛 DEBUG:</Text>
              <Text className="font-body text-xs text-gray-600">
                User: {user ? `${user.name} (${user.is_admin ? "ADMIN" : "USER"})` : "null"}
              </Text>
              <Text className="font-body text-xs text-gray-600">
                is_admin: {user?.is_admin ? "true" : "false"}
              </Text>
              <Text className="font-body text-xs text-gray-600">
                hasRedirected: {hasRedirectedRef.current ? "true" : "false"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
