import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '../../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/300?text=Pas+de+photo';
  if (url.includes('12.0.13.180')) {
    return url.replace('12.0.13.180', '12.0.3.9');
  }
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const formatPrice = (price: number) => {
  if (!price) return '0 CFA';
  return `${Math.round(price).toLocaleString('fr-CM')} CFA`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function TripDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useUser();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [isReserved, setIsReserved] = useState(false);

  useEffect(() => {
    if (id && token) {
      loadTripDetail();
    }
  }, [id, token]);

  const loadTripDetail = async () => {
    try {
      setLoading(true);

      // Charger les détails du trajet
      const tripResponse = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!tripResponse.ok) throw new Error('Trajet non trouvé');
      const tripData = await tripResponse.json();
      setTrip(tripData.trip || tripData);

      // Vérifier si déjà réservé
      const reservationsResponse = await fetch(`${API_BASE_URL}/api/reservations/my-reservations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        const reserved = (reservationsData.reservations || []).some(
          (r: any) => r.trip_id === parseInt(id as string)
        );
        setIsReserved(reserved);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger le trajet');
    } finally {
      setLoading(false);
    }
  };

  const handleReserver = async () => {
    try {
      setReserving(true);

      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip_id: parseInt(id as string),
          number_of_seats: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur réservation');
      }

      Alert.alert('✅ Succès!', 'Votre réservation a été confirmée', [
        {
          text: 'Voir mes réservations',
          onPress: () => router.push('/(tabs)/mes-reservations'),
        },
        {
          text: 'Retour',
          onPress: () => router.back(),
        },
      ]);

      setIsReserved(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur';
      Alert.alert('❌ Erreur', message);
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D85A30" />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>Trajet non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER + BACK BUTTON */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#1f2937" />
          </Pressable>
        </View>

        {/* IMAGE VÉHICULE - GRANDE */}
        <View style={{ position: 'relative', marginBottom: 16 }}>
          <Image
            source={{ uri: getImageUrl(trip.vehicle?.photo_url) }}
            style={{ width: '100%', height: 300, backgroundColor: '#e5e7eb' }}
          />

          {/* Badge Places */}
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: '#D85A30',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 24,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="people" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
              {trip.available_seats} places
            </Text>
          </View>

          {/* Badge Déjà réservé */}
          {isReserved && (
            <View
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
                Réservé
              </Text>
            </View>
          )}
        </View>

        {/* CONTENU PRINCIPAL */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* PRIX LARGE */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: '#D85A30' }}>
              {formatPrice(trip.price_per_seat)}
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              par personne
            </Text>
          </View>

          {/* CONDUCTEUR */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: getImageUrl(trip.driver?.photo_url) }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#f0f0f0',
                borderWidth: 2,
                borderColor: '#D85A30',
              }}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                {trip.driver?.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFB800', marginLeft: 4 }}>
                  4.8
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                  (24 avis)
                </Text>
              </View>
            </View>
          </View>

          {/* INFOS TRAJET */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
              📍 Détails du trajet
            </Text>

            {/* Timeline Trajet */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', marginRight: 14 }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#D85A30',
                    }}
                  />
                  <View
                    style={{
                      width: 2,
                      height: 60,
                      backgroundColor: '#E8D5C4',
                      marginVertical: 6,
                    }}
                  />
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#378ADD',
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ marginBottom: 60 }}>
                    <Text style={{ fontSize: 10, color: '#9ca3af', fontWeight: '600' }}>
                      DÉPART
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#1f2937',
                        marginTop: 4,
                      }}
                    >
                      {trip.departure_location}
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontSize: 10, color: '#9ca3af', fontWeight: '600' }}>
                      ARRIVÉE
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#1f2937',
                        marginTop: 4,
                      }}
                    >
                      {trip.arrival_location}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* INFOS SUPPLÉMENTAIRES */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
              ℹ️ Informations
            </Text>

            {/* Grille 2x2 */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="calendar-outline" size={24} color="#378ADD" />
                <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, fontWeight: '600' }}>
                  Date
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                  {formatDateTime(trip.departure_time)}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
                <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, fontWeight: '600' }}>
                  Heure
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                  {formatTime(trip.departure_time)}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="car-outline" size={24} color="#10b981" />
                <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, fontWeight: '600' }}>
                  Véhicule
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                  {trip.vehicle?.brand} {trip.vehicle?.model}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="color-palette-outline" size={24} color="#EC4899" />
                <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, fontWeight: '600' }}>
                  Couleur
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                  {trip.vehicle?.color}
                </Text>
              </View>
            </View>
          </View>

          {/* DESCRIPTION */}
          {trip.description && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
                📝 Description
              </Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
                <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 20 }}>
                  {trip.description}
                </Text>
              </View>
            </View>
          )}

          {/* BOUTON RÉSERVER */}
          <TouchableOpacity
            onPress={handleReserver}
            disabled={reserving || isReserved}
            style={{
              backgroundColor: isReserved ? '#d1d5db' : '#D85A30',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 30,
              opacity: reserving || isReserved ? 0.7 : 1,
            }}
          >
            {reserving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                  Réservation en cours...
                </Text>
              </>
            ) : isReserved ? (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#6b7280" />
                <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                  ✅ Vous avez réservé
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                  Réserver ce trajet
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
