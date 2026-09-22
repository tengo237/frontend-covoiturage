import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/100?text=User';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// ✅ FONCTION FORMAT PRIX EN CFA
const formatPrice = (price: number) => {
  if (!price) return '0 CFA';
  return `${Math.round(price).toLocaleString('fr-CM')} CFA`;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return '#10b981';
    case 'pending':
      return '#F59E0B';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6b7280';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    confirmed: 'Confirmee',
    pending: 'En attente',
    cancelled: 'Annulee',
  };
  return labels[status.toLowerCase()] || status;
};

export default function MesReservations() {
  const router = useRouter();
  const { token, user } = useUser();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [sossing, setSossing] = useState<number | null>(null);

  useEffect(() => {
    console.log('[MES-RES] useEffect triggered');
    console.log('[MES-RES] User:', user?.email);
    loadReservations();
  }, [token]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      console.log('\n[MES-RES] Debut chargement');

      if (!token) {
        console.log('[MES-RES] TOKEN EST NULL');
        Alert.alert('Erreur', 'Vous devez etre connecte');
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/reservations/my-reservations`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[MES-RES] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[MES-RES] Reservations chargees:', data.reservations?.length || 0);
      console.log('[MES-RES] Data:', JSON.stringify(data).substring(0, 500));

      setReservations(data.reservations || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('[MES-RES] ERREUR:', message);
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const handleReservationClick = (reservation: any) => {
    console.log('[MES-RES] Clic reservation:', reservation.id);
    
    router.push({
      pathname: '/reservation-map',
      params: {
        reservationId: reservation.id.toString(),
        tripData: JSON.stringify(reservation.trip),
      },
    });
  };

  const handleAnnuler = async (reservationId: number) => {
    Alert.alert(
      'Annuler la reservation',
      'Etes-vous sur?',
      [
        { text: 'Non', onPress: () => {} },
        {
          text: 'Oui, annuler',
          onPress: async () => {
            try {
              setCancelling(reservationId);
              console.log('[MES-RES] Debut annulation:', reservationId);

              const url = `${API_BASE_URL}/api/reservations/${reservationId}/cancel`;
              console.log('[MES-RES] URL:', url);
              
              const response = await fetch(url, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              console.log('[MES-RES] Status annulation:', response.status);

              if (!response.ok) {
                const errorText = await response.text();
                console.error('[MES-RES] Erreur reponse:', errorText);
                throw new Error(errorText || 'Erreur annulation');
              }

              const data = await response.json();
              console.log('[MES-RES] OK - Reservation annulee');

              Alert.alert('Succes', 'Reservation annulee');
              loadReservations();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Erreur';
              console.error('[MES-RES] ERREUR annulation:', message);
              Alert.alert('Erreur', message);
            } finally {
              setCancelling(null);
            }
          },
        },
      ]
    );
  };

  const handleSOS = async (reservation: any) => {
    Alert.alert(
      'ALERTE SOS',
      'Confirmez-vous vouloir envoyer une alerte d urgence?\n\nCela notifiera immediatement les administrateurs et le conducteur.',
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'OUI, ENVOYER SOS',
          onPress: async () => {
            try {
              setSossing(reservation.id);
              console.log('[MES-RES] Envoi SOS:', reservation.id);

              const url = `${API_BASE_URL}/api/reservations/${reservation.id}/sos`;
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              console.log('[MES-RES] Status SOS:', response.status);

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erreur SOS');
              }

              Alert.alert(
                'SOS Envoye!',
                'Votre alerte d urgence a ete envoyee!'
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Erreur';
              Alert.alert('Erreur', message);
            } finally {
              setSossing(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderReservation = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleReservationClick(item)}
      activeOpacity={0.8}
    >
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          marginBottom: 16,
          overflow: 'hidden',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Header Statut */}
        <View
          style={{
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
            {getStatusLabel(item.status)}
          </Text>
          <Ionicons
            name={item.status.toLowerCase() === 'confirmed' ? 'checkmark-circle' : 'time'}
            size={20}
            color="#fff"
          />
        </View>

        {/* Contenu */}
        <View style={{ padding: 16 }}>
          {/* Info Conducteur */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
            }}
          >
            <Image
              source={{ uri: getImageUrl(item.trip?.driver?.photo_url) }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#f0f0f0',
                borderWidth: 2,
                borderColor: '#D85A30',
              }}
            />

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937' }}>
                {item.trip?.driver?.name || 'Conducteur'}
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {item.trip?.driver?.phone || 'Pas de contact'}
              </Text>
            </View>

            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFB800', marginLeft: 4 }}>
              4.8
            </Text>
          </View>

          {/* Photo Vehicule */}
          {item.trip?.vehicle && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500', marginBottom: 8 }}>
                VEHICULE
              </Text>
              
              {/* ✅ AFFICHER PHOTO AVEC FALLBACK */}
              {item.trip.vehicle.photo_url ? (
                <View style={{ position: 'relative', marginBottom: 12 }}>
                  <Image
                    source={{ uri: getImageUrl(item.trip.vehicle.photo_url) }}
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 12,
                      backgroundColor: '#f0f0f0',
                    }}
                    onError={() => console.log('[MES-RES] Erreur chargement photo')}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                      {item.trip.vehicle.brand} {item.trip.vehicle.model}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 11, marginTop: 2 }}>
                      {item.trip.vehicle.license_plate || item.trip.vehicle.plate}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 12,
                    backgroundColor: '#f0f0f0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="car" size={40} color="#d1d5db" />
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    Pas de photo
                  </Text>
                </View>
              )}

              {/* Info Vehicule */}
              <View
                style={{
                  backgroundColor: '#FBF6EF',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: '#D85A30',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#1f2937' }}>
                  {item.trip.vehicle.brand} {item.trip.vehicle.model}
                </Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Plaque: {item.trip.vehicle.license_plate || item.trip.vehicle.plate}
                </Text>
                {item.trip.vehicle.color && (
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                    Couleur: {item.trip.vehicle.color}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Timeline Trajet */}
          <View style={{ marginBottom: 16 }}>
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
                    height: 50,
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
                <View style={{ marginBottom: 50 }}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                    DEPART
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#1f2937',
                      marginTop: 2,
                    }}
                    numberOfLines={2}
                  >
                    {item.trip?.departure_location || 'N/A'}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                    ARRIVEE
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#1f2937',
                      marginTop: 2,
                    }}
                    numberOfLines={2}
                  >
                    {item.trip?.arrival_location || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ✅ Infos Rapides - PRIX EN CFA */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: '#FBF6EF',
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="calendar" size={16} color="#D85A30" />
              <Text style={{ fontSize: 10, color: '#1f2937', fontWeight: '600', marginTop: 4 }}>
                {item.trip?.departure_time?.split('T')[0] || 'N/A'}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Ionicons name="time" size={16} color="#D85A30" />
              <Text style={{ fontSize: 10, color: '#1f2937', fontWeight: '600', marginTop: 4 }}>
                {item.trip?.departure_time?.split('T')[1]?.slice(0, 5) || 'N/A'}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Ionicons name="people" size={16} color="#D85A30" />
              <Text style={{ fontSize: 10, color: '#1f2937', fontWeight: '600', marginTop: 4 }}>
                {item.number_of_seats || 0} place{item.number_of_seats > 1 ? 's' : ''}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#D85A30' }}>
                {formatPrice((item.trip?.price_per_seat || 0) * (item.number_of_seats || 0))}
              </Text>
              <Text style={{ fontSize: 9, color: '#9ca3af' }}>Total</Text>
            </View>
          </View>

          {/* Boutons Action */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#378ADD',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6, fontSize: 12 }}>
                Appeler
              </Text>
            </TouchableOpacity>

            {/* SOS */}
            <TouchableOpacity
              onPress={() => handleSOS(item)}
              disabled={sossing === item.id}
              style={{
                flex: 1,
                backgroundColor: '#DC2626',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#EF4444',
                opacity: sossing === item.id ? 0.7 : 1,
              }}
            >
              {sossing === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="alert-circle" size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 6, fontSize: 12 }}>
                    SOS
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* ANNULER */}
            <TouchableOpacity
              onPress={() => handleAnnuler(item.id)}
              disabled={cancelling === item.id}
              style={{
                flex: 1,
                backgroundColor: '#EF4444',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                opacity: cancelling === item.id ? 0.7 : 1,
              }}
            >
              {cancelling === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6, fontSize: 12 }}>
                    Annuler
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && reservations.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D85A30" />
          <Text style={{ marginTop: 16, color: '#9ca3af', fontSize: 14 }}>
            Chargement de vos reservations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>
          Mes Reservations
        </Text>
        <Text style={{ fontSize: 14, color: '#9ca3af' }}>
          {reservations.length} reservation{reservations.length > 1 ? 's' : ''}
        </Text>
      </View>

      {reservations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="bookmark-outline" size={56} color="#D1D5DB" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#6b7280', marginTop: 16 }}>
            Aucune reservation
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
            Reservez un trajet pour l ajouter ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderReservation}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}