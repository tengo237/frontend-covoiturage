import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const REPORTS = [
  { id: "1", reporter: "Marc Ateba", target: "Chantal Mballa", reason: "Conducteur en retard répété", status: "En attente" },
  { id: "2", reporter: "Paul Nkomo", target: "Trajet #482", reason: "Trajet non effectué", status: "En attente" },
];

export default function Signalements() {
  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>
        <Text className="font-display-bold text-brun text-xl">Signalements</Text>
      </View>

      <FlatList
        data={REPORTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View className="bg-white border border-brun/10 rounded-2xl p-4">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-body-semibold text-sm text-brun">
                {item.reporter} → {item.target}
              </Text>
              <View className="bg-danger-50 px-2 py-0.5 rounded-full">
                <Text className="font-body-medium text-xs text-danger-600">{item.status}</Text>
              </View>
            </View>
            <Text className="font-body text-xs text-brun-muted">{item.reason}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
