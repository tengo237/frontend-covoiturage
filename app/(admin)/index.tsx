import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAdminStats } from "../../hooks/useAdminStats";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const { stats, loading, error, refresh } = useAdminStats();

  console.log('[ADMIN DASHBOARD] stats:', stats);
  console.log('[ADMIN DASHBOARD] loading:', loading);
  console.log('[ADMIN DASHBOARD] error:', error);

  // ============================================
  // DONNÉES DYNAMIQUES
  // ============================================
  const dynamicStats = [
    {
      id: 1,
      label: 'Utilisateurs',
      value: stats?.users?.count?.toString() || '0',
      change: stats?.users?.change || '+0',
      icon: 'people-outline',
      color: '#10B981',
      bgColor: 'bg-success-50',
    },
    {
      id: 2,
      label: 'Trajets',
      value: stats?.trips?.count?.toString() || '0',
      change: stats?.trips?.change || '+0',
      icon: 'car-outline',
      color: '#3B82F6',
      bgColor: 'bg-info-50',
    },
    {
      id: 3,
      label: 'Signalements',
      value: stats?.alerts?.count?.toString() || '0',
      change: stats?.alerts?.change || '+0',
      icon: 'flag-outline',
      color: '#EF4444',
      bgColor: 'bg-danger-50',
    },
    {
      id: 4,
      label: 'En attente',
      value: stats?.pending?.count?.toString() || '0',
      change: stats?.pending?.change || '+0',
      icon: 'document-text-outline',
      color: '#F59E0B',
      bgColor: 'bg-[#FDF3D9]',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView showsVerticalScrollIndicator={false} className="px-6 pt-4">
        {/* HEADER */}
        <Text className="font-display-bold text-brun text-2xl mb-1">
          Tableau de bord
        </Text>
        <Text className="font-body text-brun-muted text-sm mb-6">
          Gestion en temps réel
        </Text>

        {/* PERIOD SELECTOR */}
        <View className="flex-row gap-2 mb-6">
          {['today', 'week', 'month'].map((period) => (
            <Pressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl ${
                selectedPeriod === period
                  ? 'bg-teal-600'
                  : 'bg-white border border-brun/10'
              } active:opacity-70`}
            >
              <Text
                className={`font-body-medium text-xs ${
                  selectedPeriod === period
                    ? 'text-white'
                    : 'text-brun'
                }`}
              >
                {period === 'today' ? "Aujourd'hui" : period === 'week' ? 'Semaine' : 'Mois'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* LOADING STATE */}
        {loading && (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#D85A30" />
            <Text className="font-body text-brun-muted text-sm mt-4">
              Chargement des données...
            </Text>
          </View>
        )}

        {/* ERROR STATE */}
        {error && (
          <View className="bg-danger-50 border border-danger-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={20} color="#D8453C" />
              <Text className="font-body text-danger-600 text-sm flex-1">
                Erreur: {error}
              </Text>
            </View>
          </View>
        )}

        {/* STATS CARDS GRID */}
        {stats && (
          <View className="gap-3 mb-6">
            {dynamicStats.map((stat) => (
              <View
                key={stat.id}
                className={`${stat.bgColor} border border-brun/10 rounded-2xl p-4`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-body text-brun-muted text-xs mb-2">
                      {stat.label}
                    </Text>
                    <Text className="font-display-bold text-2xl mb-1" style={{ color: stat.color }}>
                      {stat.value}
                    </Text>
                    <Text className="font-body-medium text-xs" style={{ color: stat.color }}>
                      {stat.change}
                    </Text>
                  </View>
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* QUICK ACTIONS */}
        <Text className="font-body-semibold text-sm text-brun mb-3">
          Actions rapides
        </Text>
        <View className="flex-row gap-2 mb-6">
          <Pressable
            onPress={refresh}
            className="flex-1 bg-white border border-teal-600 rounded-xl py-3 items-center active:opacity-70"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="refresh-outline" size={16} color="#0F6E56" />
              <Text className="font-body-semibold text-xs text-teal-600">
                Rafraîchir
              </Text>
            </View>
          </Pressable>
        </View>

        {/* INFO */}
        <View className="bg-info-50 border border-info-200 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={16} color="#0369A1" />
            <Text className="font-body text-info-600 text-xs flex-1">
              Les données se mettent à jour automatiquement chaque 30 secondes.
            </Text>
          </View>
        </View>

        <View className="pb-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
