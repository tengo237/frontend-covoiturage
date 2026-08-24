import React, { useState } from "react";
import { View, Text, TextInput, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const handleSendCode = () => {
    // TODO: envoyer un code OTP via votre backend / Firebase phone auth
    router.push("/(tabs)"); // à remplacer par un écran de vérification OTP si besoin
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`w-full ${isTablet ? "max-w-md" : ""}`}>
          <Pressable onPress={() => router.back()} className="mb-8" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>

          <Text className="text-xl font-medium text-gray-900 mb-1">
            Votre numéro de téléphone
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            Nous vous enverrons un code de vérification par SMS.
          </Text>

          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3.5 mb-6">
            <Text className="text-sm text-gray-700 mr-2">+237</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="6XX XXX XXX"
              keyboardType="phone-pad"
              className="flex-1 text-sm text-gray-900"
            />
          </View>

          <Pressable
            onPress={handleSendCode}
            disabled={phone.length < 8}
            className={`w-full rounded-xl py-4 items-center ${
              phone.length < 8 ? "bg-gray-200" : "bg-primary-600 active:opacity-80"
            }`}
          >
            <Text
              className={`text-base font-medium ${
                phone.length < 8 ? "text-gray-400" : "text-white"
              }`}
            >
              Recevoir le code
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
