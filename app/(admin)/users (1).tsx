import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useAdminUsers } from '../../hooks/useAdminUsers';

const API_BASE_URL = 'http://12.0.3.9:8000';

export default function UsersPage() {
  const { users, loading, error, fetchUsers, toggleUserActive } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // ✅ Charger les utilisateurs au montage
  useEffect(() => {
    console.log('[USERS PAGE] Montage - appel fetchUsers');
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (userId: number, currentStatus: boolean) => {
    try {
      console.log(`[USERS PAGE] Toggle user ${userId} -> ${!currentStatus}`);
      setTogglingId(userId);

      await toggleUserActive(userId, !currentStatus);

      Alert.alert(
        'Succès',
        `Utilisateur ${!currentStatus ? 'bloqué' : 'débloqué'} avec succès`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('[USERS PAGE] Error:', message);
      Alert.alert('Erreur', `Mise à jour impossible: ${message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 pt-4 pb-2">
        <Text className="font-heading text-2xl text-brun mb-4">Utilisateurs</Text>

        {/* SEARCH */}
        <TextInput
          placeholder="Nom ou email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="w-full px-4 py-3 bg-brun-light rounded-full font-body text-sm border border-brun-muted"
          placeholderTextColor="#999"
        />
      </View>

      {/* CONTENT */}
      <ScrollView className="flex-1 px-4 py-4">
        {loading && (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#d4542d" />
            <Text className="font-body text-sm text-brun mt-2">Chargement...</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
            <Text className="font-body text-sm text-red-600">{error}</Text>
          </View>
        )}

        {!loading && filteredUsers.length === 0 && (
          <View className="items-center justify-center py-10">
            <Text className="font-body text-sm text-brun-muted">
              {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucune correspondance'}
            </Text>
          </View>
        )}

        {/* USER LIST */}
        {filteredUsers.map((user) => (
          <View
            key={user.id}
            className="bg-brun-light rounded-xl p-4 mb-3 border border-brun-muted"
          >
            {/* USER INFO */}
            <View className="flex-row items-start mb-3">
              {/* AVATAR */}
              <View className="w-12 h-12 rounded-full bg-jaune items-center justify-center mr-3">
                <Text className="font-heading text-lg text-white">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* NAME + EMAIL */}
              <View className="flex-1">
                <Text className="font-body-semibold text-sm text-brun">{user.name}</Text>
                <Text className="font-body text-xs text-brun-muted">{user.email}</Text>
                {user.phone && (
                  <Text className="font-body text-xs text-brun-muted mt-1">📱 {user.phone}</Text>
                )}
              </View>

              {/* STATUS BADGE */}
              <View
                className={`px-3 py-1 rounded-full ${
                  user.is_active
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                <Text
                  className={`font-body text-xs font-semibold ${
                    user.is_active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {user.is_active ? 'Actif' : 'Bloqué'}
                </Text>
              </View>
            </View>

            {/* ROLES */}
            <View className="mb-3">
              <Text className="font-body text-xs text-brun-muted mb-1">Rôles:</Text>
              <View className="flex-row flex-wrap gap-2">
                {user.roles.split(',').map((role, idx) => (
                  <View key={idx} className="bg-jaune rounded px-2 py-1">
                    <Text className="font-body text-xs text-white">{role.trim()}</Text>
                  </View>
                ))}
                {user.is_admin && (
                  <View className="bg-red-500 rounded px-2 py-1">
                    <Text className="font-body text-xs text-white">👑 Admin</Text>
                  </View>
                )}
              </View>
            </View>

            {/* BUTTON */}
            <Pressable
              onPress={() => handleToggle(user.id, user.is_active)}
              disabled={togglingId === user.id}
              className={`py-3 rounded-lg items-center justify-center ${
                user.is_active
                  ? 'bg-red-600'
                  : 'bg-green-600'
              } ${togglingId === user.id ? 'opacity-50' : ''}`}
            >
              {togglingId === user.id ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="font-body-semibold text-white text-sm">
                  {user.is_active ? '🔒 Bloquer' : '🔓 Débloquer'}
                </Text>
              )}
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* STATS FOOTER */}
      {!loading && users.length > 0 && (
        <View className="px-4 py-3 bg-brun-light border-t border-brun-muted">
          <Text className="font-body text-xs text-brun-muted text-center">
            {filteredUsers.length} / {users.length} utilisateurs
          </Text>
        </View>
      )}
    </View>
  );
}
