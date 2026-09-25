import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AnimatedPressable from "../../../components/AnimatedPressable";
import { useAdminApplications } from "../../../hooks/useAdminApplications";

export default function DriverApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applications, updateStatus } = useAdminApplications();
  const [status, setStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const application = applications.find(app => app.id.toString() === id);

  useEffect(() => {
    if (application) {
      setStatus(application.status);
    }
  }, [application]);

  if (!application) {
    return (
      <SafeAreaView className="flex-1 bg-creme items-center justify-center">
        <ActivityIndicator size="large" color="#D85A30" />
      </SafeAreaView>
    );
  }

  const handleDecision = (decision: string) => {
    const label = decision === "approved" ? "valider" : "refuser";
    Alert.alert(
      `Confirmer`,
      `Voulez-vous vraiment ${label} ce dossier?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          style: decision === "rejected" ? "destructive" : "default",
          onPress: async () => {
            try {
              setUpdating(true);
              await updateStatus(application.id, decision);
              setStatus(decision);
            } catch (err) {
              Alert.alert("Erreur", "Impossible de mettre à jour le dossier");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const submittedDate = new Date(application.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView className="px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-6" hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>

        <Text className="font-display-bold text-brun text-2xl mb-1">
          Dossier #{application.id}
        </Text>
        <Text className="font-body text-brun-muted text-sm mb-6">
          Soumis le {submittedDate}
        </Text>

        {/* INFO PASSAGER */}
        <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-4">
          <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Passager</Text>
          <Text className="font-body text-sm text-brun mb-0.5">
            ID Passager: {application.passenger_id}
          </Text>
          <Text className="font-body text-sm text-brun-muted">
            {application.seats_booked} place{application.seats_booked > 1 ? 's' : ''} réservée{application.seats_booked > 1 ? 's' : ''}
          </Text>
        </View>

        {/* INFO TRAJET */}
        <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-4">
          <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Trajet</Text>
          <Text className="font-body text-sm text-brun mb-0.5">
            Trajet #{application.trip_id}
          </Text>
          <Text className="font-body text-sm text-brun-muted">
            Prix total: {application.total_price}€
          </Text>
        </View>

        {/* STATUT ACTUEL */}
        <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-6">
          <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Statut actuel</Text>
          <View className="flex-row items-center gap-2">
            <View className={`w-3 h-3 rounded-full ${
              status === 'pending' ? 'bg-[#8A6A00]' :
              status === 'approved' ? 'bg-success-600' :
              'bg-danger-600'
            }`} />
            <Text className={`font-body-semibold text-sm ${
              status === 'pending' ? 'text-[#8A6A00]' :
              status === 'approved' ? 'text-success-600' :
              'text-danger-600'
            }`}>
              {status === 'pending' ? 'En attente' :
               status === 'approved' ? 'Validé' :
               'Refusé'}
            </Text>
          </View>
        </View>

        {/* DOCUMENTS */}
        <Text className="font-body-semibold text-sm text-brun mb-3">
          Documents (à demander si nécessaire)
        </Text>
        <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
          <View className="items-center">
            <View className="w-24 h-24 rounded-2xl bg-brun/5 items-center justify-center mb-2">
              <Ionicons name="car-outline" size={40} color="#D85A30" />
            </View>
            <Text className="font-body text-[11px] text-brun-muted text-center">Véhicule</Text>
          </View>
          <View className="items-center">
            <View className="w-24 h-24 rounded-2xl bg-brun/5 items-center justify-center mb-2">
              <Ionicons name="document-outline" size={40} color="#D85A30" />
            </View>
            <Text className="font-body text-[11px] text-brun-muted text-center">Permis</Text>
          </View>
          <View className="items-center">
            <View className="w-24 h-24 rounded-2xl bg-brun/5 items-center justify-center mb-2">
              <Ionicons name="card-outline" size={40} color="#D85A30" />
            </View>
            <Text className="font-body text-[11px] text-brun-muted text-center">CNI</Text>
          </View>
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-brun/5 items-center justify-center mb-2">
              <Ionicons name="person-outline" size={40} color="#D85A30" />
            </View>
            <Text className="font-body text-[11px] text-brun-muted text-center">Selfie</Text>
          </View>
        </View>

        {/* ACTIONS */}
        {status === "pending" && (
          <View className="flex-row mb-10" style={{ gap: 12 }}>
            <Pressable
              onPress={() => handleDecision("rejected")}
              disabled={updating}
              className="flex-1 border border-danger-400 rounded-2xl py-4 items-center active:opacity-70"
              style={{ opacity: updating ? 0.5 : 1 }}
            >
              <Text className="font-body-semibold text-sm text-danger-600">Refuser</Text>
            </Pressable>
            <AnimatedPressable
              onPress={() => handleDecision("approved")}
              disabled={updating}
              className="flex-1 bg-teal-600 rounded-2xl py-4 items-center"
              style={{ opacity: updating ? 0.5 : 1 }}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="font-body-semibold text-sm text-creme">Valider</Text>
              )}
            </AnimatedPressable>
          </View>
        )}

        {status === "approved" && (
          <View className="bg-success-50 rounded-2xl p-4 mb-10 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#0F6E56" />
            <Text className="font-body-medium text-sm text-success-600 ml-2">
              Dossier validé — le passager a été notifié.
            </Text>
          </View>
        )}

        {status === "rejected" && (
          <View className="bg-danger-50 rounded-2xl p-4 mb-10 flex-row items-center">
            <Ionicons name="close-circle" size={20} color="#D8453C" />
            <Text className="font-body-medium text-sm text-danger-600 ml-2">
              Dossier refusé — le passager a été notifié.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
