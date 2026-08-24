import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

export default function Settings() {
  const { isDriver, vehicle } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-6 pt-4">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>
          <Text className="text-xl font-medium text-gray-900">Paramètres</Text>
        </View>

        {/* Proposition compte conducteur */}
        <Text className="text-xs text-gray-500 mb-2 uppercase">Type de compte</Text>
        <View className="border border-gray-100 rounded-xl p-4 mb-8">
          {isDriver ? (
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-success-50 items-center justify-center mr-3">
                <Ionicons name="car-sport" size={18} color="#3B6D11" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  Compte conducteur actif
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {vehicle?.brand} {vehicle?.model} — {vehicle?.plate}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="person" size={18} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    Compte passager
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Souhaitez-vous aussi proposer des trajets ?
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push("/add-vehicle")}
                className="bg-primary-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white text-sm font-medium">
                  Créer un compte conducteur
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text className="text-xs text-gray-500 mb-2 uppercase">Général</Text>
        {["Notifications", "Confidentialité", "Langue", "Aide et support"].map(
          (label) => (
            <Pressable
              key={label}
              className="flex-row items-center justify-between py-4 border-b border-gray-100 active:opacity-70"
            >
              <Text className="text-sm text-gray-800">{label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </Pressable>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
