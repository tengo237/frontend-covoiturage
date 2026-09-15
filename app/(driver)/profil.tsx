import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

export default function DriverProfil() {
  // ✅ CORRIGÉ: Utiliser 'user' au lieu de 'profile'
  const { user, logout } = useUser();

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-creme items-center justify-center">
        <Text className="font-body text-brun-muted">Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center mb-3">
            <Ionicons name="person" size={36} color="#0F6E56" />
          </View>
          {/* ✅ CORRIGÉ: Utiliser user.name et user.email */}
          <Text className="font-display-bold text-brun text-lg">{user.name}</Text>
          <Text className="font-body text-brun-muted text-sm">{user.email}</Text>
          
          <View className="flex-row items-center mt-4 px-3 py-1 rounded-full bg-teal-100 border border-teal-300">
            <Ionicons name="car-sport" size={14} color="#0F6E56" />
            <Text className="font-body-medium text-xs text-teal-700 ml-1.5">
              Conducteur vérifié
            </Text>
          </View>
        </View>

        {/* VEHICLE SECTION */}
        <View className="mb-6">
          <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">
            Véhicule
          </Text>
          <Pressable
            onPress={() => router.push("/add-vehicle")}
            className="bg-white border border-brun/10 rounded-2xl p-4 flex-row items-center justify-between active:opacity-70"
          >
            <View>
              <Text className="font-body-semibold text-sm text-brun mb-0.5">
                Votre véhicule
              </Text>
              <Text className="font-body text-sm text-brun-muted">
                Gérer vos véhicules
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="font-body-medium text-xs text-teal-600 mr-1">Voir</Text>
              <Ionicons name="chevron-forward" size={16} color="#0F6E56" />
            </View>
          </Pressable>
        </View>

        {/* MENU ITEMS */}
        <View className="border-t border-brun/10">
          {/* Edit Profile */}
          <Pressable
            onPress={() => router.push("/edit-profile")}
            className="flex-row items-center justify-between py-4 border-b border-brun/10 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={20} color="#3D2B1F" />
              <Text className="font-body text-sm text-brun ml-3">
                Modifier mes informations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Switch to Passenger */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="flex-row items-center justify-between py-4 border-b border-brun/10 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="swap-horizontal-outline" size={20} color="#3D2B1F" />
              <Text className="font-body text-sm text-brun ml-3">
                Voir en tant que passager
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Settings */}
          <Pressable
            onPress={() => {}}
            className="flex-row items-center justify-between py-4 border-b border-brun/10 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={20} color="#3D2B1F" />
              <Text className="font-body text-sm text-brun ml-3">
                Paramètres
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Help */}
          <Pressable
            onPress={() => {}}
            className="flex-row items-center justify-between py-4 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={20} color="#3D2B1F" />
              <Text className="font-body text-sm text-brun ml-3">
                Aide & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          onPress={handleLogout}
          className="mt-8 mb-10 py-3 px-4 bg-red-100 border border-red-300 rounded-xl items-center"
        >
          <Text className="font-body-semibold text-sm text-red-700">
            Se déconnecter
          </Text>
        </Pressable>

        {/* DEBUG INFO */}
        {process.env.NODE_ENV === "development" && (
          <View className="mb-8 p-3 bg-gray-100 rounded-lg">
            <Text className="font-body text-xs text-gray-600 mb-1">🐛 DEBUG:</Text>
            <Text className="font-body text-xs text-gray-600">ID: {user.id}</Text>
            <Text className="font-body text-xs text-gray-600">Name: {user.name}</Text>
            <Text className="font-body text-xs text-gray-600">
              is_driver: {user.is_driver ? "true" : "false"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
