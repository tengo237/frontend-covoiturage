import React, { useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAdminDriverRequests } from "../../../hooks/useAdminDriverRequests";

export default function DriverApplicationsPage() {
  const { requests, loading, error, approveDriver, rejectDriver } = useAdminDriverRequests();
  const [updating, setUpdating] = useState<number | null>(null);

  const handleApprove = (id: number, name: string) => {
    Alert.alert(
      'Confirmer',
      `Approuver le véhicule de ${name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: async () => {
            try {
              setUpdating(id);
              await approveDriver(id);
              Alert.alert('Succès', 'Conducteur approuvé - Il peut maintenant publier des trajets!');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible d\'approuver');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (id: number, name: string) => {
    Alert.alert(
      'Confirmer',
      `Refuser la demande de ${name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(id);
              await rejectDriver(id, 'Refusé par l\'administrateur');
              Alert.alert('Succès', 'Demande refusée');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de refuser');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>
        <Text className="font-display-bold text-brun text-xl">Dossiers conducteur</Text>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D85A30" />
          <Text className="font-body text-brun-muted text-sm mt-3">
            Chargement des demandes...
          </Text>
        </View>
      )}

      {error && (
        <View className="mx-6 mt-4 bg-danger-50 border border-danger-200 rounded-2xl p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle" size={18} color="#D8453C" />
            <Text className="font-body text-danger-600 text-xs flex-1">{error}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View className="bg-white border border-brun/10 rounded-2xl p-4">
            {/* HEADER AVEC PHOTO */}
            <View className="flex-row items-start gap-3 mb-3">
              {item.vehicle_photo_url ? (
                <Image
                  source={{ uri: `http://12.0.0.59:8000${item.vehicle_photo_url}` }}
                  className="w-14 h-14 rounded-lg bg-brun/10"
                />
              ) : (
                <View className="w-14 h-14 rounded-lg bg-brun/10 items-center justify-center">
                  <Ionicons name="car" size={24} color="#D85A30" />
                </View>
              )}

              <View className="flex-1">
                {/* NOM DU CONDUCTEUR */}
                <Text className="font-display-semibold text-sm text-brun">
                  {item.driver_name}
                </Text>
                
                {/* EMAIL */}
                <Text className="font-body text-xs text-brun-muted mt-1">
                  {item.driver_email}
                </Text>

                {/* INFO VÉHICULE */}
                <View className="mt-2 bg-brun/5 rounded px-2 py-1">
                  <Text className="font-body-semibold text-xs text-brun">
                    {item.brand} {item.model}
                  </Text>
                  <Text className="font-body text-xs text-brun-muted">
                    📋 {item.plate}
                  </Text>
                </View>
              </View>

              <View className="items-center">
                <Ionicons name="car-outline" size={24} color="#D85A30" />
                <Text className="font-body text-xs text-brun-muted mt-1">
                  {item.is_verified ? '✅' : '⏳'}
                </Text>
              </View>
            </View>

            {/* DOCUMENTS SOUMIS */}
            <View className="bg-brun/5 rounded-lg p-3 mb-4">
              <Text className="font-body-semibold text-xs text-brun mb-2">
                📄 Documents soumis:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {item.vehicle_photo_url && (
                  <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded">
                    <Ionicons name="car-outline" size={12} color="#D85A30" />
                    <Text className="font-body text-xs text-brun">Véhicule</Text>
                  </View>
                )}
                {item.id_doc_url && (
                  <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded">
                    <Ionicons name="card-outline" size={12} color="#D85A30" />
                    <Text className="font-body text-xs text-brun">CNI</Text>
                  </View>
                )}
                {item.registration_doc_url && (
                  <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded">
                    <Ionicons name="document-outline" size={12} color="#D85A30" />
                    <Text className="font-body text-xs text-brun">Permis</Text>
                  </View>
                )}
                {item.selfie_url && (
                  <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded">
                    <Ionicons name="person-outline" size={12} color="#D85A30" />
                    <Text className="font-body text-xs text-brun">Selfie</Text>
                  </View>
                )}
              </View>
            </View>

            {/* INFO DATE */}
            <View className="bg-brun/5 rounded-lg p-3 mb-4">
              <Text className="font-body text-xs text-brun-muted">
                📅 Dossier soumis le {new Date(item.created_at).toLocaleDateString('fr-FR')}
              </Text>
              <Text className="font-body text-xs text-brun-muted mt-1">
                Statut: {item.is_verified ? '✅ Validé' : '⏳ En attente'}
              </Text>
            </View>

            {/* ACTIONS - Seulement si pas encore vérifié */}
            {!item.is_verified && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleReject(item.id, item.driver_name)}
                  disabled={updating === item.id}
                  className="flex-1 border-2 border-danger-400 rounded-lg py-3 items-center active:opacity-70"
                  style={{ opacity: updating === item.id ? 0.5 : 1 }}
                >
                  {updating === item.id ? (
                    <ActivityIndicator size="small" color="#D8453C" />
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="close-outline" size={16} color="#D8453C" />
                      <Text className="font-body-semibold text-xs text-danger-600">Refuser</Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => handleApprove(item.id, item.driver_name)}
                  disabled={updating === item.id}
                  className="flex-1 bg-success-600 rounded-lg py-3 items-center active:opacity-70"
                  style={{ opacity: updating === item.id ? 0.5 : 1 }}
                >
                  {updating === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="checkmark-outline" size={16} color="#fff" />
                      <Text className="font-body-semibold text-xs text-white">Valider</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {/* MESSAGE SI VALIDÉ */}
            {item.is_verified && (
              <View className="bg-success-50 rounded-lg p-3 flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#0F6E56" />
                <Text className="font-body-medium text-xs text-success-600 flex-1">
                  Conducteur validé - Peut publier des trajets
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="checkmark-done-outline" size={48} color="#0F6E56" />
              <Text className="font-body-semibold text-sm text-brun mt-4">
                Aucune demande en attente
              </Text>
              <Text className="font-body text-xs text-brun-muted mt-2">
                Tous les conducteurs sont traités ✅
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
