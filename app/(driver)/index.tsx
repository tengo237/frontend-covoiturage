import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../../components/AnimatedPressable";
import { MY_PUBLISHED_TRIPS, seatsTaken, pendingCount } from "../../lib/driverTrips";

export default function DriverTrips() {
  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <Text className="font-display-bold text-brun text-2xl mb-1">Mes trajets</Text>
        <Text className="font-body text-brun-muted text-sm mb-6">
          Vos trajets publiés et à venir
        </Text>

        <AnimatedPressable
          onPress={() => router.push("/publish-trip")}
          className="flex-row items-center justify-center bg-terre-600 rounded-2xl py-4 mb-6"
        >
          <Ionicons name="add-circle-outline" size={18} color="#FBF6EF" />
          <Text className="font-body-semibold text-creme text-sm ml-2">
            Publier un nouveau trajet
          </Text>
        </AnimatedPressable>

        {MY_PUBLISHED_TRIPS.length === 0 && (
          <Text className="font-body text-sm text-brun-muted text-center mt-10">
            Vous n'avez encore publié aucun trajet.
          </Text>
        )}

        {MY_PUBLISHED_TRIPS.map((trip) => {
          const taken = seatsTaken(trip);
          const pending = pendingCount(trip);
          return (
            <Pressable
              key={trip.id}
              onPress={() => router.push(`/(driver)/trip/${trip.id}`)}
              className="bg-white border border-brun/10 rounded-2xl p-4 mb-3 active:opacity-70"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-body-semibold text-sm text-brun">
                  {trip.from} → {trip.to}
                </Text>
                {pending > 0 && (
                  <View className="px-2 py-0.5 rounded-full bg-[#FDF3D9]">
                    <Text className="font-body-medium text-[11px] text-[#8A6A00]">
                      {pending} demande{pending > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="font-body text-xs text-brun-muted mb-3">
                {trip.date}, {trip.time}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={14} color="#8C7A6B" />
                  <Text className="font-body text-xs text-brun-muted ml-1.5">
                    {taken} / {trip.seatsTotal} places prises
                  </Text>
                </View>
                <Text className="font-body-semibold text-xs text-terre-600">
                  {trip.price.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
