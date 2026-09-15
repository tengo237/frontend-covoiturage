import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

type Mode = "login" | "signup";

export default function Login() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { user, login, signup, error, clearError, switchRole } = useUser();

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
    clearError();
    try {
      if (mode === "signup") {
        await signup({
          name: name.trim(),
          email: email.trim(),
          phone: "",
          password,
        });
        Alert.alert(
          "Compte créé",
          "Vous êtes maintenant inscrit! Connectez-vous pour continuer."
        );
        setMode("login");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        // ✅ LOGIN
        await login({ email: email.trim(), password });

        // ✅ ATTENDRE LA MISE À JOUR DU STATE
        setTimeout(() => {
          if (user) {
            // ✅ SI L'UTILISATEUR A EXACTEMENT 2 RÔLES
            // (= passager qui a ajouté un véhicule et est devenu conducteur)
            if (user.roles.length === 2) {
              Alert.alert(
                "Choisissez votre rôle",
                "Vous pouvez être passager et conducteur. Par quel souhaitez-vous commencer?",
                [
                  {
                    text: "Passager",
                    onPress: async () => {
                      await switchRole("passenger");
                      router.replace("/(tabs)");
                    },
                  },
                  {
                    text: "Conducteur",
                    onPress: async () => {
                      await switchRole("driver");
                      router.replace("/(driver)");
                    },
                  },
                ]
              );
            } 
            // ✅ SI SEULEMENT CONDUCTEUR
            else if (user.roles.length === 1 && user.roles.includes("driver")) {
              router.replace("/(driver)");
            } 
            // ✅ SI SEULEMENT PASSAGER (défaut)
            else {
              router.replace("/(tabs)");
            }
          }
        }, 300);
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
              <Text className="font-body-medium text-xs text-brun-muted mb-1.5">
                Nom complet
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor="#8C7A6B80"
                editable={!loading}
                className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
              />
            </View>
          )}

          <View className="mb-4">
            <Text className="font-body-medium text-xs text-brun-muted mb-1.5">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="vous@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#8C7A6B80"
              editable={!loading}
              className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 text-sm text-brun"
            />
          </View>

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

          {error && (
            <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
              <Text className="font-body text-xs text-red-900">{error}</Text>
            </View>
          )}

          <AnimatedPressable
            onPress={handleSubmit}
            disabled={!isValid || loading}
            className={`rounded-2xl py-4 items-center mb-4 ${
              isValid && !loading ? "bg-terre-600" : "bg-brun/10"
            }`}
          >
            <Text
              className={`font-body-semibold text-base ${
                isValid && !loading ? "text-creme" : "text-brun-muted"
              }`}
            >
              {loading
                ? "Patientez…"
                : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
            </Text>
          </AnimatedPressable>

          <Pressable
            onPress={() => setMode(mode === "login" ? "signup" : "login")}
            className="mb-8"
            disabled={loading}
          >
            <Text className="font-body text-sm text-teal-600 text-center">
              {mode === "login"
                ? "Pas encore de compte ? Créez-en un"
                : "Déjà un compte ? Connectez-vous"}
            </Text>
          </Pressable>

          <Text className="font-body text-xs text-brun-muted text-center leading-5 mb-6">
            En continuant, vous acceptez les conditions d'utilisation de RIDE+.
          </Text>

          {/* TEST ACCOUNTS INFO */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <Text className="font-body-semibold text-xs text-blue-900 mb-2">
              🧪 Comptes de test:
            </Text>
            <Text className="font-body text-xs text-blue-800 mb-1">
              Dual (Passager + Conducteur): test@example.com / password123
            </Text>
            <Text className="font-body text-xs text-blue-800">
              Passager: passenger@example.com / password123
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/admin-login")}
            hitSlop={10}
            disabled={loading}
          >
            <Text className="font-body text-xs text-brun-muted text-center underline">
              Administrateur ? Connectez-vous ici
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
