import React, { useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAdminDriverRequests } from "../../hooks/useAdminDriverRequests";

export default function DriverRequestsPage() {
  const { requests, loading, error, approveDriver, rejectDriver } = useAdminDriverRequests();
  const [updating, setUpdating] = useState<number | null>(null);

  const handleApprove = (id: number, name: string) => {
    Alert.alert(
      'Confirmer',
      `Approuver ${name} en tant que conducteur?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: async () => {
            try {
              setUpdating(id);
              await approveDriver(id);
              Alert.alert('Succès', 'Conducteur approuvé');
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
        <Text className="font-display-bold text-brun text-xl">Demandes conducteur</Text>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D85A30" />
        </View>
      )}

      {error && (
        <View className="mx-6 mt-4 bg-danger-50 border border-danger-200 rounded-2xl p-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle" size={16} color="#D8453C" />
            <Text className="font-body text-danger-600 text-xs flex-1">{error}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View className="bg-white border border-brun/10 rounded-2xl p-4">
            <View className="flex-row items-start gap-3 mb-3">
              {item.photo_url ? (
                <Image
                  source={{ uri: item.photo_url }}
                  className="w-12 h-12 rounded-full bg-teal-50"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center">
                  <Ionicons name="person" size={20} color="#0F6E56" />
                </View>
              )}

              <View className="flex-1">
                <Text className="font-body-semibold text-sm text-brun">
                  {item.name}
                </Text>
                <Text className="font-body text-xs text-brun-muted">
                  {item.email}
                </Text>
                {item.phone && (
                  <Text className="font-body text-xs text-brun-muted mt-1">
                    📞 {item.phone}
                  </Text>
                )}
              </View>
            </View>

            <View className="bg-brun/5 rounded-lg p-2 mb-3">
              <Text className="font-body text-xs text-brun-muted">
                Demande soumise le {new Date(item.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>

            {/* ACTIONS */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleReject(item.id, item.name)}
                disabled={updating === item.id}
                className="flex-1 border border-danger-400 rounded-lg py-2 items-center active:opacity-70"
                style={{ opacity: updating === item.id ? 0.5 : 1 }}
              >
                {updating === item.id ? (
                  <ActivityIndicator size="small" color="#D8453C" />
                ) : (
                  <Text className="font-body-semibold text-xs text-danger-600">Refuser</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => handleApprove(item.id, item.name)}
                disabled={updating === item.id}
                className="flex-1 bg-success-600 rounded-lg py-2 items-center active:opacity-70"
                style={{ opacity: updating === item.id ? 0.5 : 1 }}
              >
                {updating === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="font-body-semibold text-xs text-white">Approuver</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="font-body text-sm text-brun-muted text-center mt-10">
            Aucune demande en attente.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
