import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

function RouteDivider() {
  return (
    <View className="flex-row items-center justify-center mb-10" style={{ gap: 5 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} className="bg-brun/10" style={{ width: 16, height: 2, borderRadius: 1 }} />
      ))}
    </View>
  );
}

export default function Login() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { isDriver } = useUser();

  // Atterrissage automatique dans l'espace conducteur si le compte l'est déjà.
  const landingRoute = isDriver ? "/(driver)" : "/(tabs)";

  const handleGoogleLogin = () => router.replace(landingRoute);
  const handlePhoneLogin = () => router.push("/phone-login");

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-teal-600 items-center justify-center mb-5">
              <Ionicons name="car-sport" size={30} color="#FBF6EF" />
            </View>
            <Text className="font-display-bold text-brun text-2xl mb-1">
              Connexion à RIDE+
            </Text>
            <Text className="font-body text-brun-muted text-sm">
              Créez votre compte pour commencer
            </Text>
          </View>

          <RouteDivider />

          <AnimatedPressable
            onPress={handleGoogleLogin}
            className="flex-row items-center justify-center gap-2 bg-white border border-brun/10 rounded-2xl py-4 mb-3"
          >
            <Ionicons name="logo-google" size={18} color="#3D2B1F" />
            <Text className="font-body-semibold text-brun text-sm">
              Continuer avec Google
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handlePhoneLogin}
            className="flex-row items-center justify-center gap-2 bg-terre-600 rounded-2xl py-4 mb-8"
          >
            <Ionicons name="call-outline" size={18} color="#FBF6EF" />
            <Text className="font-body-semibold text-creme text-sm">
              Continuer avec le téléphone
            </Text>
          </AnimatedPressable>

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
