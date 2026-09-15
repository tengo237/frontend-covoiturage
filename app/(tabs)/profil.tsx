import React from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

const MENU_ITEMS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
}[] = [
  { icon: "cube-outline", label: "Mes colis" },
  { icon: "shield-checkmark-outline", label: "Contacts d'urgence" },
  { icon: "card-outline", label: "Moyens de paiement" },
  { icon: "settings-outline", label: "Paramètres", route: "/(tabs)/settings" },
];

export default function Profil() {
  const { user, loading, isDriver, logout, switchRole } = useUser();

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

  const handleSwitchToDriver = async () => {
    try {
      await switchRole("driver");
      router.replace("/(driver)");
    } catch (err) {
      Alert.alert("Erreur", "Impossible de basculer vers l'espace conducteur");
    }
  };

  const handleBecomeDriver = () => {
    Alert.alert(
      "Devenir conducteur",
      "Vous devez ajouter un véhicule pour devenir conducteur. Continuer?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Ajouter un véhicule",
          onPress: () => router.push("/add-vehicle"),
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-creme items-center justify-center">
        <ActivityIndicator size="large" color="#1F41BB" />
      </SafeAreaView>
    );
  }

  // Not connected
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-creme items-center justify-center">
        <Text className="font-body text-brun-muted mb-4">Vous n'êtes pas connecté</Text>
        <Pressable
          onPress={() => router.replace("/login")}
          className="bg-terre-600 rounded-2xl px-6 py-3"
        >
          <Text className="font-body-semibold text-creme">Se connecter</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View className="items-center mb-8">
          {/* Avatar */}
          <Pressable onPress={() => router.push("/edit-profile")} className="relative mb-3">
            <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center overflow-hidden">
              {user.photo_url ? (
                <Image source={{ uri: user.photo_url }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Ionicons name="person" size={36} color="#0F6E56" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-terre-600 items-center justify-center border-2 border-creme">
              <Ionicons name="pencil" size={12} color="#FBF6EF" />
            </View>
          </Pressable>

          {/* Name & Email */}
          <Text className="font-display-bold text-brun text-lg">{user.name}</Text>
          <Text className="font-body text-brun-muted text-sm">{user.email}</Text>

          {/* Edit Profile Link */}
          <Pressable onPress={() => router.push("/edit-profile")} className="mt-2">
            <Text className="font-body-medium text-teal-600 text-xs underline">
              Modifier le profil
            </Text>
          </Pressable>

          {/* Role Badge */}
          <View className="mt-4 px-3 py-1 bg-teal-100 border border-teal-300 rounded-full">
            <Text className="font-body-medium text-xs text-teal-700">
              Passager
            </Text>
          </View>
        </View>

        {/* ✅ BOUTONS DE RÔLE */}
        <View className="mb-6 gap-2">
          {/* ✅ SI PASSAGER SEULEMENT: Bouton "Devenir conducteur" */}
          {!isDriver && (
            <Pressable
              onPress={handleBecomeDriver}
              className="bg-gradient-to-r from-terre-600 to-terre-700 rounded-2xl px-6 py-4 items-center border border-terre-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="car-sport" size={20} color="#FBF6EF" />
                <Text className="font-body-semibold text-creme text-base ml-2">
                  Devenir conducteur
                </Text>
              </View>
            </Pressable>
          )}

          {/* ✅ SI CONDUCTEUR: Bouton "Espace conducteur" */}
          {isDriver && (
            <Pressable
              onPress={handleSwitchToDriver}
              className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl px-6 py-4 items-center border border-teal-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="car" size={20} color="#FBF6EF" />
                <Text className="font-body-semibold text-creme text-base ml-2">
                  Espace conducteur
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* MENU */}
        <View className="border-t border-brun/10">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => item.route && router.push(item.route as any)}
              className="flex-row items-center justify-between py-4 border-b border-brun/10 active:opacity-70"
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon} size={20} color="#3D2B1F" />
                <Text className="font-body text-sm text-brun ml-3">{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
            </Pressable>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          onPress={handleLogout}
          className="mt-8 mb-10 py-3 px-4 bg-red-100 border border-red-300 rounded-xl items-center"
        >
          <Text className="font-body-semibold text-sm text-red-700">Se déconnecter</Text>
        </Pressable>

        {/* DEBUG INFO (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <View className="mb-8 p-3 bg-gray-100 rounded-lg">
            <Text className="font-body text-xs text-gray-600 mb-1">🐛 DEBUG:</Text>
            <Text className="font-body text-xs text-gray-600">
              ID: {user.id}
            </Text>
            <Text className="font-body text-xs text-gray-600">
              Name: {user.name}
            </Text>
            <Text className="font-body text-xs text-gray-600">
              Roles: {JSON.stringify(user.roles)}
            </Text>
            <Text className="font-body text-xs text-gray-600">
              Current Role: {user.current_role}
            </Text>
            <Text className="font-body text-xs text-gray-600">
              is_driver: {isDriver ? "true" : "false"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
