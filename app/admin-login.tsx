import React, { useState } from "react";
import { View, Text, TextInput, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAsAdmin } = useUser();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const isValid = email.length > 3 && password.length >= 6;

  const handleLogin = () => {
    // TODO: vérifier email/mot de passe auprès de votre backend,
    // et ne considérer l'utilisateur admin que si le backend le confirme.
    loginAsAdmin();
    router.replace("/(admin)");
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
          <Pressable onPress={() => router.back()} className="mb-8" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
          </Pressable>

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

          <Text className="font-body-medium text-xs text-brun-muted mb-1.5">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="admin@rideplus.cm"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#8C7A6B80"
            className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 mb-4 text-sm text-brun"
          />

          <Text className="font-body-medium text-xs text-brun-muted mb-1.5">Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            placeholderTextColor="#8C7A6B80"
            className="font-body border border-brun/15 bg-white rounded-2xl px-4 py-3.5 mb-6 text-sm text-brun"
          />

          <AnimatedPressable
            onPress={handleLogin}
            disabled={!isValid}
            className={`rounded-2xl py-4 items-center ${isValid ? "bg-brun" : "bg-brun/10"}`}
          >
            <Text className={`font-body-semibold text-base ${isValid ? "text-creme" : "text-brun-muted"}`}>
              Se connecter
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
