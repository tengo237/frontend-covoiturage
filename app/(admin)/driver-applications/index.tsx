import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DRIVER_APPLICATIONS, ApplicationStatus } from "../../../lib/driverApplications";

const STATUS_STYLE: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-[#FDF3D9]", text: "text-[#8A6A00]", label: "En attente" },
  approved: { bg: "bg-success-50", text: "text-success-600", label: "Validé" },
  rejected: { bg: "bg-danger-50", text: "text-danger-600", label: "Refusé" },
};

export default function DriverApplications() {
  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>
        <Text className="font-display-bold text-brun text-xl">Dossiers conducteur</Text>
      </View>

      <FlatList
        data={DRIVER_APPLICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const style = STATUS_STYLE[item.status];
          return (
            <Pressable
              onPress={() => router.push(`/(admin)/driver-applications/${item.id}`)}
              className="bg-white border border-brun/10 rounded-2xl p-4 active:opacity-70"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                    <Ionicons name="person-outline" size={18} color="#0F6E56" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-semibold text-sm text-brun">
                      {item.applicantName}
                    </Text>
                    <Text className="font-body text-xs text-brun-muted">
                      {item.vehicle.brand} {item.vehicle.model} · {item.vehicle.plate}
                    </Text>
                  </View>
                </View>
                <View className={`px-2 py-1 rounded-full ${style.bg}`}>
                  <Text className={`font-body-medium text-xs ${style.text}`}>{style.label}</Text>
                </View>
              </View>
              <Text className="font-body text-xs text-brun-muted">
                Soumis le {item.submittedAt}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text className="font-body text-sm text-brun-muted text-center mt-10">
            Aucun dossier pour l'instant.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
