import React from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getTripById } from "../../../lib/trips";

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = getTripById(id);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (!trip) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-sm text-gray-500">Trajet introuvable.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm text-primary-600">Retour</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-6 pt-4">
        <View className={`w-full ${isTablet ? "max-w-xl self-center" : ""}`}>
          <Pressable onPress={() => router.back()} className="mb-6" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>

          {/* Trajet */}
          <View className="border border-gray-100 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-3">
              <View className="items-center mr-3">
                <View className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                <View className="w-px h-8 bg-gray-200 my-0.5" />
                <View className="w-2.5 h-2.5 rounded-full bg-danger-600" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">{trip.from}</Text>
                <View className="h-6" />
                <Text className="text-base font-medium text-gray-900">{trip.to}</Text>
              </View>
            </View>
            <View className="flex-row items-center pt-3 border-t border-gray-100">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-2">
                {trip.date} — {trip.time}
              </Text>
            </View>
          </View>

          {/* Conducteur */}
          <Text className="text-xs text-gray-500 mb-2 uppercase">Conducteur</Text>
          <View className="border border-gray-100 rounded-2xl p-4 mb-6 flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-primary-50 items-center justify-center mr-3">
              <Ionicons name="person" size={26} color="#185FA5" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">{trip.driver.name}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text className="text-xs text-gray-500 ml-1">
                  {trip.driver.rating} · {trip.driver.tripsCount} trajets
                </Text>
              </View>
              <Text className="text-xs text-gray-400 mt-0.5">
                {trip.vehicle.brand} {trip.vehicle.model}
              </Text>
            </View>
          </View>

          {/* Places et prix */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {trip.seatsAvailable} places disponibles
              </Text>
            </View>
            <Text className="text-lg font-medium text-primary-600">
              {trip.price.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(`/trip/${trip.id}/payment`)}
            className="bg-primary-600 rounded-xl py-4 items-center mb-10 active:opacity-80"
          >
            <Text className="text-white text-base font-medium">Réserver ce trajet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
