import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

type Mode = "login" | "signup";

export default function Login() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { refreshProfile } = useUser();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid =
    email.length > 3 &&
    password.length >= 6 &&
    (mode === "login" || name.trim().length > 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        Alert.alert(
          "Compte créé",
          "Vérifiez votre email pour confirmer votre compte, puis connectez-vous."
        );
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refreshProfile();
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-teal-600 items-center justify-center mb-5">
              <Ionicons name="car-sport" size={30} color="#FBF6EF" />
            </View>
            <Text className="font-display-bold text-brun text-2xl mb-1">
              {mode === "login" ? "Connexion à RIDE+" : "Créer un compte"}
            </Text>
            <Text className="font-body text-brun-muted text-sm">
              {mode === "login"
                ? "Connectez-vous pour continuer"
                : "Quelques infos pour commencer"}
            </Text>
          </View>

          {mode === "signup" && (
            <View className="mb-4">
              <Text className="font-body-medium text-xs text-brun-muted mb-1.5">Nom complet</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor="#8C7A6B80"
                className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
              />
            </View>
          )}

          <View className="mb-4">
            <Text className="font-body-medium text-xs text-brun-muted mb-1.5">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="vous@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#8C7A6B80"
              className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
            />
          </View>

          <View className="mb-6">
            <Text className="font-body-medium text-xs text-brun-muted mb-1.5">Mot de passe</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor="#8C7A6B80"
              className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
            />
          </View>

          <AnimatedPressable
            onPress={handleSubmit}
            disabled={!isValid || loading}
            className={`rounded-2xl py-4 items-center mb-4 ${isValid && !loading ? "bg-terre-600" : "bg-brun/10"}`}
          >
            <Text className={`font-body-semibold text-base ${isValid && !loading ? "text-creme" : "text-brun-muted"}`}>
              {loading ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </Text>
          </AnimatedPressable>

          <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")} className="mb-8">
            <Text className="font-body text-sm text-teal-600 text-center">
              {mode === "login" ? "Pas encore de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
            </Text>
          </Pressable>

          <Text className="font-body text-xs text-brun-muted text-center leading-5 mb-6">
            En continuant, vous acceptez les conditions d'utilisation de RIDE+.
          </Text>

          <Pressable onPress={() => router.push("/admin-login")} hitSlop={10}>
            <Text className="font-body text-xs text-brun-muted text-center underline">
              Administrateur ? Connectez-vous ici
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
