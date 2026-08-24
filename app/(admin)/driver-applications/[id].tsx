import React, { useState } from "react";
import { View, Text, Pressable, Image, ScrollView, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AnimatedPressable from "../../../components/AnimatedPressable";
import { getApplicationById, updateApplicationStatus, ApplicationStatus } from "../../../lib/driverApplications";

export default function DriverApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const application = getApplicationById(id);
  const [status, setStatus] = useState<ApplicationStatus | undefined>(application?.status);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (!application) return null;

  const handleDecision = (decision: ApplicationStatus) => {
    const label = decision === "approved" ? "valider" : "refuser";
    Alert.alert(
      `Confirmer`,
      `Voulez-vous vraiment ${label} le dossier de ${application.applicantName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          style: decision === "rejected" ? "destructive" : "default",
          onPress: () => {
            updateApplicationStatus(application.id, decision);
            setStatus(decision);
            // TODO: notifier le conducteur (push/email) une fois le backend branché.
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4">
        <View className={`w-full ${isTablet ? "max-w-xl self-center" : ""}`}>
          <Pressable onPress={() => router.back()} className="mb-6" hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
          </Pressable>

          <Text className="font-display-bold text-brun text-2xl mb-1">
            {application.applicantName}
          </Text>
          <Text className="font-body text-brun-muted text-sm mb-6">
            Soumis le {application.submittedAt}
          </Text>

          <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-4">
            <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Véhicule</Text>
            <Text className="font-body text-sm text-brun mb-0.5">
              {application.vehicle.brand} {application.vehicle.model} — {application.vehicle.color}
            </Text>
            <Text className="font-body text-sm text-brun-muted">
              {application.vehicle.plate} · {application.vehicle.seats} places
            </Text>
          </View>

          <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-4">
            <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Permis</Text>
            <Text className="font-body text-sm text-brun">{application.licenseNumber}</Text>
          </View>

          <Text className="font-body-semibold text-sm text-brun mb-3">Documents fournis</Text>
          <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
            <View>
              <Image source={{ uri: application.vehiclePhoto }} style={{ width: 100, height: 100, borderRadius: 14 }} />
              <Text className="font-body text-[11px] text-brun-muted text-center mt-1">Véhicule</Text>
            </View>
            <View>
              <Image source={{ uri: application.licensePhoto }} style={{ width: 100, height: 100, borderRadius: 14 }} />
              <Text className="font-body text-[11px] text-brun-muted text-center mt-1">Permis</Text>
            </View>
            <View>
              <Image source={{ uri: application.idCardPhoto }} style={{ width: 100, height: 100, borderRadius: 14 }} />
              <Text className="font-body text-[11px] text-brun-muted text-center mt-1">CNI</Text>
            </View>
            <View>
              <Image source={{ uri: application.facePhoto }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              <Text className="font-body text-[11px] text-brun-muted text-center mt-1">Selfie</Text>
            </View>
          </View>

          {status === "pending" && (
            <View className="flex-row mb-10" style={{ gap: 12 }}>
              <Pressable
                onPress={() => handleDecision("rejected")}
                className="flex-1 border border-danger-400 rounded-2xl py-4 items-center active:opacity-70"
              >
                <Text className="font-body-semibold text-sm text-danger-600">Refuser</Text>
              </Pressable>
              <AnimatedPressable
                onPress={() => handleDecision("approved")}
                className="flex-1 bg-teal-600 rounded-2xl py-4 items-center"
              >
                <Text className="font-body-semibold text-sm text-creme">Valider</Text>
              </AnimatedPressable>
            </View>
          )}

          {status === "approved" && (
            <View className="bg-success-50 rounded-2xl p-4 mb-10 flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#0F6E56" />
              <Text className="font-body-medium text-sm text-success-600 ml-2">
                Dossier validé — le conducteur a été notifié.
              </Text>
            </View>
          )}

          {status === "rejected" && (
            <View className="bg-danger-50 rounded-2xl p-4 mb-10 flex-row items-center">
              <Ionicons name="close-circle" size={20} color="#D8453C" />
              <Text className="font-body-medium text-sm text-danger-600 ml-2">
                Dossier refusé — le conducteur a été notifié.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
