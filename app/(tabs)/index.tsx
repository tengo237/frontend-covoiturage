import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '../../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

// ✅ CORRECTION IP
const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/200?text=Pas+de+photo';
  
  if (url.includes('12.0.13.180')) {
    return url.replace('12.0.13.180', '12.0.3.9');
  }
  
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// ✅ FORMAT PRIX EN CFA
const formatPrice = (price: number) => {
  if (!price) return '0 CFA';
  return `${Math.round(price).toLocaleString('fr-CM')} CFA`;
};

export default function Accueil() {
  const router = useRouter();
  const { user, token } = useUser();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ CHARGER AU MOUNT
  useEffect(() => {
    if (token) {
      console.log('🔵 Début chargement...');
      loadTrips();
    }
  }, [token]);

  // ✅ RECHARGER QUAND ON REVIENT SUR LA PAGE
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Retour sur Accueil - Recharger les données...');
      if (token) {
        loadTrips();
      }
    }, [token])
  );

  // ✅ CHARGER LES TRAJETS
  const loadTrips = async () => {
    try {
      setLoading(true);

      console.log('📍 Chargement trajets...');
      const tripsResponse = await fetch(`${API_BASE_URL}/api/trips/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!tripsResponse.ok) throw new Error('Erreur trajets');
      const tripsData = await tripsResponse.json();
      console.log('✅ Trajets:', tripsData.trips?.length || 0);
      setTrips(tripsData.trips || []);
    } catch (error) {
      console.error('❌ Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const renderTrip = ({ item }: any) => {
    return (
      // ✅ NAVIGATION VERS /trip/[id]
      <TouchableOpacity
        onPress={() => router.push(`/trip/${item.id}`)}
        activeOpacity={0.9}
        style={{
          marginBottom: 16,
          marginHorizontal: 12,
          backgroundColor: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        {/* Image Véhicule */}
        <View style={{ position: 'relative' }}>
          {item.vehicle?.photo_url ? (
            <Image
              source={{ uri: getImageUrl(item.vehicle.photo_url) }}
              style={{ width: '100%', height: 200, backgroundColor: '#e5e7eb' }}
              onError={() => console.log('[ACCUEIL] Erreur photo')}
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 200,
                backgroundColor: '#e5e7eb',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="car-sport" size={48} color="#9ca3af" />
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
                Photo indisponible
              </Text>
            </View>
          )}

          {/* Badge Places */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: '#D85A30',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="people" size={14} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
              {item.available_seats} places
            </Text>
          </View>

          {/* Prix Badge - EN CFA */}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: '#fff',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#D85A30' }}>
              {formatPrice(item.price_per_seat)}
            </Text>
            <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
              /personne
            </Text>
          </View>
        </View>

        {/* Infos Conducteur */}
        <View style={{ padding: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
            }}
          >
            <Image
              source={{ uri: getImageUrl(item.driver?.photo_url) }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#f0f0f0',
                borderWidth: 2,
                borderColor: '#D85A30',
              }}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937' }}>
                {item.driver?.name || 'Conducteur'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFB800', marginLeft: 4 }}>
                  4.8
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline Trajet */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ alignItems: 'center', marginRight: 12 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#D85A30',
                  }}
                />
                <View
                  style={{
                    width: 2,
                    height: 40,
                    backgroundColor: '#E8D5C4',
                    marginVertical: 4,
                  }}
                />
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#378ADD',
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 40 }}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                    DÉPART
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#1f2937',
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.departure_location}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                    ARRIVÉE
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#1f2937',
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.arrival_location}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Infos Rapides */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: '#F0F9FF',
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 10,
                marginRight: 6,
                alignItems: 'center',
              }}
            >
              <Ionicons name="calendar" size={16} color="#378ADD" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#378ADD', marginTop: 4 }}>
                {item.departure_time?.split(' ')[0] || 'N/A'}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF5E6',
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 10,
                marginRight: 6,
                alignItems: 'center',
              }}
            >
              <Ionicons name="time" size={16} color="#F59E0B" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#F59E0B', marginTop: 4 }}>
                {item.departure_time?.split(' ')[1] || 'N/A'}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#F0FDF4',
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#10b981', marginTop: 4 }}>
                Actif
              </Text>
            </View>
          </View>

          {/* Bouton */}
          <View
            style={{
              backgroundColor: '#D85A30',
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              borderRadius: 12,
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
              Voir les détails
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && trips.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FBF6EF',
        }}
      >
        <ActivityIndicator size="large" color="#D85A30" />
        <Text style={{ marginTop: 16, color: '#9ca3af', fontSize: 14 }}>
          Chargement des trajets...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      {/* Header SIMPLE */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>
          Bonjour! 👋
        </Text>
        <Text style={{ fontSize: 14, color: '#9ca3af' }}>
          {trips.length} trajet{trips.length > 1 ? 's' : ''} disponible{trips.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* FLATLIST - TRAJETS SEULEMENT */}
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="search-outline" size={56} color="#D1D5DB" />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#6b7280', marginTop: 16 }}>
              Aucun trajet trouvé
            </Text>
          </View>
        }
      />
    </View>
  );
}
