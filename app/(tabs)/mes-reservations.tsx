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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://12.0.3.9:8000';

// ✅ CORRECTION IP: Ajouter le .replace() pour l'ancienne IP
const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/100?text=User';
  
  // ✅ CORRECTION IP: 12.0.13.180 → 12.0.3.9
  if (url.includes('12.0.13.180')) {
    return url.replace('12.0.13.180', '12.0.3.9');
  }
  
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
    case 'accepted':
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
    accepted: 'Confirmee',
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

  // ✅ NOUVEAU: Gestion du formulaire d'avis
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedReservationForReview, setSelectedReservationForReview] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // ✅ NOUVEAU: Ouvrir le formulaire d'avis
  const handleOpenReviewForm = (reservation: any) => {
    console.log('[MES-RES] Ouverture formulaire avis:', reservation.id);
    console.log('[MES-RES] Reservation complète:', JSON.stringify(reservation, null, 2));
    
    setSelectedReservationForReview(reservation);
    setRating(0);
    setComment('');
    setReviewModalVisible(true);
  };

  // ✅ NOUVEAU: Soumettre l'avis
  const handleSubmitReview = async () => {
    if (!selectedReservationForReview || rating === 0) {
      Alert.alert('Erreur', 'Veuillez noter le conducteur');
      return;
    }

    try {
      setSubmittingReview(true);

      const storedToken = token || (await AsyncStorage.getItem('userToken'));

      if (!storedToken) {
        Alert.alert('Erreur', 'Pas de token');
        return;
      }

      console.log('\n🔵 ===== DEBUG REVIEW SUBMISSION =====');
      console.log('[REVIEW] selectedReservationForReview ID:', selectedReservationForReview.id);
      console.log('[REVIEW] selectedReservationForReview.trip:', selectedReservationForReview.trip);
      console.log('[REVIEW] selectedReservationForReview.trip?.driver_id:', selectedReservationForReview.trip?.driver_id);
      console.log('[REVIEW] selectedReservationForReview.trip?.driver:', selectedReservationForReview.trip?.driver);
      console.log('[REVIEW] selectedReservationForReview.trip?.driver?.id:', selectedReservationForReview.trip?.driver?.id);

      // ✅ CHERCHER le driver_id à différents endroits
      let driver_id = 
        selectedReservationForReview.trip?.driver_id ||
        selectedReservationForReview.trip?.driver?.id ||
        selectedReservationForReview.driver_id;

      console.log('[REVIEW] Driver ID final:', driver_id);

      if (!driver_id) {
        console.error('[REVIEW] ❌ ERREUR: driver_id introuvable!');
        console.error('[REVIEW] Structure complète:', JSON.stringify(selectedReservationForReview, null, 2));
        Alert.alert('Erreur', 'Impossible de trouver le conducteur');
        return;
      }

      const payloadData = {
        reservation_id: selectedReservationForReview.id,
        driver_id: driver_id,
        rating: rating,
        comment: comment.trim() || 'Pas de commentaire',
      };

      console.log('[REVIEW] 🔵 Envoi de l\'avis...');
      console.log('[REVIEW] 📝 Payload complet:', JSON.stringify(payloadData, null, 2));
      console.log('[REVIEW] 📝 Type reservation_id:', typeof payloadData.reservation_id);
      console.log('[REVIEW] 📝 Type driver_id:', typeof payloadData.driver_id);
      console.log('[REVIEW] 📝 Type rating:', typeof payloadData.rating);
      console.log('[REVIEW] 📝 Type comment:', typeof payloadData.comment);

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      });

      console.log(`[REVIEW] 📩 Status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('[REVIEW] ❌ Erreur détail:', errorData);
          errorMessage = errorData.detail || 
                        (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)) ||
                        errorData.message || 
                        errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          console.error('[REVIEW] ❌ Erreur text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[REVIEW] ✅ Avis créé avec succès:', data);
      console.log('🔵 ===== FIN DEBUG =====\n');

      Alert.alert('Succès', 'Votre avis a été posté!', [
        {
          text: 'OK',
          onPress: () => {
            setReviewModalVisible(false);
            setSelectedReservationForReview(null);
            loadReservations();
          },
        },
      ]);
    } catch (err) {
      // ✅ GÉRER CORRECTEMENT LES ERREURS
      let errorMessage = 'Erreur inconnue';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('[REVIEW] 🔴 Erreur complète:', err);
      console.error('[REVIEW] 🔴 Message parsé:', errorMessage);
      console.log('🔵 ===== FIN DEBUG (ERREUR) =====\n');
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderReservation = ({ item }: any) => {
    const isAccepted = item.status.toLowerCase() === 'confirmed' || item.status.toLowerCase() === 'accepted';

    return (
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
              name={isAccepted ? 'checkmark-circle' : 'time'}
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
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: isAccepted ? 12 : 0 }}>
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

            {/* ✅ NOUVEAU: Bouton "Laisser un avis" - SEULEMENT SI ACCEPTÉE */}
            {isAccepted && (
              <TouchableOpacity
                onPress={() => handleOpenReviewForm(item)}
                style={{
                  backgroundColor: '#D85A30',
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="star-outline" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 14 }}>
                  Laisser un avis
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

      {/* ✅ MODAL: Formulaire d'avis */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="chevron-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937' }}>
                Laisser un avis
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Info Conducteur */}
            {selectedReservationForReview && (
              <>
                <View style={{
                  backgroundColor: '#FFF',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: '#E8D5C4',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#DCFCE7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons name="person" size={24} color="#0F6E56" />
                  </View>
                  <View>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#1F2937' }}>
                      {selectedReservationForReview.trip?.driver?.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                      {selectedReservationForReview.trip?.departure_location} → {selectedReservationForReview.trip?.arrival_location}
                    </Text>
                  </View>
                </View>

                {/* Rating */}
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F6E56', marginBottom: 16, textTransform: 'uppercase' }}>
                  Votre note
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={44}
                        color={star <= rating ? "#FFB800" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {rating > 0 && (
                  <Text style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#0F6E56',
                    marginBottom: 24,
                    fontWeight: '600',
                  }}>
                    {rating} / 5 étoiles
                  </Text>
                )}

                {/* Comment */}
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F6E56', marginBottom: 12, textTransform: 'uppercase' }}>
                  Commentaire (optionnel)
                </Text>

                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E8D5C4',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 14,
                    color: '#1F2937',
                    backgroundColor: '#FFF',
                    height: 120,
                    textAlignVertical: 'top',
                    marginBottom: 24,
                  }}
                  placeholder="Partagez votre expérience..."
                  placeholderTextColor="#9CA3AF"
                  value={comment}
                  onChangeText={setComment}
                  editable={!submittingReview}
                  multiline
                />

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={rating === 0 || submittingReview}
                  style={{
                    backgroundColor: rating > 0 && !submittingReview ? '#D85A30' : '#D4C5B9',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginBottom: 12,
                    opacity: submittingReview ? 0.6 : 1,
                  }}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>
                      Publier l'avis
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={() => setReviewModalVisible(false)}
                  disabled={submittingReview}
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: submittingReview ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: '#1F2937', fontWeight: '700', fontSize: 16 }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
