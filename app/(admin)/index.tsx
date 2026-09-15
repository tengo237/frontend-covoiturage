import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

const STATS = [
  { label: "Utilisateurs actifs", value: "1 284", icon: "people-outline" as const },
  { label: "Trajets ce mois", value: "342", icon: "car-outline" as const },
  { label: "Colis envoyés", value: "97", icon: "cube-outline" as const },
  { label: "Signalements en attente", value: "6", icon: "warning-outline" as const },
];

export default function AdminDashboard() {
  // ✅ Utiliser logout au lieu de signOut
  const { logout } = useUser();

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/admin-login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="font-display-bold text-brun text-2xl">Administration</Text>
          <Pressable onPress={() => router.replace("/admin-login")} hitSlop={10}>
            <Ionicons name="close" size={24} color="#3D2B1F" />
          </Pressable>
        </View>

        {/* STATS CARDS */}
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {STATS.map((s) => (
            <View
              key={s.label}
              className="bg-white border border-brun/10 rounded-2xl p-4"
              style={{ width: "47%" }}
            >
              <View className="w-9 h-9 rounded-full bg-teal-50 items-center justify-center mb-3">
                <Ionicons name={s.icon} size={17} color="#0F6E56" />
              </View>
              <Text className="font-display-bold text-brun text-xl">{s.value}</Text>
              <Text className="font-body text-xs text-brun-muted mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* MENU ITEMS */}
        <View className="mt-6">
          {/* Driver Applications */}
          <Pressable
            onPress={() => router.push("/(admin)/driver-applications")}
            className="flex-row items-center justify-between bg-white border border-brun/10 rounded-2xl p-4 mb-3 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={20} color="#D85A30" />
              <Text className="font-body text-sm text-brun ml-3">
                Dossiers conducteur à valider
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Suivi */}
          <Pressable
            onPress={() => router.push("/(admin)/suivi")}
            className="flex-row items-center justify-between bg-white border border-brun/10 rounded-2xl p-4 mb-3 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={20} color="#0F6E56" />
              <Text className="font-body text-sm text-brun ml-3">
                Suivre les trajets en direct
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Signalements */}
          <Pressable
            onPress={() => router.push("/(admin)/signalements")}
            className="flex-row items-center justify-between bg-white border border-brun/10 rounded-2xl p-4 mb-3 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="flag-outline" size={20} color="#D8453C" />
              <Text className="font-body text-sm text-brun ml-3">
                Consulter les signalements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Users */}
          <Pressable
            onPress={() => router.push("/(admin)/users")}
            className="flex-row items-center justify-between bg-white border border-brun/10 rounded-2xl p-4 mb-6 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={20} color="#D85A30" />
              <Text className="font-body text-sm text-brun ml-3">
                Gérer les comptes utilisateurs
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center py-4 mb-10"
        >
          <Ionicons name="log-out-outline" size={18} color="#D8453C" />
          <Text className="font-body-semibold text-sm text-red-700 ml-2">
            Se déconnecter
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
