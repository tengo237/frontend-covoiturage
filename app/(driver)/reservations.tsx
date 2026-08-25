import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  MY_PUBLISHED_TRIPS,
  updateRequestStatus,
  ReservationStatus,
} from "../../lib/driverTrips";

const STATUS_STYLE: Record<ReservationStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-[#FDF3D9]", text: "text-[#8A6A00]", label: "En attente" },
  accepted: { bg: "bg-success-50", text: "text-success-600", label: "Acceptée" },
  declined: { bg: "bg-danger-50", text: "text-danger-600", label: "Refusée" },
};

export default function DriverReservations() {
  const [, forceRerender] = useState(0);

  const allRequests = MY_PUBLISHED_TRIPS.flatMap((trip) =>
    trip.requests.map((req) => ({ ...req, trip }))
  ).sort((a, b) => (a.status === "pending" ? -1 : 1));

  const handleDecision = (tripId: string, requestId: string, status: ReservationStatus) => {
    updateRequestStatus(tripId, requestId, status);
    forceRerender((n) => n + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <Text className="font-display-bold text-brun text-2xl mb-1">Réservations</Text>
        <Text className="font-body text-brun-muted text-sm mb-6">
          Toutes les demandes reçues sur vos trajets
        </Text>

        {allRequests.length === 0 && (
          <Text className="font-body text-sm text-brun-muted text-center mt-10">
            Aucune demande de réservation pour l'instant.
          </Text>
        )}

        {allRequests.map((req) => {
          const style = STATUS_STYLE[req.status];
          return (
            <View key={req.id} className="bg-white border border-brun/10 rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                    <Ionicons name="person-outline" size={18} color="#0F6E56" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-semibold text-sm text-brun">{req.passengerName}</Text>
                    <Text className="font-body text-xs text-brun-muted">
                      {req.trip.from} → {req.trip.to} · {req.seats} place{req.seats > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <View className={`px-2 py-1 rounded-full ${style.bg}`}>
                  <Text className={`font-body-medium text-[11px] ${style.text}`}>{style.label}</Text>
                </View>
              </View>

              {req.status === "pending" && (
                <View className="flex-row mt-3" style={{ gap: 10 }}>
                  <Pressable
                    onPress={() => handleDecision(req.trip.id, req.id, "declined")}
                    className="flex-1 border border-brun/15 rounded-xl py-2.5 items-center active:opacity-70"
                  >
                    <Text className="font-body-medium text-sm text-brun-muted">Refuser</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDecision(req.trip.id, req.id, "accepted")}
                    className="flex-1 bg-teal-600 rounded-xl py-2.5 items-center active:opacity-80"
                  >
                    <Text className="font-body-medium text-sm text-creme">Accepter</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
