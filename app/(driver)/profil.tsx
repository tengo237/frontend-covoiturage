import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

export default function DriverProfil() {
  const { profile, vehicle } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center mb-3">
            <Ionicons name="person" size={36} color="#0F6E56" />
          </View>
          <Text className="font-display-bold text-brun text-lg">{profile.name}</Text>
          <Text className="font-body text-brun-muted text-sm">{profile.email}</Text>

          <View className="flex-row items-center mt-4 px-3 py-1 rounded-full bg-success-50">
            <Ionicons name="car-sport" size={14} color="#0F6E56" />
            <Text className="font-body-medium text-xs text-success-600 ml-1.5">
              Conducteur vérifié
            </Text>
          </View>
        </View>

        <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Véhicule</Text>
        <Pressable
          onPress={() => router.push("/edit-vehicle")}
          className="bg-white border border-brun/10 rounded-2xl p-4 mb-6 flex-row items-center justify-between active:opacity-70"
        >
          <View>
            <Text className="font-body-semibold text-sm text-brun mb-0.5">
              {vehicle?.brand} {vehicle?.model}
            </Text>
            <Text className="font-body text-sm text-brun-muted">{vehicle?.plate}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="font-body-medium text-xs text-teal-600 mr-1">Modifier</Text>
            <Ionicons name="chevron-forward" size={16} color="#0F6E56" />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push("/edit-profile")}
          className="flex-row items-center justify-between py-4 border-b border-brun/10 active:opacity-70"
        >
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#3D2B1F" />
            <Text className="font-body text-sm text-brun ml-3">Modifier mes informations</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="flex-row items-center justify-between py-4 border-b border-brun/10 active:opacity-70"
        >
          <View className="flex-row items-center">
            <Ionicons name="swap-horizontal-outline" size={20} color="#3D2B1F" />
            <Text className="font-body text-sm text-brun ml-3">Voir en tant que passager</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
        </Pressable>

        <Pressable onPress={() => router.replace("/login")} className="mt-8 mb-10 items-center">
          <Text className="font-body-medium text-sm text-danger-600">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
