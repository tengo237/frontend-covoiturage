import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAdminUsers } from "../../hooks/useAdminUsers";

export default function UsersPage() {
  const { users, loading, error, fetchUsers, toggleUserActive } = useAdminUsers();
  const [searchText, setSearchText] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  // ✅ Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchText.toLowerCase()) ||
    u.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggleActive = async (id: number, currentStatus: boolean, name: string) => {
    Alert.alert(
      'Confirmer',
      `${currentStatus ? 'Bloquer' : 'Débloquer'} ${name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: currentStatus ? 'Bloquer' : 'Débloquer',
          style: currentStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setUpdating(id);
              // ✅ Utiliser toggleUserActive de notre hook
              await toggleUserActive(id, !currentStatus);
              Alert.alert('Succès', `${name} ${!currentStatus ? 'bloqué' : 'débloqué'}`);
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Erreur inconnue';
              Alert.alert('Erreur', `Impossible de mettre à jour: ${message}`);
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>
        <Text className="font-heading text-2xl text-brun">Utilisateurs</Text>
      </View>

      {/* SEARCH */}
      <View className="px-6 pt-3 pb-2">
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2">
          <Ionicons name="search-outline" size={18} color="#8C7A6B" />
          <TextInput
            placeholder="Nom ou email..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-2 font-body text-sm text-brun"
            placeholderTextColor="#8C7A6B"
          />
        </View>
      </View>

      {/* LOADING */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d4542d" />
        </View>
      )}

      {/* ERROR */}
      {error && (
        <View className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <Text className="font-body text-red-600 text-xs">{error}</Text>
        </View>
      )}

      {/* USER LIST */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View className="bg-white border border-gray-200 rounded-xl p-4">
            {/* TOP - NAME + ADMIN BADGE + STATUS */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                {/* AVATAR */}
                <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                  <Text className="font-heading text-teal-600">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* NAME + EMAIL */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-body-semibold text-sm text-brun flex-1">
                      {item.name}
                    </Text>
                    {item.is_admin && (
                      <View className="bg-purple-100 px-2 py-0.5 rounded">
                        <Text className="font-body text-[9px] text-purple-600 font-semibold">
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-body text-xs text-gray-600">
                    {item.email}
                  </Text>
                </View>
              </View>

              {/* STATUS BADGE */}
              <View
                className={`px-2 py-1 rounded-full ml-2 ${
                  item.is_active ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <Text
                  className={`font-body text-xs font-semibold ${
                    item.is_active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.is_active ? 'Actif' : 'Bloqué'}
                </Text>
              </View>
            </View>

            {/* PHONE */}
            {item.phone && (
              <Text className="font-body text-xs text-gray-500 mb-3">
                📞 {item.phone}
              </Text>
            )}

            {/* ROLES */}
            <View className="flex-row gap-2 mb-3">
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="font-body text-[9px] text-blue-600 font-semibold">
                  {item.roles || 'N/A'}
                </Text>
              </View>
            </View>

            {/* BUTTON */}
            <Pressable
              onPress={() => handleToggleActive(item.id, item.is_active, item.name)}
              disabled={updating === item.id}
              className={`flex-row items-center justify-center rounded-lg py-2.5 gap-1 ${
                item.is_active ? 'bg-red-600' : 'bg-green-600'
              } active:opacity-70`}
              style={{ opacity: updating === item.id ? 0.6 : 1 }}
            >
              {updating === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={item.is_active ? "lock-closed-outline" : "lock-open-outline"}
                    size={14}
                    color="#fff"
                  />
                  <Text className="font-body-semibold text-xs text-white">
                    {item.is_active ? 'Bloquer' : 'Débloquer'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className="font-body text-sm text-gray-500 text-center mt-10">
            {filteredUsers.length === 0 && users.length > 0
              ? 'Aucun utilisateur trouvé.'
              : 'Aucun utilisateur disponible.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
