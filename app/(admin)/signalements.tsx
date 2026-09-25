import React, { useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAdminSignalements } from "../../hooks/useAdminSignalements";

const STATUS_CONFIG = {
  open: { label: 'Ouvert', color: '#EF4444', bgColor: 'bg-danger-50', icon: 'alert-circle' },
  investigating: { label: 'En enquête', color: '#F59E0B', bgColor: 'bg-warning-50', icon: 'search' },
  resolved: { label: 'Résolu', color: '#10B981', bgColor: 'bg-success-50', icon: 'checkmark-circle' },
  closed: { label: 'Fermé', color: '#8C7A6B', bgColor: 'bg-gray-50', icon: 'close-circle' },
};

const ALERT_TYPES = {
  accident: '🚗 Accident',
  dangerous_driving: '⚠️ Conduite dangereuse',
  speeding: '🚗 Excès de vitesse',
  reckless: '😠 Conduite imprudente',
  other: '📋 Autre',
};

export default function SignalementsPage() {
  const { signalements, loading, error, updateStatus, filterStatus, setFilterStatus } = useAdminSignalements();
  const [updating, setUpdating] = useState<number | null>(null);

  const statuses = ['open', 'investigating', 'resolved', 'closed'];

  const handleStatusChange = (id: number, newStatus: string) => {
    Alert.alert(
      'Confirmer',
      `Mettre à jour le statut en "${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: async () => {
            try {
              setUpdating(id);
              await updateStatus(id, newStatus);
              Alert.alert('Succès', 'Statut mis à jour');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de mettre à jour');
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
      {/* HEADER */}
      <View className="px-6 pt-4 pb-3 border-b border-brun/10">
        <Text className="font-display-bold text-brun text-xl">Signalements</Text>
        <Text className="font-body text-brun-muted text-xs mt-1">
          {signalements.length} alert{signalements.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* FILTER BUTTONS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 py-3">
        <Pressable
          onPress={() => setFilterStatus(null)}
          className={`px-4 py-2 rounded-full mr-2 ${
            filterStatus === null ? 'bg-teal-600' : 'bg-white border border-brun/10'
          }`}
        >
          <Text
            className={`font-body-semibold text-xs ${
              filterStatus === null ? 'text-white' : 'text-brun'
            }`}
          >
            Tous
          </Text>
        </Pressable>

        {statuses.map((status) => (
          <Pressable
            key={status}
            onPress={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full mr-2 ${
              filterStatus === status ? 'bg-teal-600' : 'bg-white border border-brun/10'
            }`}
          >
            <Text
              className={`font-body-semibold text-xs ${
                filterStatus === status ? 'text-white' : 'text-brun'
              }`}
            >
              {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D85A30" />
          <Text className="font-body text-brun-muted text-sm mt-3">
            Chargement des signalements...
          </Text>
        </View>
      )}

      {error && (
        <View className="mx-6 mt-4 bg-danger-50 border border-danger-200 rounded-2xl p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle" size={16} color="#D8453C" />
            <Text className="font-body text-danger-600 text-xs flex-1">{error}</Text>
          </View>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={signalements}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
          const alertLabel = ALERT_TYPES[item.alert_type as keyof typeof ALERT_TYPES] || item.alert_type;

          return (
            <View className={`${statusConfig.bgColor} border-2 rounded-2xl p-4`} style={{ borderColor: statusConfig.color }}>
              {/* HEADER */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="font-body-semibold text-sm text-brun">
                    {alertLabel}
                  </Text>
                  <Text className="font-body text-xs text-brun-muted mt-1">
                    📅 {new Date(item.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View className="px-3 py-1 rounded-full bg-white">
                  <Text
                    className="font-body-semibold text-xs"
                    style={{ color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              {/* DRIVER INFO */}
              {item.driver && (
                <View className="bg-white/50 rounded-lg p-3 mb-3 flex-row items-center gap-3">
                  {item.driver.photo_url ? (
                    <Image
                      source={{ uri: item.driver.photo_url }}
                      className="w-10 h-10 rounded-full bg-brun/10"
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-brun/20 items-center justify-center">
                      <Ionicons name="person" size={16} color="#3D2B1F" />
                    </View>
                  )}

                  <View className="flex-1">
                    <Text className="font-body-semibold text-xs text-brun">
                      {item.driver.name}
                    </Text>
                    <Text className="font-body text-xs text-brun-muted">
                      {item.driver.email}
                    </Text>
                  </View>
                </View>
              )}

              {/* TRIP INFO */}
              {item.trip && (
                <View className="bg-white/50 rounded-lg p-3 mb-3">
                  <View className="flex-row items-start gap-2 mb-2">
                    <Ionicons name="location-outline" size={14} color="#3D2B1F" />
                    <View className="flex-1">
                      <Text className="font-body text-xs text-brun-muted">De:</Text>
                      <Text className="font-body text-xs text-brun">
                        {item.trip.departure_location}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start gap-2">
                    <Ionicons name="location" size={14} color="#D85A30" />
                    <View className="flex-1">
                      <Text className="font-body text-xs text-brun-muted">À:</Text>
                      <Text className="font-body text-xs text-brun">
                        {item.trip.arrival_location}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* LOCATION */}
              <View className="bg-white/50 rounded-lg p-3 mb-3 flex-row items-center gap-2">
                <Ionicons name="map-outline" size={14} color="#3D2B1F" />
                <Text className="font-body text-xs text-brun-muted flex-1">
                  📍 {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                </Text>
              </View>

              {/* STATUS BUTTONS */}
              <View className="gap-2">
                <Text className="font-body-semibold text-xs text-brun mb-1">
                  Changer le statut:
                </Text>
                <View className="flex-row gap-2 flex-wrap">
                  {statuses.map((status) => {
                    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                    const isCurrentStatus = item.status === status;

                    return (
                      <Pressable
                        key={status}
                        onPress={() => handleStatusChange(item.id, status)}
                        disabled={updating === item.id || isCurrentStatus}
                        className={`px-3 py-2 rounded-lg flex-1 min-w-[23%] items-center ${
                          isCurrentStatus
                            ? `bg-white border-2`
                            : 'bg-white border border-brun/10'
                        }`}
                        style={{
                          borderColor: isCurrentStatus ? cfg.color : undefined,
                          opacity: updating === item.id ? 0.5 : 1,
                        }}
                      >
                        {updating === item.id ? (
                          <ActivityIndicator size="small" color={cfg.color} />
                        ) : (
                          <Text
                            className="font-body-semibold text-xs text-center"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="checkmark-circle-outline" size={48} color="#0F6E56" />
              <Text className="font-body-semibold text-sm text-brun mt-4">
                Aucun signalement
              </Text>
              <Text className="font-body text-xs text-brun-muted mt-2">
                {filterStatus ? `Pas de signalement ${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label.toLowerCase()}` : 'Parfait!'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
