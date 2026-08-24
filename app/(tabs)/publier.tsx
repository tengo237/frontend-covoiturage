import React from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TRIPS } from "../../lib/trips";

export default function Publier() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <View className={`w-full ${isTablet ? "max-w-xl self-center" : ""}`}>
          <Text className="font-display-bold text-brun text-2xl mb-1">
            Voitures disponibles
          </Text>
          <Text className="font-body text-brun-muted text-sm mb-6">
            Véhicules avec des places libres sur leur trajet
          </Text>

          {TRIPS.map((trip) => (
            <Pressable
              key={trip.id}
              onPress={() => router.push(`/trip/${trip.id}`)}
              className="bg-white border border-brun/10 rounded-2xl p-4 mb-3 active:opacity-70"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-11 h-11 rounded-full bg-teal-50 items-center justify-center mr-3">
                  <Ionicons name="car-sport" size={20} color="#0F6E56" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-semibold text-sm text-brun">
                    {trip.vehicle.brand} {trip.vehicle.model}
                  </Text>
                  <Text className="font-body text-xs text-brun-muted">
                    {trip.driver.name} · ⭐ {trip.driver.rating}
                  </Text>
                </View>
                <Text className="font-body-semibold text-sm text-terre-600">
                  {trip.price.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-brun/10">
                <Text className="font-body text-xs text-brun">
                  {trip.from} → {trip.to}
                </Text>
                <View className="flex-row items-center">
                  <Text className="font-body text-xs text-brun-muted mr-3">
                    {trip.date}, {trip.time}
                  </Text>
                  <Ionicons name="people-outline" size={13} color="#8C7A6B" />
                  <Text className="font-body text-xs text-brun-muted ml-1">
                    {trip.seatsAvailable}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
