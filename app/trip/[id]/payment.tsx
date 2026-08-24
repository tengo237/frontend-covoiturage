import React, { useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getTripById } from "../../../lib/trips";

type PaymentMethod = "orange" | "mtn" | null;

export default function Payment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = getTripById(id);
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (!trip) return null;

  const handleConfirm = () => {
    // TODO: intégrer le vrai SDK Orange Money / MTN Mobile Money.
    // Ces intégrations nécessitent un development build (incompatibles avec Expo Go).
    setProcessing(true);
    setTimeout(() => {
      router.replace(`/trip/${trip.id}/confirmation`);
    }, 1200);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-4">
        <View className={`w-full ${isTablet ? "max-w-xl self-center" : ""}`}>
          <Pressable onPress={() => router.back()} className="mb-6" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>

          <Text className="text-xl font-medium text-gray-900 mb-1">
            Mode de paiement
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            {trip.from} → {trip.to} — {trip.price.toLocaleString("fr-FR")} FCFA
          </Text>

          <Pressable
            onPress={() => setMethod("orange")}
            className={`flex-row items-center border rounded-xl px-4 py-4 mb-3 ${
              method === "orange" ? "border-primary-600 bg-primary-50" : "border-gray-200"
            }`}
          >
            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
              <Ionicons name="phone-portrait-outline" size={18} color="#EA580C" />
            </View>
            <Text className="flex-1 text-sm font-medium text-gray-800">Orange Money</Text>
            {method === "orange" && (
              <Ionicons name="checkmark-circle" size={20} color="#185FA5" />
            )}
          </Pressable>

          <Pressable
            onPress={() => setMethod("mtn")}
            className={`flex-row items-center border rounded-xl px-4 py-4 mb-8 ${
              method === "mtn" ? "border-primary-600 bg-primary-50" : "border-gray-200"
            }`}
          >
            <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3">
              <Ionicons name="phone-portrait-outline" size={18} color="#CA8A04" />
            </View>
            <Text className="flex-1 text-sm font-medium text-gray-800">MTN Mobile Money</Text>
            {method === "mtn" && (
              <Ionicons name="checkmark-circle" size={20} color="#185FA5" />
            )}
          </Pressable>

          <Pressable
            onPress={handleConfirm}
            disabled={!method || processing}
            className={`rounded-xl py-4 items-center ${
              method && !processing ? "bg-primary-600 active:opacity-80" : "bg-gray-200"
            }`}
          >
            <Text className={`text-base font-medium ${method && !processing ? "text-white" : "text-gray-400"}`}>
              {processing ? "Traitement en cours..." : "Confirmer et payer"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
