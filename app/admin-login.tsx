import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, useWindowDimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

export default function AdminLogin() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { login, error, clearError } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = email.length > 3 && password.length >= 6;

  const handleLogin = async () => {
    setLoading(true);
    clearError();
    try {
      console.log("🔐 ADMIN LOGIN - Tentative connexion:", email);
      await login({ email: email.trim(), password });
      console.log("🔐 ADMIN LOGIN - Succès!");

      // Redirection automatique au dashboard admin
      setTimeout(() => {
        console.log("🔐 ADMIN - Redirection vers /(admin)");
        router.replace("/(admin)");
      }, 300);
    } catch (err: any) {
      console.error("🔐 ADMIN LOGIN - Erreur:", err);
      Alert.alert("Erreur", err.message ?? "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-red-600 items-center justify-center mb-5">
                <Ionicons name="shield-checkmark" size={30} color="#FBF6EF" />
              </View>
              <Text className="font-display-bold text-brun text-2xl mb-1">
                Espace Administrateur
              </Text>
              <Text className="font-body text-brun-muted text-sm text-center">
                Accès réservé aux administrateurs RIDE+
              </Text>
            </View>

            {/* Back Button */}
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center mb-6 active:opacity-70"
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={20} color="#D85A30" />
              <Text className="font-body text-sm text-orange-600 ml-2">
                Retour à la connexion
              </Text>
            </Pressable>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="font-body-medium text-xs text-brun-muted mb-1.5">
                Email administrateur
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="admin@ride.com"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#8C7A6B80"
                editable={!loading}
                className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
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
                className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
              />
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                <Text className="font-body text-xs text-red-900">{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <AnimatedPressable
              onPress={handleLogin}
              disabled={!isValid || loading}
              className={`rounded-2xl py-4 items-center mb-4 ${
                isValid && !loading ? "bg-red-600" : "bg-brun/10"
              }`}
            >
              <Text
                className={`font-body-semibold text-base ${
                  isValid && !loading ? "text-white" : "text-brun-muted"
                }`}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Text>
            </AnimatedPressable>

            {/* Warning Banner */}
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
              <View className="flex-row items-start gap-3">
                <Ionicons name="warning" size={20} color="#991B1B" />
                <View className="flex-1">
                  <Text className="font-body-semibold text-xs text-red-900 mb-1">
                    ⚠️ Accès Sécurisé
                  </Text>
                  <Text className="font-body text-xs text-red-800 leading-4">
                    Cet espace est protégé. Seuls les administrateurs RIDE+ peuvent accéder à ce tableau de bord.
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <Text className="font-body-semibold text-xs text-blue-900 mb-2">
                💡 Besoin d'aide?
              </Text>
              <Text className="font-body text-xs text-blue-800">
                Si vous n'êtes pas administrateur, veuillez utiliser la connexion standard.
              </Text>
            </View>

            {/* T.O.S */}
            <Text className="font-body text-xs text-brun-muted text-center leading-5 mt-8">
              Accès à l'administration RIDE+ - Tous les accès sont enregistrés
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
