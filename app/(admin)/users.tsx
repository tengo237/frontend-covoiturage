import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const USERS = [
  { id: "1", name: "Marc Ateba", role: "Conducteur", status: "Actif" },
  { id: "2", name: "Chantal Mballa", role: "Passager", status: "Actif" },
  { id: "3", name: "Paul Nkomo", role: "Passager", status: "Suspendu" },
];

export default function Users() {
  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>
        <Text className="font-display-bold text-brun text-xl">Utilisateurs</Text>
      </View>

      <FlatList
        data={USERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        ItemSeparatorComponent={() => <View className="h-px bg-brun/10" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={18} color="#0F6E56" />
              </View>
              <View>
                <Text className="font-body-semibold text-sm text-brun">{item.name}</Text>
                <Text className="font-body text-xs text-brun-muted">{item.role}</Text>
              </View>
            </View>
            <View
              className={`px-2 py-0.5 rounded-full ${
                item.status === "Actif" ? "bg-success-50" : "bg-danger-50"
              }`}
            >
              <Text
                className={`font-body-medium text-xs ${
                  item.status === "Actif" ? "text-success-600" : "text-danger-600"
                }`}
              >
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
