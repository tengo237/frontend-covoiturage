import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
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
  const { profile, isDriver, vehicle } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4">
        <View className="items-center mb-8">
          <Pressable onPress={() => router.push("/edit-profile")} className="relative mb-3">
            <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center overflow-hidden">
              {profile.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Ionicons name="person" size={36} color="#0F6E56" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-terre-600 items-center justify-center border-2 border-creme">
              <Ionicons name="pencil" size={12} color="#FBF6EF" />
            </View>
          </Pressable>

          <Text className="font-display-bold text-brun text-lg">{profile.name}</Text>
          <Text className="font-body text-brun-muted text-sm">{profile.email}</Text>

          <Pressable onPress={() => router.push("/edit-profile")} className="mt-2">
            <Text className="font-body-medium text-teal-600 text-xs underline">
              Modifier le profil
            </Text>
          </Pressable>

          {isDriver ? (
            <Pressable
              onPress={() => router.replace("/(driver)")}
              className="flex-row items-center mt-4 px-4 py-2 rounded-full bg-success-50 active:opacity-70"
            >
              <Ionicons name="car-sport" size={14} color="#0F6E56" />
              <Text className="font-body-medium text-xs text-success-600 ml-1.5">
                Accéder à mon espace conducteur
              </Text>
              <Ionicons name="arrow-forward" size={12} color="#0F6E56" style={{ marginLeft: 6 }} />
            </Pressable>
          ) : (
            <View className="flex-row items-center mt-4 px-3 py-1 rounded-full bg-brun/5">
              <Ionicons name="person" size={14} color="#8C7A6B" />
              <Text className="font-body-medium text-xs text-brun-muted ml-1.5">Passager</Text>
            </View>
          )}
        </View>

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

        <Pressable onPress={() => router.replace("/login")} className="mt-8 mb-10 items-center">
          <Text className="font-body-medium text-sm text-danger-600">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
