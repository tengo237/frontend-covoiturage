import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getTripById } from "../../../lib/trips";

export default function Confirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = getTripById(id);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (!trip) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className={`items-center ${isTablet ? "max-w-md" : ""}`}>
          <View className="w-20 h-20 rounded-full bg-success-50 items-center justify-center mb-6">
            <Ionicons name="checkmark" size={40} color="#3B6D11" />
          </View>
          <Text className="text-xl font-medium text-gray-900 text-center mb-2">
            Réservation confirmée
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8">
            Votre place sur le trajet {trip.from} → {trip.to} du {trip.date} à{" "}
            {trip.time} est réservée. Un message a été envoyé à {trip.driver.name}.
          </Text>
          <Pressable
            onPress={() => router.replace(`/trip/${trip.id}/suivi`)}
            className="bg-primary-600 rounded-xl py-4 px-10 mb-3 active:opacity-80"
          >
            <Text className="text-white text-base font-medium">
              Suivre ce trajet en direct
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="py-2 active:opacity-70"
          >
            <Text className="text-primary-600 text-sm font-medium">
              Retour à l'accueil
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
