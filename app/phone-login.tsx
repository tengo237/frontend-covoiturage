import React, { useState } from "react";
import { View, Text, TextInput, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../context/UserContext";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { isDriver } = useUser();

  const handleSendCode = () => {
    const landingRoute = isDriver ? "/(driver)" : "/(tabs)";
    router.push(landingRoute as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
          <Pressable onPress={() => router.back()} className="mb-8" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
          </Pressable>

          <Text className="font-display-bold text-brun text-xl mb-1">
            Votre numéro de téléphone
          </Text>
          <Text className="font-body text-brun-muted text-sm mb-6">
            Nous vous enverrons un code de vérification par SMS.
          </Text>

          <View className="flex-row items-center border border-brun/15 bg-white rounded-2xl px-4 py-3.5 mb-6">
            <Text className="font-body text-sm text-brun mr-2">+237</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="6XX XXX XXX"
              keyboardType="phone-pad"
              placeholderTextColor="#8C7A6B80"
              className="font-body flex-1 text-sm text-brun"
            />
          </View>

          <Pressable
            onPress={handleSendCode}
            disabled={phone.length < 8}
            className={`w-full rounded-2xl py-4 items-center ${
              phone.length < 8 ? "bg-brun/10" : "bg-terre-600 active:opacity-80"
            }`}
          >
            <Text className={`font-body-semibold text-base ${phone.length < 8 ? "text-brun-muted" : "text-creme"}`}>
              Recevoir le code
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
