import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TRIPS } from "../../lib/trips";

export default function Recherche() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <View className={`w-full ${isTablet ? "max-w-xl self-center" : ""}`}>
          <Text className="text-2xl font-medium text-gray-900 mb-1">
            Où allez-vous ?
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            Trouvez un trajet disponible près de chez vous
          </Text>

          <View className="border border-gray-200 rounded-2xl p-4 mb-8">
            <View className="flex-row items-center border-b border-gray-100 pb-3 mb-3">
              <Ionicons name="radio-button-on-outline" size={18} color="#185FA5" />
              <Text className="text-sm text-gray-500 ml-3">{from || "Départ"}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={18} color="#A32D2D" />
              <Text className="text-sm text-gray-500 ml-3">{to || "Destination"}</Text>
            </View>
          </View>

          <Pressable className="bg-primary-600 rounded-xl py-4 items-center mb-8 active:opacity-80">
            <Text className="text-white text-base font-medium">
              Rechercher un trajet
            </Text>
          </Pressable>

          <Text className="text-base font-medium text-gray-900 mb-3">
            Trajets récents
          </Text>
          {TRIPS.map((trip) => (
            <Pressable
              key={trip.id}
              onPress={() => router.push(`/trip/${trip.id}`)}
              className="border border-gray-100 rounded-xl p-4 mb-3 flex-row justify-between items-center active:opacity-70"
            >
              <View>
                <Text className="text-sm font-medium text-gray-900">
                  {trip.from} → {trip.to}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {trip.date}, {trip.time}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-medium text-primary-600">
                  {trip.price.toLocaleString("fr-FR")} FCFA
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginTop: 4 }} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
